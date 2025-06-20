import * as local from "hono/cookie";
import {Context} from "hono";


const driver_map: string[] = [
    "https://open-api.123pan.com/api/v1/access_token",
    "https://open-api.123pan.com/api/v1/access_token"
]

// 登录申请 ##############################################################################
export async function oneLogin(c: Context) {
    const client_uid: string = <string>c.req.query('client_uid');
    const client_key: string = <string>c.req.query('client_key');
    const driver_txt: string = <string>c.req.query('driver_txt');
    const server_use: string = <string>c.req.query('server_use');
    if (server_use == "false" && (!driver_txt || !client_uid || !client_key))
        return c.json({text: "参数缺少"}, 500);
    // 请求参数 ==========================================================================
    const params_all: Record<string, any> = {
        client_id: client_uid,
        clientSecret: client_key,
    };
    // 执行请求 ===========================================================================
    try {
        const paramsString = new URLSearchParams(params_all).toString();
        const response: Response = await fetch(driver_map[0], {
            method: 'POST', body: paramsString,
            headers: {
                'Platform': "open_platform",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        const json: Record<string, any> = await response.json();
        local.setCookie(c, 'driver_txt', driver_txt);
        return c.json({text: json.data.accessToken}, 200);
    } catch (error) {
        return c.json({text: error}, 500);
    }
}

// 令牌申请 ##############################################################################
export async function oneToken(c: Context) {
    return await oneLogin(c);
}

// 刷新令牌 ##############################################################################
export async function genToken(c: Context) {
    return c.json({text: "此网盘不支持"}, 500);
}
