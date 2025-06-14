import { getFormData, loadFromCookieData, openURL } from "@/utils/form";
import { Button, FieldBox, Form, Input, TextArea } from "@/widgets/Form";
import { onMount } from "solid-js";

export const NAME = "Aliyun";

const blacklist_form_fields = ["driver_id", "access_token", "refresh_token"];

export default function (props: { driver_id: string; endpoint: string }) {
  function submit() {
    const prepareUrl = `${props.endpoint}/${props.driver_id}/prepare`;
    const formData = getFormData("#form-list", blacklist_form_fields);
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
    <Form id="form-list" noTarget>
      <FieldBox label="Client ID">
        <Input type="text" name="client_id" placeholder="Client ID" />
      </FieldBox>
      <FieldBox label="Client Secret">
        <Input type="text" name="client_secret" placeholder="Client Secret" />
      </FieldBox>
      <FieldBox label="Callback URL">
        <input
          type="text"
          name="callback_uri"
          class="w-full p-2 border border-gray-300 rounded"
          placeholder="Callback URL"
          value={`${props.endpoint}/aliyun/callback`}
        />
      </FieldBox>
      <FieldBox>
        <Button onClick={submit}>Get Token</Button>
      </FieldBox>
      <FieldBox label="Access Token">
        <TextArea name="access_token" placeholder="Access Token" />
      </FieldBox>
      <FieldBox label="Refresh Token">
        <TextArea name="refresh_token" placeholder="Refresh Token" />
      </FieldBox>
    </Form>
  );
}
