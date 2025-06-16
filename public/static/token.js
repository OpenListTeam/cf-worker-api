async function getToken() {
    const strSearch = window.location.search;
    const urlParams = new URLSearchParams(strSearch);
    const server_use = urlParams.get("server_use");
    const client_uid = urlParams.get("client_uid");
    const secret_key = urlParams.get("secret_key");
    const driver_txt = urlParams.get("driver_txt");
    const client_key = urlParams.get("client_key");
    const access_token = urlParams.get("access_token");
    const refresh_token = urlParams.get("refresh_token");
    const message_err = urlParams.get("message_err");
    document.getElementById("site-select").value = driver_txt;
    if (!driver_txt || driver_txt === "")
        document.getElementById("site-select").value = "onedrive_go";
    document.getElementById("app-secret").value = client_key;
    document.getElementById("client-id").value = client_uid;
    document.getElementById("access-token").value = access_token;
    document.getElementById("refresh-token").value = refresh_token;
    if (secret_key)
        document.getElementById("secret-key").value = secret_key;
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
            siteSelect.value == "alicloud_oa" ||
            siteSelect.value == "alicloud_qr"
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
        if ((siteSelect.value === "alicloud_qr"
            || siteSelect.value === "alicloud_oa"
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
                html: "阿里云、123云盘、OneDrive非美国区域暂不支持使用官方密钥",
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