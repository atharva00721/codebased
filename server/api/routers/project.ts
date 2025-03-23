// import { error } from "console";
// import { z } from "zod";
// import { pullCommits } from "~/lib/github";
// import { indexGithubRepo } from "~/lib/github-loader";
// import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// export const projectRouter = createTRPCRouter({
//   createProject: protectedProcedure
//     .input(
//       z.object({
//         name: z.string(),
//         repoUrl: z.string(),
//         githubToken: z.string().optional(),
//       }),
//     )
//     .mutation(async ({ ctx, input }) => {
//       // console.log("Creating project", input);
//       const project = await ctx.db.project.create({
//         data: {
//           githubUrl: input.repoUrl,
//           name: input.name,
//           userToProjects: {
//             create: {
//               userId: ctx.user.userId!,
//             },
//           },
//         },
//       });
//       // await indexGithubRepo(project.id, input.repoUrl, input.githubToken);
//       await pullCommits(project.id);
//       return project;
//     }),
//   getProjects: protectedProcedure.query(async ({ ctx }) => {
//     return await ctx.db.project.findMany({
//       where: {
//         userToProjects: {
//           some: {
//             userId: ctx.user.userId!,
//           },
//         },
//         deleteAt: null,
//       },
//     });
//   }),
//   getCommits: protectedProcedure
//     .input(
//       z.object({
//         projectId: z.string(),
//       }),
//     )
//     .query(async ({ ctx, input }) => {
//       try {
//         await pullCommits(input.projectId);
//       } catch (err) {
//         console.error("Failed to pull commits:", err);
//       }

//       return await ctx.db.commit.findMany({
//         where: {
//           projectId: input.projectId,
//         },
//         orderBy: {
//           commitDate: "desc",
//         },
//       });
//     }),
// });
