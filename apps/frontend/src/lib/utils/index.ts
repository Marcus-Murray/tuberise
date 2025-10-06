/**
 * Utils Module Index
 * Exports all utility functions
 */

export * from './formatting';
export * from './validation';
export * from './storage';

// Legacy utility function (for backward compatibility)
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
