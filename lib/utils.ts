import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges Tailwind classes safely, resolving conflicts (e.g. p-2 vs p-4).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a number as a currency string with no decimal places for whole amounts.
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Returns a human-readable relative time string (e.g. "3 minutes ago").
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Maps a job status string to a display label and color class.
export function getStatusMeta(status: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    pending: {
      label: "Pending",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    accepted: {
      label: "Accepted",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    declined: {
      label: "Declined",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    in_progress: {
      label: "In Progress",
      color: "text-sky-600 bg-sky-50 border-sky-200",
    },
    completed: {
      label: "Completed",
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    disputed: {
      label: "Disputed",
      color: "text-orange-600 bg-orange-50 border-orange-200",
    },
  };
  return (
    map[status] ?? {
      label: status,
      color: "text-stone-600 bg-stone-50 border-stone-200",
    }
  );
}
