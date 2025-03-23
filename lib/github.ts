import { Octokit } from "@octokit/rest";
import { db } from "@/server/db";
import { AISummarizeCommits, generateEmbedding } from "./gemini";
import { analyzeCodeFile, generateCodeSummary } from "./codeAnalyzer";

// Types
type CommitResponse = {
  projectId: string;
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: Date;
  summary: string;
};

// Utility functions
const RATE_LIMIT_DELAY = 1000; // 1 second
const BATCH_SIZE = 5;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithDelay(fn, retries - 1, delay * 2);
  }
};

// Create Octokit instance with token
function createOctokit(token?: string) {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  });
}

// Fetch commit diff
async function fetchCommitDiff(
  owner: string,
  repo: string,
  commitSha: string,
  token?: string
) {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: commitSha,
    });

    return (
      data.files
        ?.map(
          (file) => `
diff --git a/${file.filename} b/${file.filename}
${file.patch || ""}
    `
        )
        .join("\n") || ""
    );
  } catch (error) {
    console.error("Error fetching commit diff:", error);
    return "";
  }
}

// Fetch repository content
async function fetchRepositoryContent(
  owner: string,
  repo: string,
  path = "",
  token?: string
) {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    return data;
  } catch (error) {
    console.error("Error fetching repository content:", error);
    return [];
  }
}

// Process repository for RAG
export const processRepositoryForRAG = async (
  githubUrl: string,
  projectId: string,
  token?: string
) => {
  const octokit = createOctokit(token);
  try {
    const [owner, repo] = githubUrl.split("/").slice(-2);

    if (!owner || !repo) {
      throw new Error("Invalid GitHub URL");
    }

    // Recursive function to process all files in the repository
    const processDirectory = async (path = "") => {
      const contents = await fetchRepositoryContent(owner, repo, path, token);

      if (!Array.isArray(contents)) {
        return; // Single file was returned instead of directory
      }

      for (const item of contents) {
        // Add delay to respect API rate limits
        await delay(RATE_LIMIT_DELAY);

        if (item.type === "dir") {
          // Process subdirectory
          await processDirectory(item.path);
        } else if (item.type === "file" && shouldProcessFile(item.path)) {
          // Process file content
          await processFileContent(item, owner, repo, projectId, token);
        }
      }
    };

    // Start processing from root
    await processDirectory();
    return { success: true };
  } catch (error) {
    console.error("Error processing repository for RAG:", error);
    throw error;
  }
};

// Helper: Determine if file should be processed based on extension
function shouldProcessFile(path: string) {
  const codeExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".rb",
    ".go",
    ".java",
    ".php",
    ".cs",
  ];
  const extension = path.substring(path.lastIndexOf(".")).toLowerCase();
  return codeExtensions.includes(extension);
}

