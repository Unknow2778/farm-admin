import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function checkAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token'); // Get token from localStorage
    return token;
  }
  return null;
}
