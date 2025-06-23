import {Context} from "hono";

export interface Clients {
    app_uid: string | undefined,
    app_key: string | undefined,
    secrets: string | undefined,
    drivers: string | undefined,
    servers: boolean | undefined,
}

export function getInfo(c: Context): Clients | undefined {
    const client_uid: string | undefined = c.req.query('client_uid');
    const client_key: string | undefined = c.req.query('client_key');
    const secret_key: string | undefined = c.req.query('secret_key');
    const driver_txt: string | undefined = c.req.query('driver_txt');
    const server_use: string | undefined = c.req.query('server_use');
    if (!server_use || server_use === "false")
        if (!driver_txt || !client_key)
            return undefined;
    return {
        app_uid: client_uid === undefined ? "" : client_uid,
        app_key: client_key === undefined ? "" : client_key,
        secrets: secret_key === undefined ? "" : secret_key,
        drivers: driver_txt === undefined ? "" : driver_txt,
        servers: !server_use ? false : server_use == "true"
    };
}

//自动获取回调地址
export function getCallbackUrl(c: Context, path: string): string {
    // 优先使用部署变量 MAIN_URLS
    if (c.env.MAIN_URLS) {
        return `https://${c.env.MAIN_URLS}${path}`;
    }

    // 当 MAIN_URLS 为空时自动获取
    let protocol = c.req.header('X-Forwarded-Proto');

    // 如果没有 X-Forwarded-Proto 头，尝试从请求URL解析
    if (!protocol && c.req.url) {
        try {
            const url = new URL(c.req.url);
            protocol = url.protocol.replace(':', '');
        } catch {
            protocol = 'https'; // 默认使用HTTPS
        }
    }

    // 如果仍然没有协议信息，使用默认值
    protocol = protocol || 'https';

    let host = c.req.header('X-Forwarded-Host') || c.req.header('host');

    // 如果没有从请求头中获取到主机信息，尝试从请求URL中提取
    if (!host && c.req.url) {
        try {
            const url = new URL(c.req.url);
            host = url.hostname;
        } catch {
            // 解析失败时保持host为undefined
        }
    }

    if (host) {
        return `${protocol}://${host}${path}`;
    }

    return `https://default.example.com${path}`;
}
