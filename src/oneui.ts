import * as local from "hono/cookie";
import {Context} from "hono";

const driver_map: Record<string, string[]> = {
    "onedrive_go": [
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    ],
    "onedrive_cn": [
        'https://login.chinacloudapi.cn/common/oauth2/authorize',
        'https://login.chinacloudapi.cn/common/oauth2/token'
    ],
    "onedrive_de": [
        'https://login.microsoftonline.de/common/oauth2/v2.0/authorize',
        'https://graph.microsoft.de/common/oauth2/v2.0/token'
    ],
    "onedrive_us": [
        'https://login.microsoftonline.us/common/oauth2/v2.0/authorize',
        'https://graph.microsoft.us/common/oauth2/v2.0/token'
    ],
}

// 登录申请 ##############################################################################
export async function oneLogin(c: Context) {
    const client_uid = <string>c.req.query('client_uid');
    const client_key = <string>c.req.query('client_key');
    const driver_txt = <string>c.req.query('apps_type');
    const scopes_all = 'offline_access Files.ReadWrite.All';
    const client_url: string = driver_map[driver_txt][0];
    // 请求参数 ==========================================================================
    const params_all: Record<string, any> = {
        client_id: client_uid,
        scope: scopes_all,
        response_type: 'code',
        redirect_uri: 'https://' + c.env.MAIN_URLS + '/onedrive/callback'
    };
    const urlWithParams = new URL(client_url);
    Object.keys(params_all).forEach(key => {
        urlWithParams.searchParams.append(key, params_all[key]);
    });
    // 执行请求 ===========================================================================
    try {
        const response = await fetch(urlWithParams.href, {
            method: 'GET',
        });
        local.setCookie(c, 'client_uid', client_uid);
        local.setCookie(c, 'client_key', client_key);
        local.setCookie(c, 'apps_types', driver_txt);
        return c.json({text: response.url}, 200);
    } catch (error) {
        return c.json({text: error}, 500);
    }
}

// 令牌申请 ##############################################################################
export async function oneToken(c: Context) {
    let login_data, client_uid, client_key, driver_txt, client_url, params_all;
    try { // 请求参数 ====================================================================
        login_data = <string>c.req.query('code');
        client_uid = <string>local.getCookie(c, 'client_uid')
        client_key = <string>local.getCookie(c, 'client_key')
        driver_txt = <string>local.getCookie(c, 'apps_types')
        client_url = driver_map[driver_txt][1];
        params_all = {
            client_id: client_uid,
            client_secret: client_key,
            redirect_uri: 'https://' + c.env.MAIN_URLS + '/onedrive/callback',
            code: login_data,
            grant_type: 'authorization_code'
        };
    } catch (error) {
        return c.redirect(
            `/?message_err=${"授权失败，请检查: <br>" +
            "1、应用ID和应用机密是否正确<br>" +
            "2、登录账号是否具有应用权限<br>" +
            "3、回调地址是否包括上面地址<br>" +
            "4、登录可能过期，请重新登录<br>" +
            "错误信息: <br> " + error}`
            + `&client_uid=NULL`
            + `&client_key=`);
    }
    // console.log(login_data);

    // 执行请求 ===========================================================================
    try {
        const paramsString = new URLSearchParams(params_all).toString();
        const response: Response = await fetch(client_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: paramsString,
        });
        // console.log(response);
        local.deleteCookie(c, 'client_uid');
        local.deleteCookie(c, 'client_key');
        local.deleteCookie(c, 'apps_types');
        if (!response.ok)
            return c.redirect(
                `/?message_err=${"授权失败，请检查: <br>" +
                "1、应用ID和应用机密是否正确<br>" +
                "2、登录账号是否具有应用权限<br>" +
                "3、回调地址是否包括上面地址<br>" +
                "错误信息: <br>" + response.text()}`
                + `&client_uid=${client_uid}`
                + `&client_key=${client_key}`);
        const json: Record<string, any> = await response.json();
        if (json.token_type === 'Bearer') {
            return c.redirect(
                `/?access_token=${json.access_token}`
                + `&refresh_token=${json.refresh_token}`
                + `&client_uid=${client_uid}`
                + `&client_key=${client_key}`);
        }
    } catch (error) {
        return c.redirect(
            `/?message_err=${"授权失败，请检查: <br>" +
            "1、应用ID和应用机密是否正确<br>" +
            "2、登录账号是否具有应用权限<br>" +
            "3、回调地址是否包括上面地址<br>" +
            "错误信息: <br>" + error}`
            + `&client_uid=${client_uid}`
            + `&client_key=${client_key}`);
    }
}