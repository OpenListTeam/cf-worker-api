import { Context } from "hono";

const baidu_endpoints = {
  authorization: 'https://openapi.baidu.com/oauth/2.0/authorize',
  token: 'https://openapi.baidu.com/oauth/2.0/token',
};

interface EnvConfig {
  clientId: string;
  clientSecret: string;
}

interface BaiduTokenRequest {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
  grant_type: 'authorization_code' | 'refresh_token';
  code?: string;
  refresh_token?: string;
}

interface BaiduErrorResponse {
  error: string;
  error_description: string;
}

interface BaiduTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  session_key?: string;
  session_secret?: string;
}

export async function baiduAuth(c: Context, env: EnvConfig) {
  try {
    if (!env.clientId || !env.clientSecret) {
      return c.json({ 
        error: '百度网盘配置未完成',
        message: '请联系管理员配置BAIDU_CLIENT_ID和BAIDU_CLIENT_SECRET环境变量'
      }, 500);
    }

    const redirectUri = c.req.query('redirect_uri') || 
                        'https://api.oplist.org/baidupcs/callback';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.clientId,
      redirect_uri: redirectUri,
      scope: 'basic,netdisk',
      display: 'popup',
      force_login: '1',
    });

    const authUrl = `${baidu_endpoints.authorization}?${params.toString()}`;
    return c.json({ authorization_url: authUrl }, 200);
    
  } catch (error) {
    return c.json({ error: '服务器内部错误' }, 500);
  }
}

export async function baiduToken(c: Context, env: EnvConfig) {
  try {
    if (!env.clientId || !env.clientSecret) {
      return c.json({ 
        error: '百度网盘配置未完成',
        message: '请联系管理员配置BAIDU_CLIENT_ID和BAIDU_CLIENT_SECRET环境变量'
      }, 500);
    }

    const req: BaiduTokenRequest = {
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: c.req.query('grant_type') as any || 'authorization_code',
      code: c.req.query('code') || undefined,
      refresh_token: c.req.query('refresh_token') || undefined,
      redirect_uri: c.req.query('redirect_uri') || 
                    'https://api.oplist.org/baidupcs/callback'
    };

    if (req.grant_type === 'authorization_code' && !req.code) {
      return c.json({ error: '需要授权码' }, 400);
    }

    if (req.grant_type === 'refresh_token' && !req.refresh_token) {
      return c.json({ error: '需要刷新令牌' }, 400);
    }

    const body = new URLSearchParams();
    body.append('grant_type', req.grant_type);
    body.append('client_id', req.client_id);
    body.append('client_secret', req.client_secret);

    if (req.grant_type === 'authorization_code') {
      body.append('code', req.code!);
      if (req.redirect_uri) body.append('redirect_uri', req.redirect_uri);
    } else {
      body.append('refresh_token', req.refresh_token!);
    }

    const response = await fetch(baidu_endpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    const data: BaiduTokenResponse | BaiduErrorResponse = await response.json();

    if (!response.ok) {
      const error = data as BaiduErrorResponse;
      return c.json({
        error: error.error || '令牌交换失败',
        description: error.error_description || '未知错误'
      }, 403);
    }

    const tokenData = data as BaiduTokenResponse;
    const baiduTokenParam = encodeURIComponent(JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token
    }));

    return c.redirect(`https://api.oplist.org/?baidu_token=${baiduTokenParam}`, 302);


  } catch (error) {
    return c.json({ error: '服务器内部错误' }, 500);
  }
}