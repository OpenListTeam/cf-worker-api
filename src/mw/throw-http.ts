import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const throwHttp = createMiddleware(async (c, next) => {
  c.throw = (message: string | HTTPException, status: ContentfulStatusCode = 500) => {
    if (typeof message === "string") {
      throw new HTTPException(status, { message });
    }
    throw message;
  };
  return next();
});

export default throwHttp;

declare module "hono" {
  interface Context {
    throw: (message: string | HTTPException, status?: ContentfulStatusCode) => never;
  }
}
