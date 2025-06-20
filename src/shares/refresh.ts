// 登录申请 ##############################################################################
import {Context} from "hono";

export async function genToken(c: Context,
                               APIUrl: string,
                               Params: Record<string, string>,
                               Method: string = "GET",
                               access_name: string = "access_token",
                               refresh_name: string = "refresh_token",
                               error_name: string = "error_description"
): Promise<any> {
    // 请求参数 ==========================================================================
    const parma_str = new URLSearchParams(Params).toString();
    const parma_url = new URL(APIUrl);
    Object.keys(Params).forEach(key => {
        parma_url.searchParams.append(key, Params[key]);
    });
    try { // 执行请求 =====================================================================
        const header_data = {'Content-Type': 'application/x-www-form-urlencoded'}
        const result_data: Response = await fetch(
            Method == "GET" ? parma_url.href : APIUrl, {
                method: Method,
                body: Method == "GET" ? undefined : parma_str,
                headers: Method == "GET" ? undefined : header_data
            }
        );
        const result_json: Record<string, any> = await result_data.json();
        if (getDynamicValue(result_json, refresh_name, Params.refresh_token))
            return c.json({
                refresh_token: getDynamicValue(result_json, refresh_name, Params.refresh_token),
                access_token: getDynamicValue(result_json, access_name, ""),
            }, 200);
        return c.json({text: result_json[error_name]}, 500);
    } catch (error) {
        console.error("刷新token失败", error);
        return c.json({text: error}, 500);
    }
}

function getDynamicValue(resultJson: Record<string, any>, path: string, origin_text: any): any {
    if (path === "none") return "";
    if (path === "copy") return origin_text;
    // 将路径拆分为属性数组，例如 'data.refresh_token' 拆分为 ['data', 'refresh_token']
    const properties = path.split('.');
    // 从 resultJson 开始遍历属性
    let currentValue = resultJson;
    // 遍历每个属性，逐层深入对象
    for (const prop of properties) {
        // 检查当前值是否为对象且具有该属性
        if (currentValue && typeof currentValue === 'object' && prop in currentValue) {
            currentValue = currentValue[prop];
        } else {
            // 如果路径中的某一层不存在，则返回 undefined
            return undefined;
        }
    }
    return currentValue;
}

