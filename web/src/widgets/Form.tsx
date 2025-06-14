import clsx from "clsx";
import { type JSX, Show, createEffect, onMount, splitProps } from "solid-js";

/* -- Form -- */

interface FormProps extends JSX.HTMLAttributes<HTMLFormElement> {
  noTarget?: boolean;
  class?: string;
  children?: string | JSX.Element;
}

export function Form(props: FormProps) {
  const [_, rest] = splitProps(props, ["noTarget", "class", "children"]);
  const randomName = `form-list-iframe_${Math.random().toString(36).substring(2, 15)}`;
  return (
    <form id="form-list" target={props.noTarget ? randomName : undefined} class={clsx("w-full", props.class)} {...rest}>
      <Show when={props.noTarget}>
        <iframe class="hidden" name={randomName} title="nop" />
      </Show>
      {props.children}
    </form>
  );
}

/* -- FieldBox -- */

interface FieldBoxProps extends JSX.HTMLAttributes<HTMLDivElement> {
  label?: string;
  for?: string;
  children?: JSX.Element;
}

export function FieldBox(props: FieldBoxProps) {
  return (
    <div class="my-2 w-full">
      <Show when={props.label} fallback={props.children}>
        <label for={props.for}>
          <div class="mb-1 font-bold w-full">{props.label}</div>
          <div>{props.children}</div>
        </label>
      </Show>
    </div>
  );
}

/* -- Input -- */

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "password" | "email" | "number" | "checkbox" | "radio";
  name?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
  value?: string | number;
  class?: string;
  disabled?: boolean;
  onChange?: (e: Event & { currentTarget: HTMLInputElement; target: Element }) => void;
}

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, [
    "type",
    "name",
    "placeholder",
    "required",
    "defaultValue",
    "value",
    "class",
    "disabled",
    "onChange",
  ]);
  let ref: HTMLInputElement | undefined;
  onMount(() => {
    if (local.value) {
      ref!.value = local.value as string;
    } else if (local.defaultValue) {
      ref!.value = local.defaultValue as string;
    }
  });
  createEffect(() => {
    if (local.value !== undefined && ref) {
      ref.value = local.value as string;
    }
  });
  return (
    <input
      class={clsx("w-full p-2 border border-gray-300 rounded", local.class)}
      type={local.type || "text"}
      name={local.name}
      placeholder={props.placeholder}
      required={props.required}
      disabled={props.disabled}
      onChange={props.onChange}
      ref={(el: HTMLInputElement) => {
        ref = el;
      }}
      {...rest}
    />
  );
}

/* -- Select -- */

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  name?: string;
  options: { value: string; text: string }[];
  required?: boolean;
  defaultValue?: string;
  value?: string;
  class?: string;
  disabled?: boolean;
  description?: string;
  onChange?: (e: Event & { currentTarget: HTMLSelectElement; target: Element }) => void;
}
export function Select(props: SelectProps) {
  const [local, rest] = splitProps(props, [
    "name",
    "options",
    "required",
    "defaultValue",
    "value",
    "class",
    "disabled",
    "description",
    "onChange",
  ]);
  let ref: HTMLSelectElement | undefined;
  onMount(() => {
    if (local.value) {
      ref!.value = local.value;
    } else if (local.defaultValue) {
      ref!.value = local.defaultValue;
    }
  });
  createEffect(() => {
    if (local.value !== undefined && ref) {
      ref.value = local.value;
    }
  });
  return (
    <select
      class={clsx("w-full p-2 border border-gray-300 rounded", local.class)}
      name={local.name}
      required={props.required}
      disabled={props.disabled}
      onChange={props.onChange}
      ref={(el: HTMLSelectElement) => {
        ref = el;
      }}
      {...rest}
    >
      <option value="" disabled selected={!local.value && !local.defaultValue}>
        {props.description || "Select an option"}
      </option>
      {local.options.map((option) => (
        <option value={option.value} selected={option.value === local.value || option.value === local.defaultValue}>
          {option.text}
        </option>
      ))}
    </select>
  );
}

/* -- Checkbox -- */

interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  class?: string;
  inputClass?: string;
  textClass?: string;
  onChange?: (e: Event & { currentTarget: HTMLInputElement; target: Element }) => void;
}
export function Checkbox(props: CheckboxProps) {
  const [local, rest] = splitProps(props, [
    "name",
    "label",
    "checked",
    "defaultChecked",
    "class",
    "inputClass",
    "textClass",
    "onChange",
  ]);
  let ref: HTMLInputElement | undefined;
  onMount(() => {
    if (local.checked !== undefined) {
      ref!.checked = local.checked;
    } else if (local.defaultChecked !== undefined) {
      ref!.checked = local.defaultChecked;
    }
  });
  createEffect(() => {
    if (local.checked !== undefined && ref) {
      ref.checked = local.checked;
    }
  });
  return (
    <label class={clsx("inline-flex items-center", local.class)}>
      <input
        type="checkbox"
        name={local.name}
        checked={local.checked ?? local.defaultChecked}
        onChange={props.onChange}
        class={clsx("form-checkbox", local.inputClass)}
        ref={(el: HTMLInputElement) => {
          ref = el;
        }}
        {...rest}
      />
      <span class="ml-2">
        <span class={local.textClass}> {local.label}</span>
      </span>
    </label>
  );
}

/* -- Button -- */

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "success" | "danger" | "warning";
  outline?: boolean;
  disabled?: boolean;
  class?: string;
  children?: string | JSX.Element;
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["type", "variant", "outline", "disabled", "class", "children"]);
  return (
    <button
      type={local.type || "button"}
      disabled={local.disabled}
      class={clsx(
        "text-center px-4 py-2 rounded cursor-pointer w-full",
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

/* TextArea */
interface TextAreaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  class?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  onChange?: (e: Event & { currentTarget: HTMLTextAreaElement; target: Element }) => void;
}
export function TextArea(props: TextAreaProps) {
  const [local, rest] = splitProps(props, [
    "name",
    "placeholder",
    "required",
    "defaultValue",
    "value",
    "class",
    "disabled",
    "readOnly",
    "rows",
    "onChange",
  ]);
  let ref: HTMLTextAreaElement | undefined;
  onMount(() => {
    if (local.value) {
      ref!.value = local.value;
    } else if (local.defaultValue) {
      ref!.value = local.defaultValue;
    }
  });
  createEffect(() => {
    if (local.value !== undefined && ref) {
      ref.value = local.value;
    }
  });
  return (
    <textarea
      class={clsx("w-full p-2 border border-gray-300 rounded", local.class)}
      name={local.name}
      placeholder={props.placeholder}
      required={props.required}
      disabled={props.disabled}
      rows={local.rows || 4}
      onChange={props.onChange}
      readOnly={props.readOnly}
      ref={(el: HTMLTextAreaElement) => {
        ref = el;
      }}
      {...rest}
    />
  );
}
