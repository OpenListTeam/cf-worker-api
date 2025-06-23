import * as local from "hono/cookie";
import { Context } from "hono";
import {showErr} from "../shares/message";
import * as refresh from "../shares/refresh";
import * as configs from "../shares/configs";
import {encodeCallbackData,Secrets} from "../shares/secrets";

const driver_map: string[] = [
    "https://oauth.fnnas.com/api/v1/oauth/getAuthUrl",       // 获取授权URL
    "https://oauth.fnnas.com/api/v1/oauth/exchangeToken",    // 交换访问令牌
    "https://oauth.fnnas.com/api/v1/oauth/refreshToken"      // 刷新访问令牌
];

// 登录申请 ##############################################################################
export async function oneLogin(c: Context) {
    const client_key: string = <string>c.req.query('client_key');
    const driver_txt: string = <string>c.req.query('driver_txt');
    const server_use: string = <string>c.req.query('server_use');
    const redirectUrl: string = 'https://' + c.env.MAIN_URLS + '/static/quark_oauth.html';
    
    if (server_use == "false" && !client_key)
        return c.json({text: "参数缺少"}, 500);
    
    // 请求参数 ==========================================================================
    const params_all = {
        authType: 4,
        grantType: "authorization_code",
        redirectUrlToFrontend: redirectUrl,
        trimAppId: "com.trim.cloudstorage"
    };
    
    // 执行请求 ===========================================================================
    try {
        const response = await fetch(driver_map[0], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params_all)
        });
        
        const responseData = await response.json() as { code: number; msg?: string; data?: { authUrlWithNonce?: string } };
        
        if (responseData.code !== 0) {
            return c.json({text: responseData.msg || "获取授权URL失败"}, 500);
        }
        
        if (server_use == "false") {
            local.setCookie(c, 'client_key', client_key);
        }
        local.setCookie(c, 'driver_txt', driver_txt);
        local.setCookie(c, 'server_use', server_use);
        
        if (!responseData.data || !responseData.data.authUrlWithNonce) {
            return c.json({text: "授权URL数据缺失"}, 500);
        }
        return c.json({text: responseData.data.authUrlWithNonce}, 200);
    } catch (error) {
        return c.json({text: error}, 500);
    }
}

// 令牌申请 ##############################################################################
export async function oneToken(c: Context) {
    let nonce, client_key, driver_txt, server_use;
    
    try {
        // 获取回调参数 ====================================================================
        nonce = c.req.query('nonce');
        server_use = local.getCookie(c, 'server_use');
        driver_txt = local.getCookie(c, 'driver_txt');
        client_key = local.getCookie(c, 'client_key');
        
        if (!nonce) {
            return c.redirect(showErr("缺少nonce参数", "", ""));
        }
        
        // 请求参数 ==========================================================================
        const params_all = {
            authType: 4,
            nonce: nonce,
            trimAppId: "com.trim.cloudstorage"
        };
        
        // 执行请求 ===========================================================================
        const response = await fetch(driver_map[1], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params_all)
        });
        
        const json = await response.json() as {
            code: number;
            msg?: string;
            data?: {
                accessToken: string;
                refreshToken: string;
                expiresIn: number;
                appId: string;
                signKey: string;
            }
        };
        
        if (server_use == "false") {
            local.deleteCookie(c, 'client_key');
        }
        local.deleteCookie(c, 'driver_txt');
        local.deleteCookie(c, 'server_use');
        
        if (json.code === 0 && json.data) {
            const data = json.data;
            const callbackData:Secrets = {
                access_token: data.accessToken,
                refresh_token: data.refreshToken,
                client_key: client_key,
                app_id: data.appId,
                sign_key: data.signKey,
                expires_in: data.expiresIn,
                driver_txt: driver_txt,
            };
            return c.redirect("/#" + encodeCallbackData(callbackData));
        }
        
        return c.redirect(showErr(json.msg || "获取令牌失败", "", client_key));
    } catch (error) {
        return c.redirect(showErr(<string>error, "", ""));
    }
}

// 刷新令牌 ##############################################################################
export async function genToken(c: Context) {
    const clients_info: configs.Clients | undefined = configs.getInfo(c);
    const refresh_text: string | undefined = c.req.query('refresh_ui');
    
    if (!clients_info) return c.json({text: "传入参数缺少"}, 500);
    if (!refresh_text) return c.json({text: "缺少刷新令牌"}, 500);
    
    // 请求参数 ==========================================================================
    const params = {
        authType: 4,
        refreshToken: refresh_text,
        trimAppId: "com.trim.cloudstorage"
    };
    
    try {
        const response = await fetch(driver_map[2], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        const json = await response.json() as {
            code: number;
            msg?: string;
            data?: {
                tokenInfo: {
                    accessToken: string;
                    refreshToken: string;
                    expiresIn: number;
                    appId: string;
                    signKey: string;
                }
            }
        };
        
        if (json.code === 0 && json.data && json.data.tokenInfo) {
            const tokenInfo = json.data.tokenInfo;
            return c.json({
                access_token: tokenInfo.accessToken,
                refresh_token: tokenInfo.refreshToken,
                expires_in: tokenInfo.expiresIn,
                app_id: tokenInfo.appId,
                sign_key: tokenInfo.signKey
            }, 200);
        } else {
            return c.json({text: json.msg || "刷新令牌失败"}, 500);
        }
    } catch (error) {
        return c.json({text: `刷新令牌出错: ${error}`}, 500);
    }
}