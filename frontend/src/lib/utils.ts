import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArea(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'N/A';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} km²`;
  return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²`;
}

export function formatLength(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'N/A';
  if (val >= 1000) return `${(val / 1000).toFixed(2)} km`;
  return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0';
  return val.toLocaleString();
}
