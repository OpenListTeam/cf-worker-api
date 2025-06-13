import * as cookie from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { CookieOptions } from "hono/utils/cookie";

interface CookieStore {
  set(name: string, value: string): void;
  get(name: string): string | undefined;
  delete(name: string): void;
  clear(): void;
  all(): Record<string, string>;
  has(name: string): boolean;
  keys(): string[];
  values(): string[];
  entries(): [string, string][];
  setMore(cookies: Record<string, string>): void;
}

const cookieStore = createMiddleware(async (c, next) => {
  const set_opts: CookieOptions = { httpOnly: true, path: "/" };

  const STORE_COOKIE_NAME = c.env.STORE_COOKIE_NAME || "__Request-_CookieStore";
  const originalStore = cookie.getCookie(c, STORE_COOKIE_NAME) || "{}";

  let originalData: Record<string, string> = {};
  try {
    originalData = JSON.parse(originalStore);
  } catch {
    originalData = {};
  }

  // const PREFIX = c.env.COOKIE_PREFIX || "__Request-";
  // const withPrefix = (name: string) => `${PREFIX}${name}`;

  const data = new Map<string, string>();

  for (const [name, value] of Object.entries(originalData)) {
    data.set(name, value);
  }

  c.cookieStore = {
    set(name: string, value: string) {
      data.set(name, value);
    },
    get(name: string) {
      return data.get(name);
    },
    delete(name: string) {
      data.delete(name);
    },
    clear() {
      data.clear();
    },
    all() {
      const result: Record<string, string> = {};
      data.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    },
    has(name: string) {
      return data.has(name);
    },
    keys() {
      return Array.from(data.keys());
    },
    values() {
      return Array.from(data.values());
    },
    entries() {
      return Array.from(data.entries());
    },
    setMore(cookies: Record<string, string>) {
      for (const [name, value] of Object.entries(cookies)) {
        data.set(name, value);
      }
    },
  };

  await next();

  if (data.size > 0) {
    const newStore = JSON.stringify(Object.fromEntries(data.entries()));
    cookie.setCookie(c, STORE_COOKIE_NAME, newStore, set_opts);
  } else {
    cookie.deleteCookie(c, STORE_COOKIE_NAME, set_opts);
  }
});

declare module "hono" {
  interface Context {
    cookieStore: CookieStore;
  }
}

export default cookieStore;
