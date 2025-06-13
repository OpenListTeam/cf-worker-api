import {Context, Hono} from 'hono'
import {KVNamespace} from '@cloudflare/workers-types';
import {serveStatic} from 'hono/cloudflare-workers' // @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'
import * as local from "hono/cookie";
import * as oneui from './oneui';
import * as aliui from './aliui';
import * as ui115 from './115ui';
import * as ui123 from './123ui';
import * as baidu from './baidu';
import * as goapi from './goapi';
import * as yandex from './yandex';

export type Bindings = {
    MAIN_URLS: string, baiduyun_ext: string,
    onedrive_uid: string, onedrive_key: string,
    alicloud_uid: string, alicloud_key: string,
    baiduyun_uid: string, baiduyun_key: string,
    cloud115_uid: string, cloud115_key: string,
    googleui_uid: string, googleui_key: string,
    YANDEX_CLIENT_ID: string, YANDEX_CLIENT_SECRET: string,
}

const app = new Hono<{ Bindings: Bindings }>()
app.use("*", serveStatic({manifest: manifest, root: "./"}));

// 登录申请 ##############################################################################
app.get('/onedrive/requests', async (c) => {
    return oneui.oneLogin(c);
})
// 令牌申请 ##############################################################################
app.get('/onedrive/callback', async (c) => {
    return oneui.oneToken(c);
})

// 登录申请 ##############################################################################
app.get('/alicloud/requests', async (c: Context) => {
    return aliui.alyLogin(c);
});

// 令牌申请 ##############################################################################
app.get('/alicloud/callback', async (c: Context) => {
    return aliui.alyToken(c);
});

// 登录申请 ##############################################################################
app.get('/baiduyun/requests', async (c: Context) => {
    return baidu.oneLogin(c);
});

// 令牌申请 ##############################################################################
app.get('/baiduyun/callback', async (c: Context) => {
    return baidu.oneToken(c);
});

// 登录申请 ##############################################################################
app.get('/115cloud/requests', async (c: Context) => {
    return ui115.oneLogin(c);
});

// 令牌申请 ##############################################################################
app.get('/115cloud/callback', async (c: Context) => {
    return ui115.oneToken(c);
});

// 登录申请 ##############################################################################
app.get('/123cloud/requests', async (c: Context) => {
    return ui123.oneLogin(c);
});

// 令牌申请 ##############################################################################
app.get('/123cloud/callback', async (c: Context) => {
    return ui123.oneToken(c);
});

// 登录申请 ##############################################################################
app.get('/googleui/requests', async (c: Context) => {
    return goapi.oneLogin(c);
});

// 令牌申请 ##############################################################################
app.get('/googleui/callback', async (c: Context) => {
    return goapi.oneToken(c);
});

app.get('/yandex/requests', async (c: Context) => {return yandex.yandexLogin(c)});

app.get('/yandex/callback', async (c: Context) => {return yandex.yandexCallBack(c)});

export default app