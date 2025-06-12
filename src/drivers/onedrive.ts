import { type HonoEnv, createDriverHonoApp } from "@/init";
import cookie from "hono/cookie";
import { createMiddleware } from "hono/factory";

const app = createDriverHonoApp();

const driver_map: Record<string, string[]> = {
  // [login, token]
  onedrive_go: [
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  ],
  onedrive_cn: [
    "https://login.chinacloudapi.cn/common/oauth2/v2.0/authorize",
    "https://microsoftgraph.chinacloudapi.cn/common/oauth2/v2.0/token",
  ],
  onedrive_de: [
    "https://login.microsoftonline.de/common/oauth2/v2.0/authorize",
    "https://graph.microsoft.de/common/oauth2/v2.0/token",
  ],
  onedrive_us: [
    "https://login.microsoftonline.us/common/oauth2/v2.0/authorize",
    "https://graph.microsoft.us/common/oauth2/v2.0/token",
  ],
};

// login request
const oneLogin = createMiddleware<HonoEnv>(async (c) => {
  const client_uid = <string>c.req.query("client_uid");
  const client_key = <string>c.req.query("client_key");
  const driver_txt = <string>c.req.query("apps_type");
  const scopes_all = "offline_access Files.ReadWrite.All";
  const client_url: string = driver_map[driver_txt][0];
  // parameters for request
  const params_all: Record<string, any> = {
    client_id: client_uid,
    scope: scopes_all,
    response_type: "code",
    redirect_uri: `https://${c.env.MAIN_URL}/onedrive/callback`,
  };
  const urlWithParams = new URL(client_url);
  Object.keys(params_all).forEach((key) => {
    urlWithParams.searchParams.append(key, params_all[key]);
  });
  // execute request
  try {
    const response = await fetch(urlWithParams.href, {
      method: "GET",
    });
    cookie.setCookie(c, "client_uid", client_uid);
    cookie.setCookie(c, "client_key", client_key);
    cookie.setCookie(c, "apps_types", driver_txt);
    return c.json({ text: response.url }, 200);
  } catch (error) {
    return c.json({ text: error }, 500);
  }
});

const oneToken = createMiddleware<HonoEnv>(async (c) => {
  let login_data, client_uid, client_key, driver_txt, client_url, params_all;
  try {
    login_data = <string>c.req.query("code");
    client_uid = <string>cookie.getCookie(c, "client_uid");
    client_key = <string>cookie.getCookie(c, "client_key");
    driver_txt = <string>cookie.getCookie(c, "apps_types");
    client_url = driver_map[driver_txt][1];
    params_all = {
      client_id: client_uid,
      client_secret: client_key,
      redirect_uri: `https://${c.env.MAIN_URL}/onedrive/callback`,
      code: login_data,
      grant_type: "authorization_code",
    };
  } catch (error) {
    return c.redirect(
      `/?message_err=${
        "授权失败，请检查: <br>" +
        "1、应用ID和应用机密是否正确<br>" +
        "2、登录账号是否具有应用权限<br>" +
        "3、回调地址是否包括上面地址<br>" +
        "4、登录可能过期，请重新登录<br>" +
        "错误信息: <br> " +
        error
      }` +
        `&client_uid=NULL` +
        `&client_key=`
    );
  }
  // console.log(login_data);

  // execute request
  try {
    const paramsString = new URLSearchParams(params_all).toString();
    const response: Response = await fetch(client_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: paramsString,
    });
    // console.log(response);
    cookie.deleteCookie(c, "client_uid");
    cookie.deleteCookie(c, "client_key");
    cookie.deleteCookie(c, "apps_types");
    if (!response.ok)
      return c.redirect(
        `/?message_err=${
          "授权失败，请检查: <br>" +
          "1、应用ID和应用机密是否正确<br>" +
          "2、登录账号是否具有应用权限<br>" +
          "3、回调地址是否包括上面地址<br>" +
          "错误信息: <br>" +
          response.text()
        }` +
          `&client_uid=${client_uid}` +
          `&client_key=${client_key}`
      );
    const json: Record<string, any> = await response.json();
    if (json.token_type === "Bearer") {
      return c.redirect(
        `/?access_token=${json.access_token}` +
          `&refresh_token=${json.refresh_token}` +
          `&client_uid=${client_uid}` +
          `&client_key=${client_key}`
      );
    }
  } catch (error) {
    return c.redirect(
      `/?message_err=${
        "授权失败，请检查: <br>" +
        "1、应用ID和应用机密是否正确<br>" +
        "2、登录账号是否具有应用权限<br>" +
        "3、回调地址是否包括上面地址<br>" +
        "错误信息: <br>" +
        error
      }` +
        `&client_uid=${client_uid}` +
        `&client_key=${client_key}`
    );
  }
});

app.get("/requests", oneLogin);

app.get("/callback", oneToken);

export default app;
