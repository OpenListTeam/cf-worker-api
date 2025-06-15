export function encodeCallbackData(data: CallbackData) {
    return btoa(JSON.stringify(data))
}
