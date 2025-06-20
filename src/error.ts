import {encodeCallbackData} from "./shares/callback-data";

export function showErr(error?: string, client_uid?: string, client_key?: string) {
    const message_err = "授权失败，请检查:" + "\n" +
    "1、应用ID和应用机密是否正确" + "\n" +
    "2、登录账号是否具有应用权限" + "\n" +
    "3、回调地址是否包括上面地址" + "\n" +
    "错误信息: " + error;
    const callbackData: CallbackData = {
        message_err: message_err,
        client_uid: client_uid,
        client_key: client_key,
    };
    return "/#" + encodeCallbackData(callbackData);
}