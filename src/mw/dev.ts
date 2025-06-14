import type { Hono } from "hono";
import { createMiddleware } from "hono/factory";

const webUri = "http://localhost:4321";

export const devProxy = createMiddleware(async (c, next) => {
  await next();
  if (c.res.status === 404) {
    const u = new URL(c.req.url, webUri);
    const newUrl = `${webUri}${u.pathname}${u.search}`;
    c.res = await fetch(newUrl, c.req.raw).catch(() => c.notFound());
  }
});

const isDev = Boolean(process.env.DEV);

// biome-ignore lint/suspicious/noExplicitAny: can be any type as its an interface
export const applyDevForApp = (app: Hono<any, any>) => {
  if (isDev) {
    app.use("*", devProxy);
  }
  return app;
};
