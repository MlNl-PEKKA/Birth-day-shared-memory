// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { TRPCError } from "@trpc/server";

// export async function getAuthSession() {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "You must be logged in to perform this action",
//     });
//   }
//   return session;
// }

// export async function requireAdmin() {
//   const session = await getAuthSession();
//   if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
//     throw new TRPCError({
//       code: "FORBIDDEN",
//       message: "You must be an admin to perform this action",
//     });
//   }
//   return session;
// }

// export async function requireSuperAdmin() {
//   const session = await getAuthSession();
//   if (session.user.role !== "SUPER_ADMIN") {
//     throw new TRPCError({
//       code: "FORBIDDEN",
//       message: "You must be a super admin to perform this action",
//     });
//   }
//   return session;
// } 