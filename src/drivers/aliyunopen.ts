import { type HonoEnv, createDriverHonoApp } from "@/init";
import { createMiddleware } from "hono/factory";

const app = createDriverHonoApp();

const driver_map = [
  "https://openapi.aliyundrive.com/oauth/authorize/qrcode",
  "https://openapi.aliyundrive.com/oauth/access_token",
  "https://openapi.aliyundrive.com/oauth/qrcode",
];

interface AliAccessTokenReq {
  client_id: string;
  client_secret: string;
  grant_type: string;
  code: string;
  refresh_token: string;
}

interface AliAccessTokenErr {
  code: string;
  message: string;
  error: string;
}

interface AliQrcodeReq {
  client_id: string;
  client_secret: string;
  scopes: string[];
}

// login request
const aliyunLogin = createMiddleware<HonoEnv>(async (c) => {
  try {
    const req: AliQrcodeReq = {
      client_id: <string>c.req.query("client_uid"),
      client_secret: <string>c.req.query("client_key"),
      scopes: ["user:base", "file:all:read", "file:all:write"],
    };
    const response = await fetch(driver_map[0], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      const error: AliAccessTokenErr = await response.json();
      return c.json({ text: `${error.code}: ${error.message}` }, 403);
    }
    const data: Record<string, any> = await response.json();
    console.log(data);
    return c.json(
      {
        text: data.qrCodeUrl,
        sid: data.sid,
      },
      200
    );
  } catch (error) {
    return c.json({ text: error }, 500);
  }
});

// token request
const aliyunToken = createMiddleware<HonoEnv>(async (c) => {
  const req: AliAccessTokenReq = {
    client_id: <string>c.req.query("client_id"),
    client_secret: <string>c.req.query("client_secret"),
    grant_type: <string>c.req.query("grant_type"),
    code: <string>c.req.query("code"),
    refresh_token: <string>c.req.query("refresh_token"),
  };
  if (req.grant_type !== "authorization_code" && req.grant_type !== "refresh_token")
    return c.json({ text: "Incorrect GrantType" }, 400);
  if (req.grant_type === "authorization_code" && !req.code) return c.json({ text: "Code missed" }, 400);
  if (req.grant_type === "refresh_token" && req.refresh_token.split(".").length !== 3)
    return c.json({ text: "Incorrect refresh_token or missed" }, 400);
  if (req.grant_type === "authorization_code") {
    const code_urls: string = "https://openapi.aliyundrive.com/oauth/qrcode/" + req.code + "/status";
    const auth_post: Response = await fetch(code_urls, { method: "GET" });
    const code_data: Record<string, string> = await auth_post.json();
    if (!auth_post.ok || code_data.status !== "LoginSuccess") {
      return c.json({ text: "Login failed:" + code_data.status }, 401);
    }
    req.code = code_data.authCode;
  }
  try {
    const response = await fetch(driver_map[1], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      const error: AliAccessTokenErr = await response.json();
      return c.json({ text: `${error.code}: ${error.message}` }, 403);
    }
    const data: Record<string, any> = await response.json();
    console.log(data);
    return c.json(data);
  } catch (error) {
    return c.json({ text: error }, 500);
  }
});

app.get("/requests", aliyunLogin);
app.get("/callback", aliyunToken);

export default app;
