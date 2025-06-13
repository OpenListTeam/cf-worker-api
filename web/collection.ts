import wranglerConfig from "../wrangler.toml";

const main_url = {
  dev: wranglerConfig.vars.MAIN_URL,
  prod: wranglerConfig.env.production.vars.MAIN_URL,
};

const isProd = import.meta.env.PROD ?? process.env.NODE_ENV === "production";

export const MAIN_URL = main_url[isProd ? "prod" : "dev"];

console.info(`Using main URL: ${MAIN_URL}`);

function withOrigin(path: string, origin?: string) {
  const _origin = origin || MAIN_URL;
  return `${_origin}${path}`;
}

export interface CollectionItem {
  name: string;
  extra_field?: {
    key: string;
    key_text: string;
    type: "text" | "password" | "select" | "checkbox";
    default?: string | boolean;
    options?: { value: string; text: string }[];
    required?: boolean;
    description?: string;
  }[];
  client_id?: string;
  client_secret?: string;
  callback_uri?: string;
}

// will requeset post `/:id/prepare` with form data
const collection: Record<string, CollectionItem> = {
  onedrive: {
    name: "OneDrive",
    extra_field: [
      {
        key: "app_type",
        key_text: "版本",
        type: "select",
        default: "global",
        options: [
          { value: "global", text: "官方" },
          { value: "cn", text: "世纪互联" },
          { value: "de", text: "德国版本" },
          { value: "us", text: "美国版本" },
        ],
      },
    ],
    callback_uri: withOrigin("/onedrive/callback"),
  },
  aliyun: {
    name: "阿里云盘",
    callback_uri: withOrigin("/aliyun/callback"),
  },
};

export default collection;
