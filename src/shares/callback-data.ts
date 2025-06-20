export function encodeCallbackData(data: CallbackData) {
    const json = JSON.stringify(data);
    // 编码为UTF-8字节数组
    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);
    return btoa(String.fromCharCode(...bytes))
}
