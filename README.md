# OpenList API Token Generator

## 项目说明

用于OpenList获取部分网盘API的接口和页面

部署地址：[OpenList Token 获取工具](https://api.oplist.org/)

## 接口文档

### 登录接口

- #### 接口地址

#### `https://api.oplist.org/<driver>/requests`

- #### 接口参数

| 参数名称     | 类型  | 必要 | 示例                             | 说明                               |
| ------------ | ----- | ---- | -------------------------------- | ---------------------------------- |
| `driver`     | `str` | 是   | onedrive                         | 平台驱动名称，详见"配置设置"部分   |
| `server_use` | `str` | 是   | true                             | 如果为真，则无需提供AppID和Key     |
| `client_uid` | `str` | 是   | 4308adf60f3fe4058533             | 提供客户端ID，详见"配置设置"部分   |
| `client_key` | `str` | 是   | 09F260A4BF5EF7F4181E35E59759C0BC | 提供应用密码，详见"配置设置"部分   |
| `apps_types` | `str` | 是   | onedrive_go                      | 驱动类型，格式 `driver`+`类型后缀` |
| `server_set` | `str` | 是   | true                             | 是否使用服务器预设的应用ID和密钥   |
| `secret_key` | `str` | 否   | 3yp8NOMsRulxll44f5ayrxF1vgBfPW85 | 百度网盘额外需要 secret_key字段    |

- #### 返回内容

如果执行无误，回返回url

| 参数名称 | 类型  | 必要 | 示例                                         | 说明               |
| -------- | ----- | ---- | -------------------------------------------- | ------------------ |
| `text`   | `str` | 否   | https://example.com/oauth2/login/?xxx=xxxxxx | 返回登录链接到前端 |

### 回调接口

- #### 接口地址

#### `https://api.oplist.org/<driver>/callback`

- #### 接口参数

| 参数名称     | 类型  | 必要 | 示例                             | 说明                             |
| ------------ | ----- | ---- | -------------------------------- | -------------------------------- |
| `driver`     | `str` | 是   | onedrive                         | 平台驱动名称，详见"配置设置"部分 |
| `code`       | `str` | 是   | 40YJzShAJSodbIXvNEw3Ru9N4Lkznx93 | 回调的认证代码，登录之后URL自带  |
| `server_use` | `str` | 是   | true                             | 如果为真，则无需提供AppID和Key   |
| `client_uid` | `str` | 否   | 4308adf60f3fe4058533             | 提供云盘验证码登录提供client_uid |
| `client_key` | `str` | 否   | 09F260A4BF5EF7F4181E35E59759C0BC | 提供云盘验证码登录提供client_key |
| `grant_type` | `str` | 否   | authorization_code               | 提供云盘，固定authorization_code |

- #### 返回内容

如果执行无误，会返回经Base64编码的JSON数据。

| 参数名称          | 类型  | 必要 | 示例                             | 说明                         |
| ----------------- | ----- | ---- |----------------------------------| ---------------------------- |
| `<url 302重定向>` | `302` | 否   | `/#eyJhY2Nlc3Nf......`           | 返回编码的数据到前端         |
| `access_token`    | `str` | 否   | VqKbrWpetI3HnvyvsWquv9BJFL3j4xjc | 返回访问令牌到前端           |
| `refresh_token`   | `str` | 否   | oMMPXrCCrRwMoqVD321Z03PSoxmsAKjI | 返回刷新令牌到前端           |
| `server_use`      | `str` | 否   | true                             | 是否使用 OpenList 提供的参数 |
| `client_uid`      | `str` | 否   | b2eaau943b1bx464                 | 用户传入的客户端ID           |
| `client_key`      | `str` | 否   | SHcAplYIY679BEVF9FveGKtLuSI6MikU | 用户传入的应用密钥           |
| `driver_txt`      | `str` | 否   | onedrive                         | 用户传入的驱动类型           |
| `message_err`     | `str` | 否   | Connection reset by peer         | 服务端错误信息               |

### 刷新令牌

- #### 接口地址

#### `https://api.oplist.org/<driver>/renewapi`

- #### 接口参数

| 参数名称     | 类型  | 必要 | 示例                             | 说明                             |
| ------------ | ----- | ---- | -------------------------------- | -------------------------------- |
| `apps_types` | `str` | 是   | onedrive_go                      | 平台网盘类型，详见"配置设置"部分 |
| `refresh_ui` | `str` | 是   | 40YJzShAJSodbIXvNEw3Ru9N4Lkznx93 | 刷新需要token，登录之后URL自带   |
| `server_use` | `str` | 是   | true                             | 如果为真，则无需提供AppID和Key   |
| `client_uid` | `str` | 否   | 4308adf60f3fe4058533             | 提供云盘验证码登录提供client_uid |
| `client_key` | `str` | 否   | 09F260A4BF5EF7F4181E35E59759C0BC | 提供云盘验证码登录提供client_key |
| `secret_key` | `str` | 否   | 09F260A4BF5EF7F4181E35E59759C0BC | 百度网盘额外需要 secret_key字段  |

- #### 返回内容

如果执行无误，会返回url。

| 参数名称        | 类型  | 必要 | 示例            | 说明               |
| --------------- | ----- | ---- | --------------- | ------------------ |
| `refresh_token` | `str` | 是   | xxxxxxxxxxxxxxx | 返回刷新令牌到前端 |
| `access_token`  | `str` | 是   | xxxxxxxxxxxxxxx | 返回访问令牌到前端 |

## 配置设置

| 网盘驱动 | 区域类型 | driver   | apps_types  | client_uid | client_key    | secret_key |
| -------- | -------- | -------- | ----------- | ---------- | ------------- | ---------- |
| Onedrive | 企业版本 | onedrive | onedrive_go | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 个人账号 | onedrive | onedrive_pr | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 世纪互联 | onedrive | onedrive_cn | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 美国版本 | onedrive | onedrive_us | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 德国版本 | onedrive | onedrive_de | 客户端ID   | 客户端秘钥    | /          |
| 阿里云盘 | 扫码登录 | alicloud | alicloud_qr | APP ID     | App Secret    | /          |
| 阿里云盘 | 跳转登录 | alicloud | alicloud_go | APP ID     | App Secret    | /          |
| 阿里云盘 | 直接登录 | alicloud | alicloud_cs | /      | /    | /          |
| 百度云盘 | 验证登录 | baiduyun | baiduyun_go | /      | AppKey        | SecretKey  |
| 百度云盘 | 手动登录 | baiduyun | baiduyun_ob | /      | AppKey        | SecretKey  |
| 115 云盘 | 跳转登录 | 115cloud | 115cloud_go | AppID      | AppSecret     | /          |
| 123 云盘 | 跳转登录 | 123cloud | 123cloud_go | client_id  | client_secret | /          |
| 谷歌云盘 | 跳转登录 | googleui | googleui_go | 客户端ID   | 客户端秘钥    | /          |
| Yandex   | 跳转登录 | yandexui | yandexui_go | AppID      | AppKey        | /          |
| DropBox   | 跳转登录 | yandexui | dropboxs_go | AppID      | AppKey        | /          |



## 部署方法

### 克隆代码

```shell
git clone https://github.com/OpenListTeam/cf-worker-api.git
```

### 修改配置

创建并修改`wrangler.jsonc`

```shell
cp wrangler.jsonc.example wrangler.jsonc
```

修改变量信息：

```
  "vars": {
    "MAIN_URLS": "api.example.com",
    "onedrive_uid": "*****************************",
    "onedrive_key": "*****************************",
    "alicloud_uid": "*****************************",
    "alicloud_key": "*****************************",
    "baiduyun_key": "*****************************",
    "baiduyun_ext": "*****************************",
    "cloud115_uid": "*****************************",
    "cloud115_key": "*****************************",
    "googleui_uid": "*****************************",
    "googleui_key": "*****************************",
    "yandexui_uid": "*****************************",
    "yandexui_key": "*****************************",
    "dropboxs_uid": "*****************************",
    "dropboxs_key": "*****************************"
  },
```

### 测试代码

```txt
npm install
npm run dev
```

### 部署项目

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