// Process file content and store its embedding
async function processFileContent(
  file: any,
  owner: string,
  repo: string,
  projectId: string,
  token?: string
) {
  const octokit = createOctokit(token);
  try {
    // Get file content
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: file.path,
      mediaType: {
        format: "raw",
      },
    });

    const content = typeof response.data === "string" ? response.data : "";
    if (!content) return;

    // Analyze the file content to extract metadata
    let summary = "";

    // Check if codeAnalyzer module is imported/available
    try {
      const {
        analyzeCodeFile,
        generateCodeSummary,
      } = require("./codeAnalyzer");
      const metadata = analyzeCodeFile(content, file.path);
      summary = generateCodeSummary(content, metadata, file.path);
      console.log(
        `Generated code summary for ${file.path} with metadata extraction`
      );
    } catch (analyzerError) {
      // Fallback to simple extraction if code analyzer fails
      console.log(
        `Using fallback summary generation for ${file.path}: ${analyzerError}`
      );
      const codeStructure = extractCodeStructure(content, file.path);
      summary = `File: ${
        file.path
      }\n\nStructure:\n${codeStructure}\n\nContent Preview:\n${content.substring(
        0,
        500
      )}`;
    }

    // Generate embedding for the summary
    console.log(`Generating embedding for ${file.path}`);
    const embedding = await generateEmbedding(summary);
    console.log(`Generated embedding with length: ${embedding.length}`);

    if (embedding.length === 0) {
      console.error(`Failed to generate embedding for ${file.path}`);
      return;
    }

    // Log the embeddings vector to check its format
    console.log(`Embedding type: ${typeof embedding}`);
    console.log(`First few values: ${embedding.slice(0, 3)}`);

    // Create a unique ID
    const uniqueId = await createUniqueId(projectId, file.path);

    try {
      // Insert/update the embedding using raw SQL to ensure vector format is correct
      await db.$executeRaw`
        INSERT INTO "SourceCodeEmbedding" 
        ("id", "projectId", "fileName", "sourceCode", "summary", "summaryEmbedding", "createdAt", "updatedAt")
        VALUES (
          ${uniqueId},
          ${projectId},
          ${file.path},
          ${content.substring(0, 10000)},
          ${summary},
          ${embedding}::vector(768),
          ${new Date()},
          ${new Date()}
        )
        ON CONFLICT ("id") DO UPDATE SET
          "sourceCode" = ${content.substring(0, 10000)},
          "summary" = ${summary},
          "summaryEmbedding" = ${embedding}::vector(768),
          "updatedAt" = ${new Date()}
      `;

      console.log(`Successfully stored embedding for ${file.path}`);
    } catch (sqlError) {
      console.error(`SQL error processing ${file.path}:`, sqlError);

      // Try with a random ID as last resort
      try {
        const randomId = `${projectId.substring(0, 8)}_${Math.random()
          .toString(36)
          .substring(2, 15)}`;

        await db.$executeRaw`
          INSERT INTO "SourceCodeEmbedding" 
          ("id", "projectId", "fileName", "sourceCode", "summary", "summaryEmbedding", "createdAt", "updatedAt")
          VALUES (
            ${randomId},
            ${projectId},
            ${file.path},
            ${content.substring(0, 10000)},
            ${summary},
            ${embedding}::vector(768),
            ${new Date()},
            ${new Date()}
          )
        `;

        console.log(
          `Last resort approach succeeded for ${file.path} with random ID`
        );
      } catch (lastError) {
        console.error(
          `Last resort approach also failed for ${file.path}:`,
          lastError
        );
      }
    }
  } catch (error) {
    console.error(`Error processing file ${file.path}:`, error);
  }
}

// Extract code structure from content
function extractCodeStructure(content: string, filePath: string): string {
  try {
    const extension = filePath
      .substring(filePath.lastIndexOf("."))
      .toLowerCase();
    let structure = [];

    // Extract function and class names based on file type
    if ([".ts", ".tsx", ".js", ".jsx"].includes(extension)) {
      // JavaScript/TypeScript patterns
      const functionMatches =
        content.match(/(?:function|const|let|var)\s+(\w+)\s*\([^)]*\)/g) || [];
      const arrowFunctionMatches =
        content.match(
          /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>/g
        ) || [];
      const classMatches = content.match(/class\s+(\w+)/g) || [];
      const importMatches =
        content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g) || [];

      // Add functions
      if (functionMatches.length) {
        structure.push("Functions:");
        functionMatches.slice(0, 5).forEach((match) => {
          const name = match.match(/(?:function|const|let|var)\s+(\w+)/) || [];
          if (name[1]) structure.push(`- ${name[1]}`);
        });
      }

      // Add arrow functions
      if (arrowFunctionMatches.length) {
        if (!structure.includes("Functions:")) structure.push("Functions:");
        arrowFunctionMatches.slice(0, 5).forEach((match) => {
          const name = match.match(/(?:const|let|var)\s+(\w+)/) || [];
          if (name[1]) structure.push(`- ${name[1]} (arrow)`);
        });
      }

      // Add classes
      if (classMatches.length) {
        structure.push("Classes:");
        classMatches.slice(0, 3).forEach((match) => {
          const name = match.match(/class\s+(\w+)/) || [];
          if (name[1]) structure.push(`- ${name[1]}`);
        });
      }

      // Add imports
      if (importMatches.length) {
        structure.push("Dependencies:");
        const uniqueImports = new Set();
        importMatches.forEach((match) => {
          const importPath = match.match(/from\s+['"]([^'"]+)['"]/) || [];
          if (importPath[1]) uniqueImports.add(importPath[1]);
        });

        Array.from(uniqueImports)
          .slice(0, 5)
          .forEach((importPath) => {
            structure.push(`- ${importPath}`);
          });
      }
    } else if ([".py"].includes(extension)) {
      // Python patterns
      const functionMatches = content.match(/def\s+(\w+)\s*\([^)]*\)/g) || [];
      const classMatches = content.match(/class\s+(\w+)/g) || [];
      const importMatches = content.match(/(?:import|from)\s+(\S+)/g) || [];

      // Similar processing for Python files...
      // ...
    }

    // If no structure was detected
    if (structure.length === 0) {
      structure.push("No structured elements detected");
    }

    return structure.join("\n");
  } catch (error) {
    console.error("Error extracting code structure:", error);
    return "Error extracting code structure";
  }
}

