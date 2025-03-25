import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import * as dotenv from "dotenv";

// Initialize Gemini AI
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Store chat sessions by project ID with LRU mechanism to prevent memory leaks
const MAX_CHAT_SESSIONS = 100;
class LRUChatSessions {
  private sessions: Map<string, ReturnType<typeof model.startChat>>;
  private maxSize: number;

  constructor(maxSize = MAX_CHAT_SESSIONS) {
    this.sessions = new Map();
    this.maxSize = maxSize;
  }

  get(key: string) {
    if (!this.sessions.has(key)) return undefined;

    // Access makes this entry the most recently used
    const value = this.sessions.get(key);
    if (value) {
      this.sessions.delete(key);
      this.sessions.set(key, value);
    }

    return value;
  }

  set(key: string, value: ReturnType<typeof model.startChat>) {
    // If key exists, refresh it
    if (this.sessions.has(key)) {
      this.sessions.delete(key);
    }
    // If we're at capacity, remove the oldest item
    else if (this.sessions.size >= this.maxSize) {
      const oldestKey = this.sessions.keys().next().value;
      if (oldestKey) this.sessions.delete(oldestKey);
    }

    this.sessions.set(key, value);
  }

  has(key: string) {
    return this.sessions.has(key);
  }

  delete(key: string) {
    return this.sessions.delete(key);
  }

  clear() {
    this.sessions.clear();
  }
}

const chatSessions = new LRUChatSessions();

// Add rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10, // Maximum requests per minute
  interval: 60000, // 1 minute in milliseconds
  retryDelay: 15000, // 15 seconds delay when hitting rate limit
};

let requestCount = 0;
let lastRequestTime = Date.now();

// Add rate limiting helper
async function rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  if (now - lastRequestTime > RATE_LIMIT.interval) {
    // Reset counter after interval
    requestCount = 0;
    lastRequestTime = now;
  }

  if (requestCount >= RATE_LIMIT.maxRequests) {
    console.log("Rate limit reached, waiting...");
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT.retryDelay));
    return rateLimitedRequest(fn);
  }

  requestCount++;
  try {
    return await fn();
  } catch (error: any) {
    if (error?.status === 429) {
      console.log("Rate limit exceeded, retrying after delay...");
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT.retryDelay)
      );
      return rateLimitedRequest(fn);
    }
    throw error;
  }
}

/**
 * Summarize Git Commit Diffs using Gemini AI
 * @param diff - The git diff string to be summarized
 * @returns A concise summary of the commit changes
 */
export const AISummarizeCommits = async (diff: string): Promise<string> => {
  try {
    const response = await rateLimitedRequest(() =>
      model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff.

Reminders about the git diff format:

For every file, there was a few metadata lines, like (for example):

\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
a/lib/index.js
+++ b/lib/index.js
\`\`\`

This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.

Then there is a specifier of the lines that were modified.

A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.

EXAMPLE SUMMARY COMMENTS:
- Raised the amount of returned recordings from \`10\` to \`100\`
- Fixed a typo in the github action name
- Moved the \`octokit\` initialization to a separate file
- Added an OpenAI API for completions
- Lowered numeric tolerance for test files

Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.

Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`,
        `Please summarize the following diff files:\n\n${diff}`,
      ])
    );

    const summary = response.response.text();
    console.log("Commit Diff Summary:", summary);
    return summary || "No summary available";
  } catch (error) {
    console.error("Error summarizing commit diff:", error);
    return "Failed to generate commit summary - Rate limit exceeded";
  }
};

/**
 * Summarize Source Code using Gemini AI
 * @param doc - A Document containing source code to be summarized
 * @returns A concise summary of the code
 */
export const summariseCode = async (doc: Document): Promise<string> => {
  try {
    console.log("Summarizing code for: ", doc.metadata.src);

    // Limit code to first 10000 characters
    const code = doc.pageContent.slice(0, 10000);

    const response = await rateLimitedRequest(() =>
      model.generateContent([
        `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.`,
        `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.src} file

        here is the code:


----


        ${code}


----



        Give a summary no more than 100 words of above code`,
      ])
    );

    const summary = response.response.text();
    console.log("Code Summary:", summary);
    return summary || "No summary available";
  } catch (error) {
    console.error("Error summarizing code:", error);
    return "Failed to generate code summary";
  }
};

