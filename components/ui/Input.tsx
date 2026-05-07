"use client";

import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  LabelHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// Input
// ------------------------------------------------------------------

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "w-full h-10 px-3 rounded-lg border bg-white text-stone-900 text-sm placeholder:text-stone-400",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent",
          error ? "border-rose-400 focus:ring-rose-500" : "border-stone-200",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";

// ------------------------------------------------------------------
// Textarea
// ------------------------------------------------------------------

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-lg border bg-white text-stone-900 text-sm placeholder:text-stone-400 resize-none",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent",
          error ? "border-rose-400 focus:ring-rose-500" : "border-stone-200",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";

// ------------------------------------------------------------------
// Label
// ------------------------------------------------------------------

export const Label = ({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("block text-sm font-medium text-stone-700 mb-1", className)}
    {...props}
  />
);