// Search similar code using embeddings - improved with chunking
export const searchSimilarCode = async (
  projectId: string,
  query: string,
  limit = 5
) => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    if (queryEmbedding.length === 0) {
      throw new Error("Failed to generate embedding for query");
    }

    // Explicitly cast the embedding to vector with proper dimensions
    const similarContent = await db.$queryRaw`
      SELECT 
        id, 
        "fileName", 
        "sourceCode", 
        summary,
        1 - ("summaryEmbedding" <=> ${queryEmbedding}::vector(768)) as similarity
      FROM 
        "SourceCodeEmbedding"
      WHERE 
        "projectId" = ${projectId}
      ORDER BY 
        "summaryEmbedding" <=> ${queryEmbedding}::vector(768)
      LIMIT ${limit}
    `;

    // Convert the similarity to a number for consistent typing
    const processedResults = Array.isArray(similarContent)
      ? similarContent.map((item) => ({
          ...item,
          similarity:
            typeof item.similarity === "string"
              ? parseFloat(item.similarity)
              : item.similarity,
        }))
      : [];

    // Enhance results with relevant line numbers and specific code segments
    const enhancedResults =
      processedResults.length > 0
        ? await Promise.all(
            processedResults.map(async (item: any) => {
              // Find the most relevant parts of the source code
              const relevantSegments = findRelevantCodeSegments(
                item.sourceCode || "",
                query
              );
              return {
                ...item,
                relevantSegments,
              };
            })
          )
        : [];

    return enhancedResults || [];
  } catch (error) {
    console.error("Error searching similar code:", error);
    return [];
  }
};

// Find most relevant segments of code based on query
function findRelevantCodeSegments(
  sourceCode: string,
  query: string
): Array<{ lineStart: number; lineEnd: number; segment: string }> {
  try {
    // Split the source code into lines
    const lines = sourceCode.split("\n");
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 3);
    const segments: Array<{
      lineStart: number;
      lineEnd: number;
      segment: string;
      score: number;
    }> = [];

    // Window size for context (lines before and after a match)
    const contextSize = 5;

    // Look for matches of query terms in the code
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      let matchScore = 0;

      // Check if line contains any query terms
      queryTerms.forEach((term) => {
        if (line.includes(term)) {
          matchScore += 1;
        }
      });

      if (matchScore > 0) {
        // Found a match, get context
        const lineStart = Math.max(0, i - contextSize);
        const lineEnd = Math.min(lines.length - 1, i + contextSize);

        const segment = lines.slice(lineStart, lineEnd + 1).join("\n");

        segments.push({
          lineStart: lineStart + 1, // 1-based line numbers
          lineEnd: lineEnd + 1,
          segment,
          score: matchScore,
        });
      }
    }

    // Sort by score and return top 3 segments
    return segments
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ lineStart, lineEnd, segment }) => ({
        lineStart,
        lineEnd,
        segment,
      }));
  } catch (error) {
    console.error("Error finding relevant code segments:", error);
    return [];
  }
}

