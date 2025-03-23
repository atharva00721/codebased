"use server";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { pullCommits } from "@/lib/github";

export async function getProjects() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const projects = await db.project.findMany({
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
      select: {
        id: true,
        name: true,
        githubUrl: true,
        createdAt: true,
        updatedAt: true,
        deleteAt: true,
      },
    });

    // Serialize dates for JSON transmission
    return projects.map((project) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      deleteAt: project.deleteAt ? project.deleteAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

export async function createProject(data: {
  name: string;
  githubUrl: string;
  githubToken: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { name, githubUrl, githubToken } = data;

    if (!name || !githubUrl) {
      throw new Error("Name and GitHub URL are required");
    }

    const existingProject = await db.project.findFirst({
      where: {
        OR: [
          { name, userToProjects: { some: { userId } } },
          { githubUrl, userToProjects: { some: { userId } } },
        ],
      },
    });

    if (existingProject) {
      throw new Error("A project with the same name or URL already exists");
    }

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

    await pullCommits(project.id, githubToken);

    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}
