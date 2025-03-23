import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";

const SyncUser = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("No user ID found");
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound();
  }

  await db.user.upsert({
    where: {
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
    create: {
      id: userId,
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
  });
  return redirect("/");
};

export default SyncUser;

// import { db } from "@/server/db";

// import { redirect } from "next/navigation";
// import { auth, clerkClient } from "@clerk/nextjs/server";

// const RegisterUser = async () => {
//   const { userId } = await auth();
//   if (!userId) {
//     return redirect("/sign-up");
//   }
//   const client = await clerkClient();
//   const [user, dbUser] = await Promise.all([
//     client.users.getUser(userId),
//     db.user.findUnique({
//       where: { id: userId },
//     }),
//   ]);

//   if (!dbUser) {
//     await db.user.create({
//       data: {
//         id: userId,
//         name: user.firstName + " " + user.lastName,
//       },
//     });
//   }
//   return redirect("/");
// };

// export default RegisterUser;
// // SyncUser
