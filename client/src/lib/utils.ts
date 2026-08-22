import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Chart color tokens ────────────────────────────────────────────────────
// Read CSS custom properties at runtime so Recharts receives resolved colors
// that stay in sync with the design system (oklch in index.css).

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Lazy-cached chart palette aligned with --chart-1…5 + border/muted tokens */
let _chartColors: {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  grid: string;
  axis: string;
} | null = null;

export function getChartColors() {
  if (!_chartColors) {
    _chartColors = {
      chart1: getCSSVar('--chart-1') || getCSSVar('--primary'),
      chart2: getCSSVar('--chart-2') || getCSSVar('--accent'),
      chart3: getCSSVar('--chart-3'),
      chart4: getCSSVar('--chart-4'),
      chart5: getCSSVar('--chart-5'),
      grid: getCSSVar('--border'),
      axis: getCSSVar('--muted-foreground'),
    };
  }
  return _chartColors;
}

/** Ordered array of 5 chart fills for pie/bar series */
export function getChartPalette(): string[] {
  const c = getChartColors();
  return [c.chart1, c.chart2, c.chart3, c.chart4, c.chart5];
}

/** Shared Recharts Tooltip contentStyle — uses token-aware border */
export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: '12px',
  border: '1px solid var(--border)',
  boxShadow: '0 4px 12px oklch(0.25 0.03 45 / 0.08)',
  fontSize: '13px',
};