/**
 * Generate Embedding for a given summary
 * @param summary - Text to generate embedding for
 * @returns An array of embedding values
 */
export async function generateEmbedding(summary: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const result = await rateLimitedRequest(() =>
      embeddingModel.embedContent(summary)
    );
    const embedding = result.embedding;

    return embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

/**
 * Stream response from Gemini AI using RAG results with chat history context
 * @param query The user's query
 * @param contextDocuments Array of relevant context documents
 * @param projectId Project ID to maintain conversation context
 * @returns A ReadableStream for streaming the response
 */
export async function streamGeminiResponse(
  query: string,
  contextDocuments: { fileName: string; sourceCode: string }[],
  projectId: string
  // Not using messageHistory but keeping parameter for API compatibility
  // _messageHistory: { role: string; content: string }[] = []
) {
  try {
    // Format context documents into a prompt
    const contextText = contextDocuments
      .map((doc, index) => {
        if (!doc.sourceCode) return "";
        return `Context ${index + 1} from file "${doc.fileName}":\n${
          doc.sourceCode.substring(0, 2500) // Limit context size for better performance
        }\n\n`;
      })
      .filter(Boolean) // Remove empty entries
      .join("\n");

    let chat;

    // Check if we have an existing chat session for this project
    if (!chatSessions.has(projectId)) {
      // Initialize a new chat session
      //       const systemPromptContent = `You are an AI programming assistant that helps developers understand their codebase.
      // Answer questions based on the provided code context.
      // If you don't know the answer or the context doesn't contain relevant information, say so.
      // Keep your responses concise and focused on the code.`;

      chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: "Hello, I need help understanding my codebase and the project as a whole.",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "I'm ready to help you understand your codebase. What would you like to know?",
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 3048,
          temperature: 0.4,
          topP: 0.8,
        },
      });

      chatSessions.set(projectId, chat);
    } else {
      chat = chatSessions.get(projectId);
    }

    // Add context to the query
    const contextualQuery = contextText
      ? `Based on the following code context:\n${contextText}\n\nMy question is: ${query}`
      : `My question is about the codebase: ${query}`;

    // Send message to chat and get streaming response
    if (!chat) {
      throw new Error("Failed to initialize or retrieve chat session");
    }

    const response = await chat.sendMessageStream(contextualQuery);

    return response;
  } catch (error) {
    console.error("Error streaming response from Gemini:", error);
    throw error;
  }
}

/**
 * Clear chat history for a specific project
 * @param projectId Project ID to clear chat history for
 */
export function clearChatHistory(projectId: string) {
  if (chatSessions.has(projectId)) {
    chatSessions.delete(projectId);
  }
}

// Optional: Uncomment and modify if needed
// export const summarizeCodebase = async (contents: string) => {
//   const response = await model.generateContent([
//     `Summarize this code.\n\nOriginal file contents:\n\n${contents}`
//   ]);
//   return response.response.text();
// };

// Test AISummarizeCommits
// const testDiff = `diff --git a/test.js b/test.js
// index abc..def 100644
// --- a/test.js
// +++ b/test.js
// @@ -1,3 +1,3 @@
// -console.log("old");
// +console.log("new");
// `;

// console.log("\n=== Testing AISummarizeCommits ===");
// AISummarizeCommits(testDiff)
//   .then(summary => console.log("Commit Summary:", summary))
//   .catch(err => console.error("Error:", err));

// // Test summariseCode
// const testDoc = new Document({
//   pageContent: `function hello() {
//     console.log("Hello World!");
//   }`,
//   metadata: { src: "test.js" }
// });

// console.log("\n=== Testing summariseCode ===");
// summariseCode(testDoc)
//   .then(summary => console.log("Code Summary:", summary))
//   .catch(err => console.error("Error:", err));

// // Test generateEmbedding
// const testSummary = "This is a test summary for embedding generation";

// console.log("\n=== Testing generateEmbedding ===");
// generateEmbedding(testSummary)
//   .then(embedding => console.log("Embedding (first 5 values):", embedding.slice(0, 5)))
//   .catch(err => console.error("Error:", err));
