import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared Recharts Tooltip contentStyle — avoids duplication across chart pages */
export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: '12px',
  border: '1px solid #e5e0d8',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '13px',
};
