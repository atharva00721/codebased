"use server";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";

export async function getUserProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
        imageUrl: true,
        credits: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}
