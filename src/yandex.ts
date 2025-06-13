import {Context} from "hono";
import {showErr} from "./error";
import * as local from "hono/cookie";
interface Token {
    token_type?: string;
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
}

export async function yandexLogin(c: Context) {
    const env = c.env
    const client_uid: string = <string>c.req.query('client_uid');
    const client_key: string = <string>c.req.query('client_key');
    const server_use: string = <string>c.req.query('server_use');
    if (server_use == "false" && (!client_uid || !client_key))
        return c.json({text: "参数缺少"}, 500);
    const params_all: Record<string, any> = {
        response_type: 'code',
        client_id: server_use == "true" ? env.YANDEX_CLIENT_ID : client_uid,
    };
    if (server_use == "false") {
        local.setCookie(c, 'client_uid', client_uid);
        local.setCookie(c, 'client_key', client_key);
    }
    local.setCookie(c, 'server_use', server_use);
    const urlWithParams = new URL("https://oauth.yandex.com/authorize");
    Object.keys(params_all).forEach(key => {
        urlWithParams.searchParams.append(key, params_all[key]);
    });
    try {
        return c.json({text: urlWithParams.href}, 200);
    } catch (error) {
        return c.json({text: error}, 500);
    }
}


export async function yandexCallBack(c: Context) {
    const env = c.env;
    const code = <string>c.req.query("code");
    const error = <string>c.req.query("error");
    const error_description = <string>c.req.query("error_description");

    const getToken = async (): Promise<Token> => {
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", env.YANDEX_CLIENT_ID);
        params.append("client_secret", env.YANDEX_CLIENT_SECRET);
        params.append("code", code);

        const resp = await fetch("https://oauth.yandex.com/token", {
            method: "POST",
            body: params,
        });

        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        return await resp.json();
    };

    if (error) {
        return c.redirect(showErr(error_description || error, "", ""));
    }

    if (!code) {
        return c.redirect(showErr("Authorization code missing", "", ""));
    }

    try {
        const token: Token = await getToken();
        console.log("Yandex token response:", token);
        if (!token.error && token.access_token) {
            const server_use = local.getCookie(c, 'server_use');
            const client_uid = local.getCookie(c, 'client_uid');
            const client_key = local.getCookie(c, 'client_key');

            local.deleteCookie(c, 'server_use');
            local.deleteCookie(c, 'client_uid');
            local.deleteCookie(c, 'client_key');

            return c.redirect(
                `/?access_token=${token.access_token}`
                + `&refresh_token=${token.refresh_token}`
                + `&client_uid=${server_use == "true" ? "" : client_uid || ""}`
                + `&client_key=${server_use == "true" ? "" : client_key || ""}`
                + `&driver_txt=yandex_go`
            );
        } else {
            return c.redirect(showErr(token.error_description || token.error || "Token request failed", "", ""));
        }
    } catch (error) {
        console.error("Token request error:", error);
        return c.redirect(showErr("Failed to get access token", "", ""));
    }
}