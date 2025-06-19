import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
  className?: string;
  as?: "input" | "textarea";
}

export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      label,
      error,
      iconLeft,
      iconRight,
      inputSize = "md",
      className = "",
      as = "input",
      ...props
    },
    ref
  ) => {
    const sizeStyles =
      inputSize === "sm"
        ? "h-8 text-sm px-2"
        : inputSize === "lg"
        ? "h-12 text-lg px-4"
        : "h-10 text-base px-3";
    const baseInputStyles = cn(
      "w-full border rounded-lg py-1 bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900",
      sizeStyles,
      iconLeft ? "pl-10" : "",
      iconRight ? "pr-10" : "",
      error
        ? "border-red-400 focus:ring-red-400"
        : "border-gray-300 focus:border-blue-500",
      props.disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
    );
    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-700 select-none">
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center",
            error ? "ring-2 ring-red-400" : ""
          )}
        >
          {iconLeft && (
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              {iconLeft}
            </span>
          )}
          {as === "textarea" ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              className={baseInputStyles + " resize-none min-h-[80px]"}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              {...Object.fromEntries(
                Object.entries(props).filter(
                  ([k]) => k !== "inputSize" && k !== "as"
                )
              )}
              className={baseInputStyles}
            />
          )}
          {iconRight && (
            <span className="absolute right-3 text-gray-400 pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <div className="mt-1 text-xs text-red-500 font-medium animate-fade-in">
            {error}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
