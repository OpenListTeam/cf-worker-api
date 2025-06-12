import {Context, Hono} from 'hono'
import {KVNamespace} from '@cloudflare/workers-types';
import {serveStatic} from 'hono/cloudflare-workers' // @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'
import * as local from "hono/cookie";
import * as oneui from './oneui';
import * as aliui from './aliui';
import * as baidupcsui from './baidupcsui';

export type Bindings = {
    MAIN_URLS: string
    BAIDU_CLIENT_ID: string
    BAIDU_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.use("*", serveStatic({manifest: manifest, root: "./"}));

// OneDrive 登录申请
app.get('/onedrive/requests', async (c) => {
    return oneui.oneLogin(c);
})

// OneDrive 令牌申请
app.get('/onedrive/callback', async (c) => {
    return oneui.oneToken(c);
})

// 阿里云盘登录申请
app.get('/alicloud/requests', async (c: Context) => {
    return aliui.alyLogin(c);
});

// 阿里云盘令牌申请
app.get('/alicloud/callback', async (c: Context) => {
    return aliui.alyToken(c);
});

// 百度网盘登录申请
app.get('/baidupcs/requests', async (c: Context) => {
    return baidupcsui.baiduAuth(c, {
        clientId: c.env.BAIDU_CLIENT_ID,
        clientSecret: c.env.BAIDU_CLIENT_SECRET
    });
});

// 百度网盘令牌申请
app.get('/baidupcs/callback', async (c: Context) => {
    return baidupcsui.baiduToken(c, {
        clientId: c.env.BAIDU_CLIENT_ID,
        clientSecret: c.env.BAIDU_CLIENT_SECRET
    });
});

export default app