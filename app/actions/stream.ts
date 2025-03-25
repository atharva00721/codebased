"use server";

import { db } from "@/server/db";
import { searchSimilarCode } from "@/lib/github";
import { clearChatHistory, streamGeminiResponse } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";

/**
 * Server action to stream AI responses with relevant code snippets
 */
export async function streamRagResponse(formData: {
  projectId: string;
  query: string;
  messageHistory?: { role: string; content: string }[];
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { projectId, query, messageHistory } = formData;

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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (!responseStream.stream) {
            controller.close();
            return;
          }

          for await (const chunk of responseStream.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }

          // Send sources as a special message at the end
          const sourcesData = JSON.stringify(relevantSources);
          controller.enqueue(encoder.encode(`__SOURCES__:${sourcesData}`));

          controller.close();
        } catch (error) {
          console.error("Error in stream:", error);
          controller.error(error);
        }
      },
    });

    return stream;
  } catch (error) {
    console.error("Stream action error:", error);
    throw error;
  }
}

export async function clearChatAction(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    // Clear chat history using the existing function
    await clearChatHistory(projectId);

    return { success: true };
  } catch (error) {
    console.error("Error clearing chat:", error);
    throw error;
  }
}
