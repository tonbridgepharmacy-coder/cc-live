import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function stripHtmlTags(input: string = "") {
    return input
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function truncateText(input: string = "", maxLength: number = 160) {
    if (input.length <= maxLength) return input;
    return `${input.slice(0, maxLength).trim()}...`;
}
