import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers"; // @ts-ignore
import routes from "./routes";

// biome-ignore lint/correctness/noUndeclaredVariables: i don't know why biome cannot recognize this
const app = new Hono<{ Bindings: CloudflareBindings }>();

for (const path in routes) {
  app.route(`api/${path}`, await routes[path]());
}

app.all("/api/ping", (c) => {
  return c.text("pong");
});

app.use("*", serveStatic({ manifest: manifest, root: "./" }));

export default app;
