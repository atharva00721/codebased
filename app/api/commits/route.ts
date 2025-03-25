import { NextResponse } from "next/server";
import { getCommits, checkAndUpdateCommits } from "@/app/actions/commits";

export async function POST(request: Request) {
  try {
    const { projectId, checkUpdates } = await request.json();
    console.log("Received request for commits with projectId:", projectId);

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (checkUpdates) {
      const updates = await checkAndUpdateCommits(projectId);
      if (updates) {
        return NextResponse.json({
          updated: true,
          commits: await getCommits(projectId),
        });
      }
      return NextResponse.json({ updated: false });
    }

    const commits = await getCommits(projectId);
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
