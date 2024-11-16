import { t, createProcedure } from "@/server/context";
export const { router } = t;

export const publicProcedure = t.procedure;
export const authenticatedProcedure = createProcedure();
