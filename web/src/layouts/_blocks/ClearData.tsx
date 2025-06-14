import Cookie from "@/utils/cookie";
import { Button } from "@/widgets/Form";

const clean_list = ["from_browser", "resolve_data"];

export function clearSavedData() {
  for (const key of clean_list) {
    Cookie.delete(key);
  }
}

export function ClearDataButton(props: { class?: string }) {
  return (
    <Button
      class={props.class}
      variant="warning"
      outline
      onClick={() => {
        clearSavedData();
        window.location.reload();
      }}
    >
      Clear Local Data
    </Button>
  );
}
