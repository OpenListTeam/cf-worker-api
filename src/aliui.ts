import {Context} from "hono";
import * as local from "hono/cookie";
import * as configs from "./shares/configs";
import * as refresh from "./shares/refresh";

const driver_map = [
    'https://openapi.aliyundrive.com/oauth/authorize/qrcode',
    'https://openapi.aliyundrive.com/oauth/access_token',
    'https://openapi.aliyundrive.com/oauth/qrcode',
]

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

// 登录申请 ##############################################################################
export async function alyLogin(c: Context) {
    try {
        const client_uid: string = <string>c.req.query('client_uid');
        const client_key: string = <string>c.req.query('client_key');
        const driver_txt: string = <string>c.req.query('driver_txt');
        const server_use: string = <string>c.req.query('server_use');
        if (server_use == "false" && (!driver_txt || !client_uid || !client_key))
            return c.json({text: "参数缺少"}, 500);
        const req: AliQrcodeReq = {
            client_id: server_use == "true" ? c.env.alicloud_uid : client_uid,
            client_secret: server_use == "true" ? c.env.alicloud_key : client_key,
            scopes: ['user:base', 'file:all:read', 'file:all:write']
        }
        const response = await fetch(driver_map[0], {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req),
        });
        if (!response.ok) {
            const error: AliAccessTokenErr = await response.json();
            return c.json({text: `${error.code}: ${error.message}`}, 403);
        }
        local.setCookie(c, 'driver_txt', driver_txt);
        local.setCookie(c, 'server_use', server_use);
        const data: Record<string, any> = await response.json();
        return c.json({
            "text": data.qrCodeUrl,
            "sid": data.sid
        }, 200);
    } catch (error) {
        return c.json({text: error}, 500);
    }
}


// 令牌申请 ##############################################################################
export async function alyToken(c: Context) {
    let server_use: string = <string>local.getCookie(c, 'server_use')
    const req: AliAccessTokenReq = {
        client_id: server_use == "true" ? c.env.alicloud_uid : <string>c.req.query('client_id'),
        client_secret: server_use == "true" ? c.env.alicloud_key : <string>c.req.query('client_secret'),
        grant_type: <string>c.req.query('grant_type'),
        code: <string>c.req.query('code'),
        refresh_token: <string>c.req.query('refresh_token')
    };
    if (req.grant_type !== 'authorization_code' && req.grant_type !== 'refresh_token')
        return c.json({text: 'Incorrect GrantType'}, 400);
    if (req.grant_type === 'authorization_code' && !req.code)
        return c.json({text: 'Code missed'}, 400);
    if (req.grant_type === 'refresh_token' && req.refresh_token.split('.').length !== 3)
        return c.json({text: 'Incorrect refresh_token or missed',}, 400);
    if (req.grant_type === 'authorization_code') {
        let code_urls: string = 'https://openapi.aliyundrive.com/oauth/qrcode/' + req.code + '/status'
        let auth_post: Response = await fetch(code_urls, {method: 'GET'});
        let code_data: Record<string, string> = await auth_post.json();
        if (!auth_post.ok || code_data.status !== "LoginSuccess") {
            return c.json({text: 'Login failed:' + code_data.status}, 401);
        }
        req.code = code_data.authCode;
    }
    local.deleteCookie(c, 'driver_txt');
    local.deleteCookie(c, 'server_use');
    try {
        const response = await fetch(driver_map[1], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        });
        if (!response.ok) {
            const error: AliAccessTokenErr = await response.json();
            return c.json({text: `${error.code}: ${error.message}`,}, 403);
        }
        const data: Record<string, any> = await response.json();
        return c.json(data);
    } catch (error) {
        return c.json({text: error}, 500
        );
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
        client_id: clients_info.servers ? c.env.alicloud_uid : clients_info.app_uid,
        client_secret: clients_info.servers ? c.env.alicloud_key : clients_info.app_key,
        grant_type: 'refresh_token',
        refresh_token: refresh_text
    };
    return await refresh.genToken(c, driver_map[1], params, "POST",
        "access_token", "refresh_token", "message");
}