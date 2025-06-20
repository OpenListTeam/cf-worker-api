async function getToken() {
    const hash = window.location.hash.substring(1); // 去掉#号Add commentMore actions
    let message_err = "";
    if (hash) {
        try {
            const jsonBytes = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
            const json = new TextDecoder().decode(jsonBytes);
            const callbackData = JSON.parse(json);
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
            // hash不是JSON，可能是HTML内的锚点
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

        const clientIdInput = document.getElementById('client-id');
        const appSecretInput = document.getElementById('app-secret');
        const serverUseCheckbox = document.getElementById('server_use');
        const clientIdContainer = clientIdInput.closest('.mb-3');
        const appSecretContainer = appSecretInput.closest('.mb-3');
        const serverUseContainer = serverUseCheckbox.closest('.mb-3');
        const callbackContainer = callbackUrlInput.closest('.mb-3');

        // 阿里云盘扫码登录v2不需要客户端ID、应用机密和回调地址
        if (siteSelect.value === "alicloud_oa") {
            // 隐藏整个字段容器
            clientIdContainer.style.display = 'none';
            appSecretContainer.style.display = 'none';
            serverUseContainer.style.display = 'none';
            callbackContainer.style.display = 'none';

            // 清空值
            clientIdInput.value = '';
            appSecretInput.value = '';
            serverUseCheckbox.checked = false;
        } else {
            // 恢复显示
            clientIdContainer.style.display = 'block';
            appSecretContainer.style.display = 'block';
            serverUseContainer.style.display = 'block';
            callbackContainer.style.display = 'block';

            // 恢复正常状态
            if (!serverUseCheckbox.checked) {
                clientIdInput.disabled = false;
                appSecretInput.disabled = false;
            }
            clientIdInput.placeholder = '';
            appSecretInput.placeholder = '';
            serverUseCheckbox.disabled = false;
        }
        if (siteSelect.value.split("_")[0] === "onedrive") {
            document.getElementById('sharepoint-url-view').hidden = false;
            document.getElementById('sharepoint-btn-view').hidden = false;
            document.getElementById('sharepoint-uid-view').hidden = false;
        } else {
            document.getElementById('sharepoint-url-view').hidden = true;
            document.getElementById('sharepoint-btn-view').hidden = true;
            document.getElementById('sharepoint-uid-view').hidden = true;
        }
        if (siteSelect.value.split("_")[0] === "baiduyun") {
            document.getElementById('secret-key-view').hidden = false;
            document.getElementById('client-id-view').hidden = true;
            if (siteSelect.value == "baiduyun_ob") {
                document.getElementById("app-secret").value = "NqOMXF6XGhGRIGemsQ9nG0Na";
                document.getElementById("secret-key").value = "SVT6xpMdLcx6v4aCR4wT8BBOTbzFO8LM";
                document.getElementById("callback-url").value = "oob";
            }
        } else {
            document.getElementById('secret-key-view').hidden = true;
            document.getElementById('client-id-view').hidden = false;
            document.getElementById("app-secret").value = "";
            document.getElementById("secret-key").value = "";
            document.getElementById("client-id").value = "";
        }
        if (siteSelect.value == "baiduyun_ob" ||
            siteSelect.value == "123cloud_go" ||
            // siteSelect.value == "onedrive_go" ||
            siteSelect.value == "onedrive_cn" ||
            siteSelect.value == "onedrive_us" ||
            siteSelect.value == "onedrive_de" ||
            siteSelect.value == "alicloud_oa"
            // siteSelect.value == "alicloud_qr"
        ) {
            document.getElementById("server_use").checked = false;
            document.getElementById("server_use").disabled = true;
        }

    });
    document.getElementById('server_use').addEventListener('change', function () {
        const clientIdInput = document.getElementById('client-id');
        const appSecretInput = document.getElementById('app-secret');
        const secretKeyInput = document.getElementById('secret-key');
        const server_flag = document.getElementById('server_use');
        if ((
            // siteSelect.value === "alicloud_qr"
               siteSelect.value === "alicloud_oa"
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
                html: "123云盘、OneDrive非美国区域暂不支持使用官方密钥",
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

    if (message_err) {
        Swal.fire({
            position: 'top',
            icon: 'error',
            title: '授权失败',
            html: message_err,
            showConfirmButton: true,
        });
    }
}