// Process GitHub commits
export const gitCommitProcessor = async (
  githubUrl: string,
  projectId: string,
  token?: string
): Promise<CommitResponse[]> => {
  const octokit = createOctokit(token);
  try {
    const [owner, repo] = githubUrl.split("/").slice(-2);

    if (!owner || !repo) {
      throw new Error("Invalid GitHub URL");
    }

    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 15,
    });

    const processedCommits = await Promise.all(
      data.map(async (commit: any, index: number) => {
        // Add delay between API calls
        await delay(index * RATE_LIMIT_DELAY);

        // Fetch diff and generate summary
        const diff = await fetchCommitDiff(owner, repo, commit.sha, token);
        const summary =
          (await retryWithDelay(() => AISummarizeCommits(diff), 3, 1000)) ||
          "No summary available";

        return {
          projectId,
          commitHash: commit.sha,
          commitMessage: commit.commit.message || "",
          commitAuthorName: commit.commit?.author?.name || "",
          commitAuthorAvatar: commit?.author?.avatar_url || "",
          commitDate: new Date(commit.commit?.author?.date || Date.now()),
          summary,
        };
      })
    );

    return processedCommits;
  } catch (error) {
    console.error("Error processing commits:", {
      error,
      githubUrl,
      projectId,
    });
    throw new Error(
      `Failed to process commits: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Filter unprocessed commits
async function filterUnprocessedCommits(
  commits: CommitResponse[],
  projectId: string
) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
      commitHash: {
        in: commits.map((c) => c.commitHash),
      },
    },
    select: { commitHash: true },
  });

  const processedHashes = new Set(processedCommits.map((c) => c.commitHash));
  return commits.filter((commit) => !processedHashes.has(commit.commitHash));
}

// Main function to pull and store commits
export const pullCommits = async (projectId: string, token?: string) => {
  try {
    // Fetch project details
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        githubUrl: true,
        deleteAt: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.deleteAt && project.deleteAt <= new Date()) {
      throw new Error("Project has been deleted");
    }

    // Process commits
    const commits = await gitCommitProcessor(
      project.githubUrl,
      projectId,
      token
    );

    // Filter out already processed commits
    const newCommits = await filterUnprocessedCommits(commits, projectId);

    if (newCommits.length === 0) {
      return [];
    }

    // Process commits in batches
    const savedCommits = [];
    for (let i = 0; i < newCommits.length; i += BATCH_SIZE) {
      const batch = newCommits.slice(i, i + BATCH_SIZE);
      const result = await db.commit.createMany({
        data: batch.map((commit) => ({
          projectId: commit.projectId,
          commitHash: commit.commitHash,
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
          summary: commit.summary,
        })),
      });
      savedCommits.push(...batch);
      await delay(1000); // Add delay between batches
    }

    return savedCommits;
  } catch (error) {
    console.error("Error pulling commits:", error);
    throw error;
  }
};

// Optional: Webhook handler for real-time updates
export const handleGitHubWebhook = async (payload: any) => {
  try {
    const { repository, commits, project_id } = payload;

    if (!commits || !project_id) {
      throw new Error("Invalid webhook payload");
    }

    const processedWebhookCommits = await Promise.all(
      commits.map(async (commit: any) => {
        const diff = await fetchCommitDiff(
          repository.owner.name,
          repository.name,
          commit.id
        );

        const summary = await retryWithDelay(
          () => AISummarizeCommits(diff),
          3,
          1000
        );

        return {
          projectId: project_id,
          commitHash: commit.id,
          commitMessage: commit.message,
          commitAuthorName: commit.author.name,
          commitAuthorAvatar: commit.author.avatar_url || "",
          commitDate: new Date(commit.timestamp),
          summary,
        };
      })
    );

    const newCommits = await filterUnprocessedCommits(
      processedWebhookCommits,
      project_id
    );

    if (newCommits.length > 0) {
      await db.commit.createMany({
        data: newCommits,
      });
    }

    return newCommits;
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);
    throw error;
  }
};

// Helper function to create a unique ID for a file
export async function createUniqueId(
  projectId: string,
  filePath: string
): Promise<string> {
  // Create a hash of the file path to ensure uniqueness and consistent length
  let hash = 0;
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Ensure positive value and convert to string in base 36 (alphanumeric)
  const hashStr = Math.abs(hash).toString(36);

  // Combine project ID with hash for uniqueness across projects
  return `${projectId.substring(0, 10)}_${hashStr}`.substring(0, 25);
}

/**
 * Fetches source files from a GitHub repository
 * @param githubUrl URL of the GitHub repository
 * @returns Array of source files with path and content
 */
export async function fetchSourceFilesFromGithub(
  githubUrl: string
): Promise<{ path: string; content: string }[]> {
  try {
    // This is a placeholder implementation - you'll need to replace it with actual GitHub API calls
    // You might want to use Octokit or similar libraries to interact with GitHub API

    // Example implementation (not functional):
    // 1. Extract owner and repo from githubUrl
    const urlParts = githubUrl.replace(/\/$/, "").split("/");
    const repoName = urlParts.pop() || "";
    const ownerName = urlParts.pop() || "";

    console.log(
      `Fetching files from GitHub repository: ${ownerName}/${repoName}`
    );

    // 2. Use GitHub API to list files in repo
    // const octokit = new Octokit({ auth: `token ${githubToken}` });
    // const { data: repoContent } = await octokit.repos.getContent({
    //   owner: ownerName,
    //   repo: repoName,
    //   path: '',
    // });

    // 3. Recursively fetch content for each file
    // ... code to recursively fetch files ...

    // For now, return mock data
    return [
      { path: "src/index.ts", content: "// This is a mock file content" },
      { path: "src/utils.ts", content: "// Utility functions would be here" },
    ];
  } catch (error) {
    console.error("Error fetching files from GitHub:", error);
    return [];
  }
}

/**
 * Fetch a single file from a GitHub repository
 * @param githubUrl - Repository URL (e.g., 'https://github.com/owner/repo')
 * @param filePath - Path to the file within the repository
 * @param token - Optional GitHub token for authentication
 * @returns The file content as a string
 */
export async function fetchFileFromRepository(
  githubUrl: string,
  filePath: string,
  token?: string
): Promise<string> {
  const octokit = createOctokit(token);
  try {
    // Extract owner and repo from the GitHub URL
    const [owner, repo] = githubUrl.split("/").slice(-2);

    if (!owner || !repo) {
      throw new Error("Invalid GitHub URL");
    }

    console.log(`Fetching file ${filePath} from ${owner}/${repo}`);

    // Get the file content
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      mediaType: {
        format: "raw",
      },
    });

    // Return the file content as a string
    return typeof response.data === "string" ? response.data : "";
  } catch (error) {
    console.error(`Error fetching file ${filePath}:`, error);
    throw new Error(`Failed to fetch file: ${filePath}`);
  }
}

// const testProjectId = "cm6ug2v5h0000dl9onfcbijgl";

// console.log("\n=== Testing pullCommits ===");
// pullCommits(testProjectId)
//   .then(commits => {
//     console.log("Successfully pulled commits:");
//     console.log("Number of new commits:", commits.length);
//     if (commits.length > 0) {
//       console.log("Sample commit:", {
//         message: commits[0].commitMessage,
//         author: commits[0].commitAuthorName,
//         date: commits[0].commitDate
//       });
//     }
//   })
//   .catch(err => console.error("Error pulling commits:", err));
