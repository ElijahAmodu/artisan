"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

// Polymorphic button with consistent sizing, variants, and a loading spinner.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-900",
      secondary:
        "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
      ghost:
        "bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400",
      outline:
        "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus-visible:ring-stone-400",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          // Spinner shown while an async action is in progress
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
