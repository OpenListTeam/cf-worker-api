import { type HonoEnv, createDriverHonoApp } from "@/init";
import assert from "@/utils/assert";
import { createMiddleware } from "hono/factory";

const app = createDriverHonoApp();

const driver_map = {
  login_url: "https://www.alipan.com/o/oauth/authorize",
  code_status: "https://openapi.aliyundrive.com/oauth/qrcode/{code}/status",
  authorize_qrcode: "https://openapi.aliyundrive.com/oauth/authorize/qrcode",
  access_token: "https://openapi.aliyundrive.com/oauth/access_token",
  qrcode: "https://openapi.aliyundrive.com/oauth/qrcode",
};

interface AliAccessTokenReq {
  client_id: string;
  client_secret: string;
  grant_type: string;
  code?: string;
  refresh_token?: string;
}

interface AliAccessTokenResErr {
  code: string;
  message: string;
  error: string;
}

interface AliQrcodeReq {
  client_id: string;
  client_secret: string;
  scopes: string[];
}

const aliyunLogin = createMiddleware<HonoEnv>(async (c) => {
  const client_id = c.req.query("client_id");
  const redirect_uri = c.req.query("redirect_uri");
  const scope = ["user:base", "file:all:read", "file:all:write"].join(",");
  const response_type = "code";

  assert(typeof client_id === "string", "invalid client_id", 400);
  assert(typeof redirect_uri === "string", "invalid redirect_uri", 400);

  const params = new URLSearchParams({
    client_id: client_id,
    redirect_uri: redirect_uri,
    scope: scope,
    response_type: response_type,
    relogin: "true",
  });

  const u = new URL(driver_map.login_url);
  u.search = params.toString();
  return c.redirect(u.href, 302);
});

const aliyunQrLogin = createMiddleware<HonoEnv>(async (c) => {
  const client_id = c.req.query("client_id");
  const client_secret = c.req.query("client_secret");

  assert(typeof client_secret === "string" && typeof client_id === "string", "invalid client_id or client_secret", 400);

  const request: AliQrcodeReq = {
    client_id: client_id,
    client_secret: client_secret,
    scopes: ["user:base", "file:all:read", "file:all:write"],
  };
  const response = await fetch(driver_map.authorize_qrcode, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: AliAccessTokenResErr = await response.json();
    return c.throw(`${error.code}: ${error.message}`, 403);
  }
  // biome-ignore lint/suspicious/noExplicitAny: response can be any type
  const data: Record<string, any> = await response.json();

  return c.json(
    {
      text: data.qrCodeUrl,
      sid: data.sid,
    },
    200
  );
});

// token request
const aliyunToken = createMiddleware<HonoEnv>(async (c) => {
  const client_id = c.req.query("client_id");
  const client_secret = c.req.query("client_secret");
  assert(typeof client_secret === "string" && typeof client_id === "string", "invalid client_id or client_secret", 400);

  const code = c.req.query("code");

  const refresh_token = c.req.query("refresh_token");

  const grant_type = c.req.query("grant_type");
  assert(typeof grant_type === "string", "invalid grant_type", 400);
  if (grant_type !== "authorization_code" && grant_type !== "refresh_token") return c.throw("invalid grant_type", 400);
  if (grant_type === "authorization_code" && !code) return c.throw("invalid code", 400);
  if (grant_type === "refresh_token" && !refresh_token) return c.throw("invalid refresh_token", 400);

  // prepare access token request
  const req: AliAccessTokenReq = {
    client_id,
    client_secret,
    grant_type,
    code,
    refresh_token,
  };

  // if received code, get authCode first
  if (req.grant_type === "authorization_code") {
    const uri = driver_map.code_status.replace("{code}", req.code!);
    const auth_resp: Response = await fetch(uri, { method: "GET" });
    const code_data: Record<string, string> = await auth_resp.json();
    if (!auth_resp.ok || code_data.status !== "LoginSuccess") {
      return c.throw(`Login failed: ${code_data.status}`, 401);
    }
    req.code = code_data.authCode;
  }

  // get access token
  const response = await fetch(driver_map.access_token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const error: AliAccessTokenResErr = await response.json();
    return c.json({ text: `${error.code}: ${error.message}` }, 403);
  }
  // biome-ignore lint/suspicious/noExplicitAny: response can be any type
  const data: Record<string, any> = await response.json();
  return c.json(data);
});

app.get("/prepare", aliyunLogin);
app.get("/qrlogin", aliyunQrLogin);
app.get("/callback", aliyunToken);

export default app;
