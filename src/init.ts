import { Hono } from "hono";

export interface Bindings {
  MAIN_URL: string;
}

export interface HonoEnv {
  Bindings: Bindings;
}

export function createDriverHonoApp() {
  const app = new Hono<HonoEnv>();
  return app;
}
