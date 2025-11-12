// src/lib/utils.ts - Keep this file exactly as shadcn created it

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// This MUST stay exactly as shadcn expects it for component compatibility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}