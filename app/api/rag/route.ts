import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  initializeRepositoryRagAction, 
  queryRepositoryRagAction 
} from "@/app/actions/rag";

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
        // Use the server action instead of duplicating logic
        const result = await initializeRepositoryRagAction(projectId);

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

    // For regular queries, use the server action
    if (query) {
      const result = await queryRepositoryRagAction(projectId, query);
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
