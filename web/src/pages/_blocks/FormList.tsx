import Cookie from "@/utils/cookie";
import Button from "@/widgets/Button";
import { For, Match, Switch, createSignal, onMount } from "solid-js";
import type { CollectionItem } from "../../../collection";

const blacklist_form_fields = ["driver_id", "access_token", "refresh_token"];

const openUrl = (url: string, target: "_blank" | "_self" = "_blank") => {
  const a = document.createElement("a");
  a.href = url;
  a.target = target;
  a.rel = "noopener noreferrer";
  a.click();
  a.remove();
};

export default function FormList(props: { collection: Record<string, CollectionItem>; endpoint?: string }) {
  const [driver, setDriver] = createSignal<string>(Object.keys(props.collection)[0] || "");
  const [accessToken, setAccessToken] = createSignal<string>("");
  const [refreshToken, setRefreshToken] = createSignal<string>("");

  const endpoint = props.endpoint || "/api";

  function submit() {
    const prepareUrl = `${endpoint}/${driver()}/prepare`;
    const form = document.getElementById("form-list") as HTMLFormElement;
    const formData = new FormData(form);
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      if (!blacklist_form_fields.includes(key)) {
        params.append(key, value as string);
      }
    });
    openUrl(`${prepareUrl}?${params.toString()}`, "_self");
  }

  onMount(() => {
    // load params from url
    const params = new URLSearchParams(window.location.search);
    if (params.has("access_token")) setAccessToken(params.get("access_token") || "");
    if (params.has("refresh_token")) setRefreshToken(params.get("refresh_token") || "");

    // load params from `resolve_data` cookie
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
        if (key === "access_token") return setAccessToken(String(value));
        if (key === "refresh_token") return setRefreshToken(String(value));
        const input = document.querySelector(`#form-list [name="${key}"]`) as
          | HTMLInputElement
          | HTMLSelectElement
          | null;
        if (input) {
          input.value = String(value);
        }
      }
    }
  });
  return (
    <form id="form-list" target="form-list-iframe" class="w-full">
      <iframe class="hidden" name="form-list-iframe" title="nop" />
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">Driver Name</div>
        <div>
          <select
            name="driver_id"
            class="w-full p-2 border border-gray-300 rounded"
            title="Select a driver"
            on:change={(e) => {
              setDriver(e.currentTarget.value);
            }}
          >
            {Object.entries(props.collection).map(([key, data]) => (
              <option value={key}>{data.name}</option>
            ))}
          </select>
        </div>
      </div>
      <For each={props.collection[driver()]?.extra_field || []}>
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
            value={props.collection[driver()]?.client_id || ""}
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
            value={props.collection[driver()]?.client_secret || ""}
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
            value={props.collection[driver()]?.callback_uri || ""}
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
          >
            {accessToken()}
          </textarea>
        </div>
      </div>
      <div class="my-2 w-full">
        <div class="mb-1 font-bold">refresh_token</div>
        <div>
          <textarea
            name="refresh_token"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Access Token"
            rows="4"
            readonly
          >
            {refreshToken()}
          </textarea>
        </div>
      </div>
    </form>
  );
}
