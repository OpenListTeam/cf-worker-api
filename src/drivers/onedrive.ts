import { type HonoEnv, createDriverHonoApp } from "@/init";
import assert from "@/utils/assert";
import { createMiddleware } from "hono/factory";

const app = createDriverHonoApp();

const driver_map: Record<string, string[]> = {
  // [authorize, token]
  global: [
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  ],
  cn: [
    "https://login.chinacloudapi.cn/common/oauth2/v2.0/authorize",
    "https://microsoftgraph.chinacloudapi.cn/common/oauth2/v2.0/token",
  ],
  de: [
    "https://login.microsoftonline.de/common/oauth2/v2.0/authorize",
    "https://graph.microsoft.de/common/oauth2/v2.0/token",
  ],
  us: [
    "https://login.microsoftonline.us/common/oauth2/v2.0/authorize",
    "https://graph.microsoft.us/common/oauth2/v2.0/token",
  ],
};

// handle form
const oneLogin = createMiddleware<HonoEnv>(async (c) => {
  const client_id = c.req.query("client_id");
  const client_secret = c.req.query("client_secret");
  const app_type = c.req.query("app_type");
  const callback_uri = c.req.query("redirect_uri") ?? `${c.env.MAIN_URL}/onedrive/callback`;

  assert(typeof client_id === "string" && typeof client_secret === "string", "invalid client_id or client_secret", 400);
  assert(typeof app_type === "string", "invalid app_type", 400);

  const scopes_all = "offline_access Files.ReadWrite.All";
  const client_url: string = driver_map[app_type][0];
  const redirect_uri: string = callback_uri;

  // parameters for request
  const params: Record<string, string> = {
    client_id: client_id,
    scope: scopes_all,
    response_type: "code",
    redirect_uri: redirect_uri,
  };
  // store some data
  c.cookieStore.setMore({
    client_id: client_id,
    client_secret: client_secret,
    app_type: app_type,
    redirect_uri: redirect_uri,
  });
  // redirect
  const u = new URL(client_url);
  for (const [key, value] of Object.entries(params)) {
    u.searchParams.append(key, value);
  }
  return c.redirect(u.href, 302);
});

const oneToken = createMiddleware<HonoEnv>(async (c) => {
  const code = c.req.query("code");
  assert(typeof code === "string", "invalid code", 400);

  const client_id = c.req.query("client_id") ?? c.cookieStore.get("client_id");
  const client_secret = c.req.query("client_secret") ?? c.cookieStore.get("client_secret");
  const app_type = c.req.query("app_type") ?? c.cookieStore.get("app_type");

  assert(typeof client_secret === "string" && typeof client_id === "string", "invalid client_id or client_secret", 400);
  assert(typeof app_type === "string", "invalid app_type", 400);
  assert(Object.keys(driver_map).includes(app_type), "invalid app_type", 400);

  const redirect_uri = c.req.query("redirect_uri") ?? c.cookieStore.get("redirect_uri");
  assert(typeof redirect_uri === "string", "invalid redirect_uri", 400);

  const tokenUrl = driver_map[app_type][1];
  const params = {
    client_id: client_id,
    client_secret: client_secret,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: redirect_uri,
  };

  // execute request
  const response: Response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  if (!response.ok) {
    assert(false, `failed to get token: ${await response.text()}`, 500);
  }

  // return
  c.cookieStore.clear();
  // biome-ignore lint/suspicious/noExplicitAny: response can be any type
  const json: Record<string, any> = await response.json();
  if (c.get("from_browser")) {
    return c.resolve("onedrive", {
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      client_id: client_id,
      client_secret: client_secret,
    });
  }
});

app.get("/prepare", oneLogin);

app.get("/callback", oneToken);

export default app;
