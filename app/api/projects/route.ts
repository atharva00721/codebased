// app/api/projects/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { pullCommits } from "@/lib/github";

const prisma = new PrismaClient();

// GET handler
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Authenticated userId:", userId);

    const projects = await prisma.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Projects fetched:", projects);

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);

    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, githubUrl, githubToken } = body;

    if (!name || !githubUrl) {
      return NextResponse.json(
        { error: "Name and GitHub URL are required" },
        { status: 400 }
      );
    }

    // Create the project
    const project = await db.project.create({
      data: {
        name,
        githubUrl,
        userToProjects: {
          create: {
            userId,
          },
        },
      },
    });

    // Process commits
    await pullCommits(project.id, githubToken);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
