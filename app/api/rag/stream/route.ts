import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { searchSimilarCode } from "@/lib/github";
import { streamGeminiResponse } from "@/lib/gemini";

export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const { projectId, query, messageHistory = [] } = await req.json();

    if (!projectId || !query) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check if project exists with a more optimized query
    const projectExists = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true }, // Only select the ID field for faster query
    });

    if (!projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Find relevant source code using embeddings (limit to 3 for better performance)
    const relevantSources = await searchSimilarCode(projectId, query, 3);

    // Map to the expected format for streamGeminiResponse
    const formattedSources = relevantSources.map((source) => ({
      fileName: source.fileName,
      sourceCode: source.sourceCode || "", // Ensure sourceCode is always a string
    }));

    // Create a stream from Gemini with chat history
    const responseStream = await streamGeminiResponse(
      query,
      formattedSources,
      projectId
    );

    // Set up an optimized streaming response
    const encoder = new TextEncoder();

    // Create a TransformStream for more efficient processing
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        controller.enqueue(encoder.encode(chunk));
      },
    });

    // Process in background and pipe to transform stream
    (async () => {
      try {
        if (!responseStream.stream) {
          transformStream.writable.getWriter().close();
          return;
        }

        // Efficiently process the stream
        const writer = transformStream.writable.getWriter();

        // Stream the AI response
        for await (const chunk of responseStream.stream) {
          await writer.write(chunk.text());
        }

        // After streaming content, send sources as a special message
        const sourcesData = JSON.stringify(relevantSources);
        await writer.write(`__SOURCES__:${sourcesData}`);

        writer.close();
      } catch (error) {
        console.error("Error processing stream:", error);
        transformStream.writable.abort(error);
      }
    })();

    // Return the optimized stream
    return new Response(transformStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return NextResponse.json(
      { error: "Failed to process streaming request" },
      { status: 500 }
    );
  }
}
