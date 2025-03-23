// import { Octokit } from "@octokit/rest";
// import { db } from "@/server/db";
// import { summariseCode, generateEmbedding } from "../gemini";
// import { Document } from "@langchain/core/documents";
// import { octokit } from "../github";

// // 1. DOCUMENT LOADING
// async function fetchRepositoryContent(owner: string, repo: string, path: string = "") {
//   try {
//     const { data: contents } = await octokit.repos.getContent({
//       owner,
//       repo,
//       path,
//     });

//     const files: Array<{fileName: string, content: string}> = [];

//     // Handle directory recursively
//     for (const item of Array.isArray(contents) ? contents : [contents]) {
//       if (item.type === "dir") {
//         const subFiles = await fetchRepositoryContent(owner, repo, item.path);
//         files.push(...subFiles);
//       } else if (item.type === "file" && 
//                 item.name.match(/\.(ts|js|tsx|jsx|py|java|cpp|cs)$/)) {
//         const { data } = await octokit.repos.getContent({
//           owner,
//           repo,
//           path: item.path,
//           mediaType: { format: "raw" },
//         });

//         files.push({
//           fileName: item.path,
//           content: Buffer.from(data as any).toString(),
//         });
//       }
//     }

//     return files;
//   } catch (error) {
//     console.error("Error fetching repository content:", error);
//     throw error;
//   }
// }

// // 2. PROCESS AND STORE CODE
// async function processSourceCode(
//   projectId: string,
//   fileName: string,
//   sourceCode: string
// ) {
//   try {
//     // Create Document for summarization
//     const doc = new Document({
//       pageContent: sourceCode,
//       metadata: { src: fileName }
//     });

//     // Generate summary using existing summariseCode function
//     const summary = await summariseCode(doc);
    
//     // Generate embedding for the summary using existing function
//     const summaryEmbedding = await generateEmbedding(summary);

//     // Store in database
//     await db.sourceCodeEmbedding.create({
//       data: {
//         projectId,
//         fileName,
//         sourceCode,
//         summary,
//         summaryEmbedding,
//       },
//     });

//     return { fileName, summary, summaryEmbedding };
//   } catch (error) {
//     console.error(`Error processing file ${fileName}:`, error);
//     throw error;
//   }
// }

// // 3. MAIN RAG PIPELINE
// export async function processRepository(projectId: string) {
//   try {
//     // Get project details
//     const project = await db.project.findUnique({
//       where: { id: projectId },
//       select: { 
//         githubUrl: true,
//         deleteAt: true 
//       },
//     });

//     if (!project) throw new Error("Project not found");
//     if (project.deleteAt && project.deleteAt <= new Date()) {
//       throw new Error("Project has been deleted");
//     }

//     // Extract owner and repo from GitHub URL
//     const [owner, repo] = project.githubUrl.split("/").slice(-2);
//     if (!owner || !repo) throw new Error("Invalid GitHub URL");

//     // Fetch all repository files
//     const files = await fetchRepositoryContent(owner, repo);

//     // Process each file with rate limiting
//     const results = [];
//     for (const file of files) {
//       results.push(await processSourceCode(
//         projectId,
//         file.fileName,
//         file.content
//       ));
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
//     }

//     return results;
//   } catch (error) {
//     console.error("Error in RAG pipeline:", error);
//     throw error;
//   }
// }

// // 4. SEMANTIC SEARCH
// export async function semanticSearch(
//   projectId: string,
//   query: string,
//   limit: number = 5
// ) {
//   try {
//     // Generate embedding for search query
//     const queryEmbedding = await generateEmbedding(query);

//     // Perform vector similarity search using PostgreSQL
//     const results = await db.$queryRaw`
//       SELECT 
//         "fileName",
//         "sourceCode",
//         "summary",
//         1 - ("summaryEmbedding" <=> ${queryEmbedding}::vector) as similarity
//       FROM "sourceCodeEmbedding"
//       WHERE "projectId" = ${projectId}
//       ORDER BY similarity DESC
//       LIMIT ${limit};
//     `;

//     return results;
//   } catch (error) {
//     console.error("Error in semantic search:", error);
//     throw error;
//   }
// }
