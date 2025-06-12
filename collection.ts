function withOrigin(path: string, origin?: string) {
  const _origin = origin || `${window.location.origin}/api`;
  return `${_origin}${path}`;
}
interface CollectionItem {
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
  client_key?: string;
  callback_url: string;
}

// will requeset post `/:id/handle` with form data
const collection: Record<string, CollectionItem> = {
  "onedrive": {
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
    callback_url: withOrigin("/onedrive/callback"),
  },
};

export default collection;
