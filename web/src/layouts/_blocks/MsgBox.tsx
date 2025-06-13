import clsx from "clsx";
import { type JSX, Show } from "solid-js";

interface ErrorBoxProps extends JSX.HTMLAttributes<HTMLDivElement> {
  message: string;
  type: "warning" | "error" | "success" | "info";
}

export default function MsgBox(props: ErrorBoxProps) {
  return (
    <div
      class={clsx(
        "p-4 mb-4 text-sm rounded-lg border-1",
        props.type === "warning"
          ? "bg-warning/20 text-warning-dark border-warning-dark/10"
          : props.type === "error"
            ? "bg-error/20 text-error-dark border-error-dark/10"
            : props.type === "success"
              ? "bg-success/20 text-success-dark border-success-dark/10"
              : "bg-info/20 text-primary-dark border-primary-dark/10",
        props.class
      )}
      role="alert"
    >
      <span>{props.message}</span>
    </div>
  );
}

export function MsgBoxFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("msg_type") || "info";
  const realType = (["error", "warning", "success", "info"].includes(type) ? type : "error") as ErrorBoxProps["type"];
  const message = params.get("message") || params.get("msg") || "";
  return (
    <Show when={message}>
      <MsgBox type={realType} message={message} />
    </Show>
  );
}
