import { AdminRole } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";

import { Session } from "next-auth";
import SuperJSON from "superjson";

type TRPCContext = {
  session?: Session | null;
};

export const createTRPCContext = async (opts: TRPCContext) => {
  return {
    ...opts,
  };
};

export const t = initTRPC
  .context<typeof createTRPCContext>()
  .create({ transformer: SuperJSON });

export function createProcedure(requiredRole?: AdminRole) {
  return t.procedure.use(async (opts) => {
    const { session } = opts.ctx;

    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (requiredRole) {
      if (
        session.user.role !== AdminRole.SUPER_ADMIN &&
        session.user.role !== requiredRole
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
    }

    return opts.next({ ctx: { session } });
  });
}
