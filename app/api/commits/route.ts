import { NextResponse } from "next/server";
import { pullCommits } from "@/lib/github";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    console.log("Received request for commits with projectId:", projectId);

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // First try to get existing commits from the database
    const existingCommits = await db.commit.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        commitDate: "desc",
      },
    });

    console.log("Found existing commits:", existingCommits.length);

    if (existingCommits.length > 0) {
      return NextResponse.json(existingCommits);
    }

    // If no existing commits, fetch new ones
    console.log("No existing commits found, fetching from GitHub...");
    const commits = await pullCommits(projectId);
    console.log("Fetched new commits from GitHub:", commits.length);

    return NextResponse.json(commits);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process commits",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
