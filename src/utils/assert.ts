import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export default function assert(
  condition: boolean,
  message?: string,
  status: ContentfulStatusCode = 500
): asserts condition {
  if (!condition) {
    const errorMessage = message || "Assertion failed";
    throw new HTTPException(status, { message: errorMessage });
  }
}
