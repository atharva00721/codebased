import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRagInitializationStatus } from "@/app/actions/rag";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    try {
      const result = await checkRagInitializationStatus(projectId);
      return NextResponse.json(result);
    } catch (error) {
      console.error("Error checking initialization status:", error);
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.message === "Project not found") {
          return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(
        { error: "Failed to check initialization status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
