import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import apiKeysRoute from "./routes/api/keys/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  api: createTRPCRouter({
    getKey: apiKeysRoute,
  }),
});

export type AppRouter = typeof appRouter;