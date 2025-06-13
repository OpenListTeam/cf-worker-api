import { type FormSchema, getFormData, loadFromCookieData, openURL } from "@/utils/form";
import Button from "@/widgets/Button";
import { For, Match, Switch, onMount } from "solid-js";

export const NAME = "OneDrive";

const blacklist_form_fields = ["driver_id", "access_token", "refresh_token"];

export default function (props: { driver_id: string; endpoint: string }) {
  const schema: FormSchema = {
    fields: [
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
    callback_uri: `${props.endpoint}/onedrive/callback`,
  };

  function submit() {
    const prepareUrl = `${props.endpoint}/${props.driver_id}/prepare`;
    const formData = getFormData(blacklist_form_fields);
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      if (!blacklist_form_fields.includes(key)) {
        params.append(key, value as string);
      }
    });
    openURL(`${prepareUrl}?${params.toString()}`, "_self");
  }

  onMount(() => {
    // load params from `resolve_data` cookie
    loadFromCookieData();
  });
  return (
    <form id="form-list" target="form-list-iframe" class="w-full">
      <iframe class="hidden" name="form-list-iframe" title="nop" />
      <For each={schema.fields || []}>
        {(field) => (
          <div class="my-2 w-full">
            <div class="mb-1 font-bold">{field.key_text}</div>
            <div>
              <Switch fallback={<span class="text-red-500">Unsupported field type: {field.type}</span>}>
                <Match when={field.type === "text"}>
                  <input
                    type="text"
                    name={field.key}
                    class="w-full p-2 border border-gray-300 rounded"
                    placeholder={field.description || ""}
                    required={field.required}
                    value={String(field.default) || ""}
                  />
                </Match>
                <Match when={field.type === "password"}>
                  <input
                    type="password"
                    name={field.key}
                    class="w-full p-2 border border-gray-300 rounded"
                    placeholder={field.description || ""}
                    required={field.required}
                    value={String(field.default) || ""}
                  />
                </Match>
                <Match when={field.type === "select"}>
                  <select
                    name={field.key}
                    class="w-full p-2 border border-gray-300 rounded"
                    required={field.required}
                    title="Select an option"
                  >
                    {field.options?.map((option) => (
                      <option value={option.value} selected={option.value === field.default}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                </Match>
                <Match when={field.type === "checkbox"}>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      name={field.key}
                      class="form-checkbox"
                      checked={Boolean(field.default)}
                      required={field.required}
                    />
                    <span class="ml-2">{field.key_text}</span>
                  </label>
                </Match>
              </Switch>
            </div>
          </div>
        )}
      </For>
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">client_id</div>
        <div>
          <input
            type="text"
            name="client_id"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Client ID"
            // required
            value={schema?.client_id || ""}
          />
        </div>
      </div>
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">client_secret</div>
        <div>
          <input
            type="text"
            name="client_secret"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Client Secret"
            // required
            value={schema?.client_secret || ""}
          />
        </div>
      </div>
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">Callback URL</div>
        <div>
          <input
            type="text"
            name="callback_uri"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Callback URL"
            // required
            value={schema?.callback_uri || ""}
          />
        </div>
      </div>
      <input name="from_browser" type="hidden" value="true" />
      <div class="my-2 w-full">
        <Button class="w-full" onClick={(_) => submit()}>
          Get Token
        </Button>
      </div>
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">access_token</div>
        <div>
          <textarea
            name="access_token"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Access Token"
            rows="4"
            readonly
          />
        </div>
      </div>
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">refresh_token</div>
        <div>
          <textarea
            name="refresh_token"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Refresh Token"
            rows="4"
            readonly
          />
        </div>
      </div>
    </form>
  );
}
