import { initializeRepositoryRAG, queryRepositoryRAG } from "./lib/rag";
import {
  createUniqueId,
  processRepositoryForRAG,
  searchSimilarCode,
} from "./lib/github";
import { generateEmbedding } from "./lib/gemini";
import { db } from "./server/db";

// ============== CONFIGURATION VARIABLES =================
// Edit these values to match your environment
const CONFIG = {
  // Project ID from your database
  projectId: "cm8kyfkhx0000dlwsm12w6yms",

  // GitHub repository URL
  githubUrl: "https://github.com/atharva00721/AetherConnect",

  // Test queries for RAG
  queries: {
    auth: "what api's are user here in this?",
    terminal: "how it schedules meeting?",
    database: "What database operations are performed in this codebase?",
  },

  // Test file information
  testFile: {
    path: "test-file.js",
    content: "function hello() { console.log('Hello World!'); }",
  },

  // Control test execution
  runTests: {
    initialization: true,
    embedding: true,
    singleFile: true,
    repository: true,
    ragQuery: true,
    databaseOps: true,
  },
};
// =====================================================

// Define proper interfaces for type safety
interface SimilarCodeItem {
  id: string;
  fileName: string;
  sourceCode: string;
  summary: string;
  similarity: number;
}

/**
 * Main test execution function
 */
async function runAllTests() {
  console.log("\n========== GITHUB RAG TESTING SUITE ==========");
  console.log(`Project ID: ${CONFIG.projectId}`);
  console.log(`GitHub URL: ${CONFIG.githubUrl}`);

  const results = {
    embedding: false,
    initialization: false,
    singleFile: false,
    repository: false,
    ragQuery: false,
    databaseOps: false,
  };

  try {
    // Test embedding generation
    if (CONFIG.runTests.embedding) {
      results.embedding = await testEmbeddingGeneration();
    }

    // Test initialization
    if (CONFIG.runTests.initialization) {
      results.initialization = await testInitialization();
    }

    // Test single file processing
    if (CONFIG.runTests.singleFile) {
      results.singleFile = await testSingleFileProcessing();
    }

    // Test repository processing
    if (CONFIG.runTests.repository) {
      results.repository = await testRepositoryProcessing();
    }

    // Test RAG query
    if (CONFIG.runTests.ragQuery) {
      results.ragQuery = await testRagQuery(CONFIG.queries.auth);
    }

    // Test database operations
    if (CONFIG.runTests.databaseOps) {
      results.databaseOps = await testEmbeddingOperations();
    }

    // Print summary
    console.log("\n========== TEST RESULTS SUMMARY ==========");
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${test.padEnd(15)}: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
    });
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

/**
 * Test RAG initialization
 */
async function testInitialization() {
  console.log("\n=== Testing RAG Initialization ===");
  try {
    const result = await initializeRepositoryRAG(CONFIG.projectId);
    console.log("Repository initialized for RAG:");
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    console.log(`Embeddings Count: ${result.embeddingsCount}`);
    console.log(`New Embeddings: ${result.newEmbeddings}`);
    return result.success;
  } catch (err) {
    console.error("Error initializing RAG:", err);
    return false;
  }
}

/**
 * Test RAG query
 */
async function testRagQuery(query = CONFIG.queries.terminal) {
  console.log(`\n=== Testing RAG Query: "${query}" ===`);

  try {
    // Test searching similar code first
    console.log("\n--- Testing searchSimilarCode ---");
    const similarCode = (await searchSimilarCode(
      CONFIG.projectId,
      query,
      3
    )) as SimilarCodeItem[];

    console.log(`Found ${similarCode?.length || 0} similar code snippets`);

    if (similarCode && similarCode.length > 0) {
      console.log("Top match:");
      console.log(`File: ${similarCode[0]?.fileName || "Unknown"}`);
      console.log(`Similarity: ${similarCode[0]?.similarity || 0}`);

      // Fix the substring issue by ensuring summary is a string
      const summaryText =
        typeof similarCode[0]?.summary === "string"
          ? similarCode[0].summary
          : "";
      const summaryExcerpt =
        summaryText.length > 0
          ? summaryText.substring(0, 100) + "..."
          : "No summary available";

      console.log(`Summary excerpt: ${summaryExcerpt}`);
    }

    // Test full RAG query
    console.log("\n--- Testing queryRepositoryRAG ---");
    const response = await queryRepositoryRAG(CONFIG.projectId, query);

    console.log("RAG Query Response:");
    console.log(`Sources: ${response?.sources?.length || 0}`);

    if (response?.sources?.length) {
      response.sources.forEach((source, i) => {
        console.log(
          `Source ${i + 1}: ${source.fileName || "Unknown"} (similarity: ${
            typeof source.similarity === "number"
              ? source.similarity.toFixed(4)
              : "unknown"
          })`
        );
      });
    }

    console.log("\nAI Answer:");
    console.log(response?.answer || "No answer generated");

    return true;
  } catch (error) {
    console.error("Error testing RAG query:", error);
    return false;
  }
}

