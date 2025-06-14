import { applyDevForApp } from "@/mw/dev";
import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers"; // @ts-ignore
import routes from "./routes";

// biome-ignore lint/correctness/noUndeclaredVariables: i don't know why biome cannot recognize this
const app = new Hono<{ Bindings: CloudflareBindings }>();

applyDevForApp(app);

for (const path in routes) {
  app.route(path, await routes[path]());
}

app.all("/ping", (c) => {
  return c.text("pong");
});

if (!process.env.DEV) {
  app.use("*", serveStatic({ manifest: manifest, root: "./" }));
}

export default app;
