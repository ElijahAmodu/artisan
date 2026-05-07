import { HTMLAttributes } from "react";
import { cn, getStatusMeta } from "@/lib/utils";

// ------------------------------------------------------------------
// Card
// ------------------------------------------------------------------

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-stone-100 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-b border-stone-100", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

// ------------------------------------------------------------------
// Badge
// ------------------------------------------------------------------

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: "green" | "amber" | "red" | "sky" | "stone";
}

// Small pill label used for availability status, skills, etc.
export function Badge({ color = "stone", className, ...props }: BadgeProps) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    stone: "bg-stone-50 text-stone-600 border-stone-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        colors[color],
        className,
      )}
      {...props}
    />
  );
}

// ------------------------------------------------------------------
// StatusBadge
// ------------------------------------------------------------------

// Derives color automatically from the job status value.
export function StatusBadge({ status }: { status: string }) {
  const { label, color } = getStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        color,
      )}
    >
      {label}
    </span>
  );
}

// ------------------------------------------------------------------
// Divider
// ------------------------------------------------------------------

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-stone-100", className)} />;
}
