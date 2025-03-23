// import { db } from "@/server/db"; // Adjust based on your actual DB location

// export async function GET() {
//   try {
//     const post = await db.post.findFirst({
//       orderBy: { createdAt: "desc" },
//     });

//     return Response.json({ post: post ?? null });
//   } catch (error) {
//     return Response.json({ error: "Failed to fetch post" }, { status: 500 });
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const { name } = await request.json();

//     if (!name || typeof name !== "string") {
//       return Response.json({ error: "Invalid name" }, { status: 400 });
//     }

//     const post = await db.post.create({
//       data: { name },
//     });

//     return Response.json({ post });
//   } catch (error) {
//     return Response.json({ error: "Failed to create post" }, { status: 500 });
//   }
// }
