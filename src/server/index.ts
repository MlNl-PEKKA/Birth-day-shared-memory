import { publicProcedure, router } from "./trpc";
import * as superAdmin from "./modules/super-admin";
import * as admin from "./modules/admin";
import * as users from "./modules/users";
import * as appUser from "./modules/app-user";

export const appRouter = router({
  ...superAdmin,
  ...admin,
  ...users,
  ...appUser,
  ealthCheck: publicProcedure.query(() => {
    return { message: "API up and running..." };
  }),
  example: publicProcedure.query(() => "Hello"),
});

export type AppRouter = typeof appRouter;
