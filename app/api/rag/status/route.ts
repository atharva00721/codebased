import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";

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
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Consider the project initialized if it has at least one embedding
    const initialized = project._count.sourceCodeEmbeddings > 0;

    return NextResponse.json({
      initialized,
      embeddingsCount: project._count.sourceCodeEmbeddings,
    });
  } catch (error) {
    console.error("Error checking initialization status:", error);
    return NextResponse.json(
      { error: "Failed to check initialization status" },
      { status: 500 }
    );
  }
}
