export function encodeCallbackData(data: Secrets) {
    const json = JSON.stringify(data);
    // 编码为UTF-8字节数组
    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);
    return btoa(String.fromCharCode(...bytes))
}

// 前端页面使用的回调数据
export interface Secrets {
    access_token?: string;
    refresh_token?: string;
    server_use?: string | boolean;
    client_uid?: string;
    client_key?: string;
    secret_key?: string;
    driver_txt?: string;
    message_err?: string;
    app_id?: string;
    sign_key?: string;
    expires_in?: number;
}
