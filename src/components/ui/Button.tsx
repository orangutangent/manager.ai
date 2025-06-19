import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/24/solid";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "fab";
  size?: "sm" | "md" | "lg" | "fab";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
      outline:
        "border border-gray-300 text-black bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500",
      ghost: "bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500",
      fab: "bg-blue-600 text-white shadow-lg rounded-full p-0 w-14 h-14 fixed bottom-6 right-6 z-50 transition-transform hover:scale-110 active:scale-95 hover:shadow-2xl focus-visible:ring-blue-500 flex items-center justify-center",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg",
      fab: "w-14 h-14 text-3xl p-0",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[variant === "fab" ? "fab" : size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children ?? (variant === "fab" && <PlusIcon className="w-7 h-7" />)}
      </button>
    );
  }
);

Button.displayName = "Button";
