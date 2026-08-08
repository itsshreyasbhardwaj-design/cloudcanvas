import type { ResourceCategory } from "./types";

/** Tailwind v4 arbitrary-value friendly CSS variable names, defined in globals.css. */
export const CATEGORY_COLOR_VAR: Record<ResourceCategory, string> = {
  compute: "--color-cc-category-compute",
  networking: "--color-cc-category-networking",
  database: "--color-cc-category-database",
  storage: "--color-cc-category-storage",
  security: "--color-cc-category-security",
  observability: "--color-cc-category-observability",
  messaging: "--color-cc-category-messaging",
  ai: "--color-cc-category-ai",
};

export function categoryColor(category: ResourceCategory): string {
  return `var(${CATEGORY_COLOR_VAR[category]})`;
}
