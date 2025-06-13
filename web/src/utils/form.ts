import Cookie from "./cookie";

export function openURL(url: string, target: "_blank" | "_self" = "_blank") {
  const a = document.createElement("a");
  a.href = url;
  a.target = target;
  a.rel = "noopener noreferrer";
  a.click();
  a.remove();
}

export function getFormData(blacklistFields: string[] = []): FormData {
  const form = document.getElementById("form-list") as HTMLFormElement;
  const formData = new FormData(form);
  const filteredData = new FormData();
  formData.forEach((value, key) => {
    if (!blacklistFields.includes(key)) {
      filteredData.append(key, value);
    }
  });
  return filteredData;
}

// load params from `resolve_data` cookie
export function loadFromCookieData(blacklistFields: string[] = []) {
  const resolveData = Cookie.get("resolve_data");
  if (resolveData) {
    let data = {};
    try {
      data = JSON.parse(resolveData);
    } catch {
      data = {};
      Cookie.delete("resolve_data");
    }
    for (const [key, value] of Object.entries(data)) {
      if (blacklistFields.includes(key)) continue;
      const input = document.querySelector(`#form-list [name="${key}"]`) as HTMLInputElement | HTMLSelectElement | null;
      if (input) {
        input.value = String(value);
      }
    }
  }
}

export interface FormSchema {
  fields?: {
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
