"use server";

import { db } from "@/server/db";
import { searchSimilarCode } from "@/lib/github";
import { streamGeminiResponse } from "@/lib/gemini";

/**
 * Server action to stream AI responses with relevant code snippets
 */
export async function streamRagResponse(formData: {
  projectId: string;
  query: string;
}) {
  try {
    const { projectId, query } = formData;

    if (!projectId || !query) {
      throw new Error("Missing required parameters");
    }

    // Check if project exists with an optimized query
    const projectExists = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true }, // Only select the ID field for faster query
    });

    if (!projectExists) {
      throw new Error("Project not found");
    }

    // Find relevant source code using embeddings
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

    // Server actions don't use StreamingTextResponse
    // Instead, they return data directly to the client
    // Create a ReadableStream that we'll return from the action
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (!responseStream.stream) {
            controller.close();
            return;
          }

          // Stream the AI response
          for await (const chunk of responseStream.stream) {
            controller.enqueue(encoder.encode(chunk.text()));
          }

          // After streaming content, send sources as a special message
          const sourcesData = JSON.stringify(relevantSources);
          controller.enqueue(encoder.encode(`__SOURCES__:${sourcesData}`));

          controller.close();
        } catch (error) {
          console.error("Error processing stream:", error);
          controller.error(error);
        }
      },
    });

    // Return the stream directly from the server action
    // The client will need to handle this appropriately
    return stream;
  } catch (error) {
    console.error("Stream action error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to process streaming request"
    );
  }
}
