import {Context} from "hono";
import {showErr} from "./error";
import * as local from "hono/cookie";
import * as refresh from "./shares/refresh"
import * as configs from "./shares/configs"

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
    let client_uid: string | undefined = c.req.query('client_uid');
    let client_key: string | undefined = c.req.query('client_key');
    let server_use: string | undefined = c.req.query('server_use');
    if (!server_use)
        return c.json({text: "参数缺少"}, 500);
    if (!client_uid || !client_key)
        if (server_use == "false")
            return c.json({text: "参数缺少"}, 500);
    client_uid = client_key = ""
    const params_all: Record<string, any> = {
        response_type: 'code',
        client_id: server_use == "true" ? env.yandexui_uid : client_uid,
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
    let client_uid, client_key;
    const env = c.env;
    const code = <string>c.req.query("code");
    const error = <string>c.req.query("error");
    const server_use = local.getCookie(c, 'server_use')
    if (server_use && server_use == "true") {
        client_uid = local.getCookie(c, 'client_uid')
        client_key = local.getCookie(c, 'client_key')
    }
    const error_description = <string>c.req.query("error_description");
    const getToken = async (): Promise<Token> => {
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", server_use == "true" ? env.yandexui_uid : env.client_uid);
        params.append("client_secret", server_use == "true" ? env.yandexui_key : env.client_key);
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
                + `&driver_txt=yandexui_go`
            );
        } else {
            return c.redirect(showErr(token.error_description || token.error || "Token request failed", "", ""));
        }
    } catch (error) {
        console.error("Token request error:", error);
        return c.redirect(showErr("Failed to get access token", "", ""));
    }
}

// 刷新令牌 ##############################################################################
export async function genToken(c: Context) {
    const clients_info: configs.Clients | undefined = configs.getInfo(c);
    const refresh_text: string | undefined = c.req.query('refresh_ui');
    if (!clients_info) return c.json({text: "传入参数缺少"}, 500);
    if (!refresh_text) return c.json({text: "缺少刷新令牌"}, 500);
    // 请求参数 ==========================================================================
    const params: Record<string, any> = {
        grant_type: "refresh_token",
        refresh_token: refresh_text,
        client_id: clients_info.servers ? c.env.alicloud_uid : clients_info.app_uid,
        client_secret: clients_info.servers ? c.env.alicloud_key : clients_info.app_key,
    };
    return await refresh.genToken(c, "https://oauth.yandex.com/token", params, "POST",
        "data.access_token", "data.refresh_token", "error");
}