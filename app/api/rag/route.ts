import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { initializeRepositoryRAG, queryRepositoryRAG } from "@/lib/rag";

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
  similarity: number; // Added this required property
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

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, query, action } = await request.json();

    // Handle initialization action
    if (action === "initialize") {
      try {
        // Use the actual repository initialization function
        const result = await initializeRepositoryRAG(projectId);

        return NextResponse.json({
          success: result.success,
          newEmbeddings: result.newEmbeddings,
          embeddingsCount: result.embeddingsCount,
          message: result.message,
        });
      } catch (error) {
        console.error("Failed to initialize repository:", error);
        return NextResponse.json(
          { error: "Failed to initialize repository" },
          { status: 500 }
        );
      }
    }

    // For regular queries, use the actual queryRepositoryRAG function
    if (query) {
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
      return NextResponse.json(result);
    }

    // If neither initializing nor querying, return error
    return NextResponse.json(
      { error: "Invalid request - specify action or query" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
