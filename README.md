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

## 配置设置

| 网盘驱动 | 区域类型 | driver   | apps_types  | client_uid | client_key    | secret_key |
| -------- | -------- | -------- | ----------- | ---------- | ------------- | ---------- |
| Onedrive | 企业版本 | onedrive | onedrive_go | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 世纪互联 | onedrive | onedrive_cn | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 美国版本 | onedrive | onedrive_us | 客户端ID   | 客户端秘钥    | /          |
| Onedrive | 德国版本 | onedrive | onedrive_de | 客户端ID   | 客户端秘钥    | /          |
| 阿里云盘 | 扫码登录 | alicloud | alicloud_qr | APP ID     | App Secret    | /          |
| 百度云盘 | 验证登录 | baiduyun | baiduyun_go | AppID      | AppKey        | SecretKey  |
| 115 云盘 | 验证登录 | 115cloud | 115cloud_go | AppID      | AppSecret     | /          |
| 123 云盘 | 验证登录 | 123cloud | 123cloud_go | client_id  | client_secret | /          |
| 谷歌云盘 | 验证登录 | googleui | googleui_go | 客户端ID   | 客户端秘钥    | /          |
| Yandex   | 验证登录 | yandexui | yandexui_go | AppID      | AppKey        | /          |



## 部署方法

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