/**
 * Test embedding generation
 */
async function testEmbeddingGeneration() {
  console.log("\n=== Testing Embedding Generation ===");
  try {
    const embedding = await generateEmbedding(CONFIG.queries.auth);

    console.log(
      `Embedding generated with ${embedding?.length || 0} dimensions`
    );
    console.log("First 5 values:", embedding?.slice(0, 5) || []);

    return embedding && embedding.length > 0;
  } catch (err) {
    console.error("Error generating embedding:", err);
    return false;
  }
}

/**
 * Test processing repository
 */
async function testRepositoryProcessing() {
  console.log("\n=== Testing Repository Processing ===");
  console.log("This may take some time depending on repository size...");

  try {
    const result = await processRepositoryForRAG(
      CONFIG.githubUrl,
      CONFIG.projectId
    );
    console.log("Repository processing result:", result);
    return result && result.success;
  } catch (err) {
    console.error("Error processing repository:", err);
    return false;
  }
}

/**
 * Test single file processing
 */
async function testSingleFileProcessing() {
  console.log("\n=== Testing Single File Processing ===");
  try {
    // Create a sample file object
    const sampleFile = {
      path: CONFIG.testFile.path,
      type: "file",
    };

    // Generate a unique ID using the imported function
    const uniqueId = await createUniqueId(CONFIG.projectId, sampleFile.path);
    console.log(`Generated unique ID: ${uniqueId}`);

    // Generate sample embedding
    const embedding = await generateEmbedding(CONFIG.testFile.content);
    console.log(`Generated embedding with ${embedding.length} dimensions`);

    console.log("Single file processing test complete!");
    return true;
  } catch (error) {
    console.error("Error in single file processing test:", error);
    return false;
  }
}

/**
 * Test embedding database operations
 */
async function testEmbeddingOperations() {
  console.log("\n=== Testing Embedding Database Operations ===");
  try {
    // Generate a test embedding
    const testText = CONFIG.testFile.content;
    const embedding = await generateEmbedding(testText);

    if (!embedding || embedding.length === 0) {
      console.error("Failed to generate test embedding");
      return false;
    }

    console.log(`Generated test embedding with ${embedding.length} dimensions`);

    // Create a unique test ID
    const testId = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    try {
      // Try to insert the test record
      await db.$executeRaw`
        INSERT INTO "SourceCodeEmbedding" 
        ("id", "projectId", "fileName", "sourceCode", "summary", "summaryEmbedding", "createdAt", "updatedAt")
        VALUES (
          ${testId},
          ${CONFIG.projectId},
          ${CONFIG.testFile.path},
          ${CONFIG.testFile.content},
          ${"Test summary for database operations"},
          ${embedding}::vector,
          ${new Date()},
          ${new Date()}
        )
      `;

      console.log(`Successfully inserted test embedding with ID: ${testId}`);

      // Try to retrieve the record
      const result = await db.$queryRaw`
        SELECT "id", "fileName", 1 - ("summaryEmbedding" <=> ${embedding}::vector) as similarity
        FROM "SourceCodeEmbedding"
        WHERE "id" = ${testId}
        LIMIT 1
      `;

      console.log("Retrieved test record:", result);

      // Clean up test record
      await db.$executeRaw`DELETE FROM "SourceCodeEmbedding" WHERE "id" = ${testId}`;
      console.log("Test record deleted");

      return true;
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return false;
    }
  } catch (error) {
    console.error("Error in embedding operations test:", error);
    return false;
  }
}

// Run all tests
runAllTests();
