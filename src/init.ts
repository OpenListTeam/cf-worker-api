import { Hono } from "hono";
import * as cookie from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import cookieStore from "./mw/cookie-store";

export interface HonoEnv {
  // biome-ignore lint/correctness/noUndeclaredVariables: idk why biome doesn't recognize this
  Bindings: CloudflareBindings;
  Variables: {
    from_browser: boolean;
  };
}

export function createDriverHonoApp() {
  const app = new Hono<HonoEnv>();

  app.use((c, next) => {
    /*
     * The `from_browser` cookie is used to determine if the request is from the web browser.
     * It influences the error handling behavior.
     * If the request is from the browser, errors will redirect to the index page with a message.
     */
    let from_browser = cookie.getCookie(c, "from_browser") === "true";
    if (c.req.query("from_browser")) {
      cookie.setCookie(c, "from_browser", "true", {
        httpOnly: false,
        path: "/",
      });
      from_browser = true;
    }
    c.set("from_browser", from_browser);
    return next();
  });

  // msg response, back to index
  app.use((c, next) => {
    c.show_message = (msg: string, type: "success" | "warning" | "error" | "info" = "info") => {
      const searchParams = new URLSearchParams();
      searchParams.set("msg", msg);
      searchParams.set("msg_type", type);
      return c.redirect(`/?${searchParams.toString()}`, 302);
    };

    /*
     * We don't use URL Search to bypass data, because the data length may exceed the URL length limit.
     */
    c.back_to_index = (search?: Record<string, string> | URLSearchParams | string) => {
      const searchParams = new URLSearchParams(search);
      const map = new Map<string, string>();
      searchParams.forEach((value, key) => {
        map.set(key, value);
      });
      cookie.setCookie(c, "resolve_data", JSON.stringify(Object.fromEntries(map)), {
        httpOnly: false,
        path: "/",
      });
      return c.redirect("/", 302);
    };
    return next();
  });

  app.use(cookieStore);

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      if (c.get("from_browser")) {
        const searchParams = new URLSearchParams();
        searchParams.set("msg", err.message);
        const firstCode = Math.ceil(err.status / 100);
        searchParams.set("msg_type", firstCode === 2 ? "success" : firstCode === 4 ? "warning" : "error");
        return c.redirect(`/?${searchParams.toString()}`, 302);
      }
      return c.text(err.message, err.status);
    }
    console.error("Unhandled error:", err);
    return c.text("Internal Server Error", 500);
  });

  return app;
}

declare module "hono" {
  interface Context {
    show_message: (msg: string, type?: "success" | "warning" | "error" | "info") => Response;
    back_to_index: (search?: Record<string, string> | URLSearchParams | string) => Response;
  }
}
