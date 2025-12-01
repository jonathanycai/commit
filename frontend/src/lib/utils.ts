import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: any): string {
  const status = error?.response?.status;
  const serverMsg = error?.response?.data?.error || error?.message;

  if (status === 401 || serverMsg?.includes('token')) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return "We couldn't find the resource you're looking for.";
  }

  return serverMsg || "Something went wrong. Please try again.";
}