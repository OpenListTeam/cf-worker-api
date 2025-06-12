import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers"; // @ts-ignore
import routes from "./routes";

export type Bindings = {
  MAIN_URLS: string;
};

const app = new Hono<{ Bindings: Bindings }>();

for (const path in routes) {
  app.route(path, await routes[path]());
}

app.use("*", serveStatic({ manifest: manifest, root: "./" }));

export default app;
