
    // 获取登录秘钥 #######################################################
    async function getLogin() {
    let server_use = document.getElementById("server_use").checked;
    let apps_uuid = document.getElementById("client-id").value;
    let apps_keys = document.getElementById("app-secret").value;
    let apps_type = document.getElementById("site-select").value;
    let secret_key = document.getElementById("secret-key").value;
    if (!server_use && (apps_uuid === "" || apps_keys === "")) {
        Swal.fire({
            position: 'top',
            icon: 'info',
            title: '获取失败',
            text: '请先填写客户端ID和应用机密',
            showConfirmButton: true,
        });
        return;
    }
    let apps_subs = apps_type.split("_")[0]
    let post_urls = "/" + apps_subs + "/requests?client_uid=" + apps_uuid
        + "&client_key=" + apps_keys + "&apps_types=" + apps_type
        + "&server_use=" + server_use
    if (apps_subs === "baiduyun") post_urls += "&secret_key=" + secret_key
    try {
        const response = await fetch(post_urls, {
            method: 'GET', headers: {'Content-Type': 'application/json'}
        });
        // 解析响应内容 ===============================================
        const response_data = await response.json();
        if (response.status === 200) {
            if (apps_subs === "onedrive" || apps_subs === "115cloud"
                || apps_subs === "baiduyun" || apps_subs === "googleui") {
                window.location.href = response_data.text;
            }
            if (apps_subs === "123cloud") {
                document.getElementById("access-token").value = response_data.text;
                return;
            }
            if (apps_type === "alicloud_qr") {
                let sid = response_data.sid;
                await Swal.fire({
                    position: 'top',
                    icon: 'info',
                    title: '扫码登录',
                    html: `<div>请扫码登录，完成后点确定</div>` +
                        `<img src="${response_data.text}" alt="">`,
                    showConfirmButton: true
                });
                post_urls = "/alicloud/callback" +
                    "?client_id=" + apps_uuid +
                    "&client_secret=" + apps_keys +
                    "&grant_type=" + "authorization_code" +
                    "&code=" + sid
                let auth_post = await fetch(post_urls, {method: 'GET'});
                let auth_data = await auth_post.json();
                if (auth_post.status === 200) {
                    const callbackData = {
                        access_token: auth_data.access_token,
                        refresh_token: auth_data.refresh_token,
                        client_uid: apps_uuid,
                        client_key: apps_keys
                    };
                    window.location.hash = "#" + encodeCallbackData(callbackData);
                    getToken();
                }
            }
        } else Swal.fire({
            icon: 'error',
            title: "获取秘钥失败: " + response_data.text,
            showConfirmButton: true,
            timer: 1000
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '获取秘钥失败: ' + error,
            showConfirmButton: true,
            timer: 1000
        });
    }
}

// 自动复制内容 #####################################################
function autoCopy(on_element) {
    // if (on_element.innerText === "") return;
    navigator.clipboard.writeText(on_element.value).then(() => {
        // 显示复制成功的提示
        Swal.fire({
            position: 'top',
            icon: 'success',
            title: '内容已复制',
            showConfirmButton: false,
            timer: 700
        });
    }).catch(err => {
        // 复制失败时的处理
        console.error('无法复制文本：', err);
        Swal.fire({
            position: 'top',
            icon: 'error',
            title: '复制失败',
            text: '请手动复制',
            showConfirmButton: true,
        });
    })
}

async function getToken() {
    const hash = window.location.hash.substring(1); // 去掉#号
    let message_err = '';
    if (hash) {
        try {
            const callbackData = JSON.parse(atob(hash));
            const server_use = callbackData.server_use;
            const client_uid = callbackData.client_uid;
            const secret_key = callbackData.secret_key;
            const driver_txt = callbackData.driver_txt;
            const client_key = callbackData.client_key;
            const access_token = callbackData.access_token;
            const refresh_token = callbackData.refresh_token;

            // 从历史记录清除#号部分，避免隐私信息泄漏
            // 这只会在正常解析JSON后执行，其他的hash不会被清除
            // window.history.replaceState(null, null, window.location.pathname + window.location.search);
            // 在Chrome 136测试发现，通过History API操作，不但不会修改记录反而还会多出一条记录。
            // Chrome浏览器可以使用location.replace修改记录，Firefox浏览器上此方法无效。
            // 参见：https://stackoverflow.com/questions/61711130/removing-sensitive-url-data-from-borwser-history
            window.location.replace('#');

            if (server_use == "true") {
                document.getElementById("server_use").checked = true;
            }
            message_err = callbackData.message_err;

            document.getElementById("site-select").value = driver_txt;
            if (!driver_txt || driver_txt === "") {
                document.getElementById("site-select").value = "onedrive_go";
            }
            document.getElementById("app-secret").value = client_key;
            document.getElementById("client-id").value = client_uid;
            document.getElementById("access-token").value = access_token;
            document.getElementById("refresh-token").value = refresh_token;
            if (secret_key) {
                document.getElementById("secret-key").value = secret_key;
            }
        } catch (e) {
            console.error('parse callback data error', e);
        }
    }

    // 获取select元素和输入框元素
    const siteSelect = document.getElementById('site-select');
    const callbackUrlInput = document.getElementById('callback-url');
    // 监听select的变化
    siteSelect.addEventListener('change', function () {
        const selectedValue = this.value.split("_")[0]; // 获取选中的value
        // 更新输入框的值
        callbackUrlInput.value = `https://api.oplist.org/${selectedValue}/callback`;
        document.getElementById('secret-key-view').hidden = true;
        if (siteSelect.value === "baiduyun_go") {
            document.getElementById('secret-key-view').hidden = false;
        }

    });
    document.getElementById('server_use').addEventListener('change', function () {
        const clientIdInput = document.getElementById('client-id');
        const appSecretInput = document.getElementById('app-secret');
        const secretKeyInput = document.getElementById('secret-key');
        const server_flag = document.getElementById('server_use');
        if ((siteSelect.value === "alicloud_qr"
            || siteSelect.value === "123cloud_go"
            || siteSelect.value === "onedrive_cn"
            || siteSelect.value === "onedrive_us"
            || siteSelect.value === "onedrive_de"
        ) && server_flag.checked) {
            server_flag.checked = false;
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: '暂不支持',
                html: "阿里云、123云盘、OneDrive非官方区域暂不支持使用官方密钥",
                showConfirmButton: true,
            });
            return;
        }
        if (this.checked) {
            // 禁用输入框并清空内容
            clientIdInput.disabled = true;
            clientIdInput.value = '';
            appSecretInput.disabled = true;
            appSecretInput.value = '';
            secretKeyInput.disabled = true;
            secretKeyInput.value = '';
        } else {
            // 启用输入框
            clientIdInput.disabled = false;
            appSecretInput.disabled = false;
            secretKeyInput.disabled = false;
        }
    });
    // 页面加载时初始化回调地址
    window.onload = function () {
        siteSelect.dispatchEvent(new Event('change'));

    };

    if (message_err !== '') {
        Swal.fire({
            position: 'top',
            icon: 'error',
            title: '授权失败',
            html: message_err,
            showConfirmButton: true,
        });
    }
}
