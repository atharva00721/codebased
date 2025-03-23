import { db } from "@/server/db";
import { generateEmbedding } from "./gemini";
import { searchSimilarCode } from "./github";

/**
 * RAG query system for GitHub repositories
 * @param projectId - The ID of the project to search
 * @param query - The user's query
 * @returns Relevant code snippets and explanations
 */
export async function queryRepositoryRAG(projectId: string, query: string) {
  try {
    interface SimilarContent {
      fileName?: string;
      sourceCode?: string;
      similarity: string;
    }

    // 1. Find similar code based on embeddings
    const similarContent = (await searchSimilarCode(
      projectId,
      query,
      3
    )) as SimilarContent[];

    if (!similarContent || !similarContent.length) {
      return {
        answer: "No relevant code found for your query.",
        sources: [],
      };
    }

    // 2. Format context from similar content
    const context = similarContent.map((item) => {
      const fileName = item.fileName || "";
      const sourceCode = item.sourceCode || "";
      const similarity = parseFloat(item.similarity) || 0;

      return {
        fileName,
        snippet: sourceCode.substring(0, 1000), // First 1000 chars
        similarity,
      };
    });

    // 3. Use Gemini to generate answer based on retrieved context
    interface ContextItem {
      fileName: string;
      snippet: string;
      similarity: number;
    }

    const contextText: string = context
      .map(
        (item: ContextItem) => `File: ${item.fileName}\n\n${item.snippet}\n\n`
      )
      .join("\n---\n");

    // Return the results
    interface RAGResponse {
      answer: string;
      sources: Array<{
        fileName: string;
        similarity: number;
      }>;
    }

    interface RAGSource {
      fileName: string;
      similarity: number;
    }

    return {
      answer: await generateAnswerFromContext(query, contextText),
      sources: context.map(
        (item): RAGSource => ({
          fileName: item.fileName,
          similarity: item.similarity,
        })
      ),
    } as RAGResponse;
  } catch (error) {
    console.error("Error executing RAG query:", error);
    throw error;
  }
}

async function generateAnswerFromContext(query: string, context: string) {
  // Use existing Gemini instance from gemini.ts
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || "AIzaSyCHGqbXMZWMHYZc9AuSdaaJY09VJqna2Zw"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const response = await model.generateContent([
      `You are a helpful coding assistant that helps developers understand codebases.
      Based on the following code context, please answer the user's question concisely.
      
      Follow these guidelines:
      1. Focus on the most relevant parts of the code to answer the query
      2. Explain the implementation rather than just describing what code exists
      3. If specific functions or classes are mentioned in the query, prioritize explaining them
      4. When referencing code, specify the file name
      5. Be specific about how different parts of the code interact
      6. If the answer requires explaining a workflow, describe it step-by-step
      7. Include brief code examples when helpful
      8. If important information seems missing, acknowledge this limitation
      
      CODE CONTEXT:
      ${context}
      
      USER QUESTION: ${query}`,
    ]);

    return (
      response.response.text() ||
      "Could not generate an answer based on the available code."
    );
  } catch (error) {
    console.error("Error generating answer:", error);
    return "Failed to generate an answer. Please try again with a different query.";
  }
}

/**
 * Get related code files by code similarity
 * @param projectId - Project ID to search within
 * @param filePath - Path of the file to find related files for
 * @returns - Array of related files with similarity scores
 */
export async function getRelatedFiles(projectId: string, filePath: string) {
  try {
    // First get the embedding for the specified file
    const fileData = await db.$queryRaw`
      SELECT "fileName", "summaryEmbedding" 
      FROM "SourceCodeEmbedding" 
      WHERE "projectId" = ${projectId} AND "fileName" = ${filePath}
      LIMIT 1
    `;

    if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
      throw new Error(`File ${filePath} not found or has no embedding`);
    }

    const fileEmbedding = fileData[0]?.summaryEmbedding;

    if (!fileEmbedding) {
      throw new Error(`No embedding found for file ${filePath}`);
    }

    // Find similar files using cosine similarity
    const similarFiles = await db.$queryRaw`
      SELECT 
        "fileName", 
        1 - ("summaryEmbedding" <=> ${fileEmbedding}::vector(768)) as similarity
      FROM 
        "SourceCodeEmbedding"
      WHERE 
        "projectId" = ${projectId}
        AND "fileName" != ${filePath}
      ORDER BY 
        "summaryEmbedding" <=> ${fileEmbedding}::vector(768)
      LIMIT 5
    `;

    return similarFiles;
  } catch (error) {
    console.error("Error finding related files:", error);
    return [];
  }
}

/**
 * Initialize repository for RAG by processing content and creating embeddings
 * @param projectId - The ID of the project to initialize
 */
export async function initializeRepositoryRAG(projectId: string) {
  try {
    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Check if repository already has embeddings - use raw query
    interface CountResult {
      count: number | bigint;
    }
    const countResult = await db.$queryRaw<CountResult[]>`
      SELECT COUNT(*) as count FROM "SourceCodeEmbedding" 
      WHERE "projectId" = ${projectId}
    `;
    const existingEmbeddings = Number(countResult[0]?.count || 0);

    if (existingEmbeddings > 0) {
      console.log(`Project already has ${existingEmbeddings} embeddings`);

      // Optionally clear existing embeddings
      const shouldClear = false; // Set to true if you want to clear existing embeddings
      if (shouldClear) {
        console.log("Clearing existing embeddings...");
        await db.$executeRaw`
          DELETE FROM "SourceCodeEmbedding" 
          WHERE "projectId" = ${projectId}
        `;
        console.log("Existing embeddings cleared.");
      }
    }

    // Fix the circular dependency by using dynamic import
    try {
      // Import the GitHub module dynamically to avoid circular dependency
      const github = await import("./github");

      // Process repository content using the dynamically imported function
      await github.processRepositoryForRAG(project.githubUrl, projectId);
    } catch (processingError) {
      console.error("Error during repository processing:", processingError);
      // Continue execution to return partial success info
    }

    // Count again after processing
    const newCountResult = await db.$queryRaw<CountResult[]>`
      SELECT COUNT(*) as count FROM "SourceCodeEmbedding" 
      WHERE "projectId" = ${projectId}
    `;
    const newCount = Number(newCountResult[0]?.count || 0);

    return {
      success: true,
      message: "Repository initialized for RAG",
      embeddingsCount: newCount,
      newEmbeddings: Math.max(0, newCount - existingEmbeddings),
    };
  } catch (error) {
    console.error("Error initializing repository for RAG:", error);
    throw error;
  }
}
