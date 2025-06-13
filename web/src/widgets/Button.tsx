import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "success" | "danger" | "warning";
  outline?: boolean;
  disabled?: boolean;
  class?: string;
  children?: string | JSX.Element;
}

export default function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["type", "variant", "outline", "disabled", "class", "children"]);
  return (
    <button
      type={local.type || "button"}
      disabled={local.disabled}
      class={clsx(
        "text-center px-4 py-2 rounded cursor-pointer",
        (local.outline ?? false)
          ? {
              primary: "border-1 border-primary bg-primary/20 text-primary hover:bg-primary hover:text-white",
              success: "border-1 border-success bg-success/20 text-success hover:bg-success hover:text-white",
              danger: "border-1 border-error bg-error/20 text-error hover:bg-error hover:text-white",
              warning: "border-1 border-warning bg-warning/20 text-warning hover:bg-warning hover:text-white",
            }[local.variant || "primary"]
          : {
              primary: "bg-primary hover:bg-primary-dark text-white",
              success: "bg-success hover:bg-success-dark text-white",
              danger: "bg-error hover:bg-error-dark text-white",
              warning: "bg-warning hover:bg-warning-dark text-white",
            }[local.variant || "primary"],
        "transition-all duration-200 ease-in-out",
        local.class
      )}
      {...rest}
    >
      {props.children}
    </button>
  );
}
