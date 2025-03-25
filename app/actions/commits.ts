"use server";

import { Commit } from "@prisma/client";
import { pullCommits } from "@/lib/github";
import { db } from "@/server/db";

export async function getCommits(projectId: string): Promise<Commit[]> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  // Only fetch existing commits from database
  const existingCommits = await db.commit.findMany({
    where: { projectId },
    orderBy: { commitDate: "desc" },
  });

  return existingCommits;
}

export async function checkAndUpdateCommits(
  projectId: string
): Promise<{ count: number } | null> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  // Get the most recent commit from database
  const latestCommit = await db.commit.findFirst({
    where: { projectId },
    orderBy: { commitDate: "desc" },
  });

  // Fetch new commits from GitHub
  const newCommits = await pullCommits(projectId);

  if (!newCommits.length) return null;

  // If we have no existing commits or the latest commit hash is different
  if (!latestCommit || latestCommit.commitHash !== newCommits[0].commitHash) {
    // Find only the new commits that aren't in our database
    const existingHashes = (
      await db.commit.findMany({
        where: { projectId },
        select: { commitHash: true },
      })
    ).map((c) => c.commitHash);

    const uniqueNewCommits = newCommits.filter(
      (commit) => !existingHashes.includes(commit.commitHash)
    );

    if (uniqueNewCommits.length === 0) return null;

    // Insert only the new commits
    const commits = await db.commit.createMany({
      data: uniqueNewCommits,
    });

    return { count: commits.count };
  }

  return null;
}
