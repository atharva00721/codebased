"use server";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { initializeRepositoryRAG, queryRepositoryRAG } from "@/lib/rag";

export async function checkRagInitializationStatus(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    // Check if the project exists and has embeddings
    const project = await db.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        _count: {
          select: {
            sourceCodeEmbeddings: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Consider the project initialized if it has at least one embedding
    const initialized = project._count.sourceCodeEmbeddings > 0;

    return {
      initialized,
      embeddingsCount: project._count.sourceCodeEmbeddings,
    };
  } catch (error) {
    console.error("Error checking initialization status:", error);
    throw error;
  }
}

// Define interfaces for better typing
interface SourceSegment {
  segment?: string;
  lineStart?: number;
  lineEnd?: number;
}

interface SourceCodeData {
  fileName?: string;
  sourceCode?: string;
  relevantSegments?: SourceSegment[];
  similarity: number;
}

// Helper to ensure source code is included in the response
const enhanceSourceSegments = async (sources: SourceCodeData[]) => {
  if (!sources || !sources.length) return sources;

  // For each source, ensure we're sending the source code
  return await Promise.all(
    sources.map(async (source) => {
      if (!source.sourceCode && source.fileName) {
        // If there's no sourceCode property but we have the fileName,
        // try to fetch it from the database
        try {
          const sourceEmbedding = await db.sourceCodeEmbedding.findFirst({
            where: {
              fileName: source.fileName,
            },
            select: {
              sourceCode: true,
            },
          });

          if (sourceEmbedding?.sourceCode) {
            source.sourceCode = sourceEmbedding.sourceCode;
          }
        } catch (error) {
          console.error("Failed to fetch source code:", error);
        }
      }

      // Ensure relevantSegments exists and has valid segment properties
      if (source.relevantSegments) {
        source.relevantSegments = source.relevantSegments.map(
          (segment: SourceSegment) => {
            // If segment doesn't have content but we have the source code and line numbers
            if (
              !segment.segment &&
              source.sourceCode &&
              typeof segment.lineStart === "number" &&
              typeof segment.lineEnd === "number"
            ) {
              // Extract the relevant lines from the source code
              const lines = source.sourceCode.split("\n");
              const extractedLines = lines.slice(
                segment.lineStart - 1,
                segment.lineEnd
              );
              segment.segment = extractedLines.join("\n");
            }
            return segment;
          }
        );
      }

      return source;
    })
  );
};

export async function initializeRepositoryRagAction(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Use the actual repository initialization function
    const result = await initializeRepositoryRAG(projectId);

    return {
      success: result.success,
      newEmbeddings: result.newEmbeddings,
      embeddingsCount: result.embeddingsCount,
      message: result.message,
    };
  } catch (error) {
    console.error("Failed to initialize repository:", error);
    throw new Error(
      `Failed to initialize repository: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function queryRepositoryRagAction(
  projectId: string,
  query: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const result = await queryRepositoryRAG(projectId, query);

    // Process the sources in the result to enhance them with full source code
    if (result.sources) {
      // Type assertion to ensure TypeScript knows the structure
      const enhancedSources = await enhanceSourceSegments(
        result.sources as unknown as SourceCodeData[]
      );

      // Ensure we preserve the required properties in the result
      result.sources = enhancedSources.map((source) => ({
        fileName: source.fileName || "",
        similarity: source.similarity,
        sourceCode: source.sourceCode,
        relevantSegments: source.relevantSegments,
      }));
    }

    return result;
  } catch (error) {
    console.error("Error processing query:", error);
    throw new Error(
      `Failed to process query: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
