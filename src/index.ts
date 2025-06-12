import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers"; // @ts-ignore
import routes from "./routes";

// biome-ignore lint/correctness/noUndeclaredVariables: idk why biome cannot recognize this type
export type Bindings = Cloudflare.Env;

const app = new Hono<{ Bindings: Bindings }>();

for (const path in routes) {
  app.route(`api/${path}`, await routes[path]());
}

app.all("/api/ping", (c) => {
  return c.text("pong");
});

app.use("*", serveStatic({ manifest: manifest, root: "./" }));

export default app;
