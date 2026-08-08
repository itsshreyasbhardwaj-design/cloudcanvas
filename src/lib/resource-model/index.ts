import { computeCatalog } from "./catalog/compute";
import { networkingCatalog } from "./catalog/networking";
import { databaseCatalog } from "./catalog/database";
import { storageCatalog } from "./catalog/storage";
import { securityCatalog } from "./catalog/security";
import { observabilityCatalog } from "./catalog/observability";
import { messagingCatalog } from "./catalog/messaging";
import { aiCatalog } from "./catalog/ai";
import type { ResourceCatalogEntry, ResourceCategory, ResourceKind } from "./types";

export * from "./types";

export const RESOURCE_CATALOG: ResourceCatalogEntry[] = [
  ...computeCatalog,
  ...networkingCatalog,
  ...databaseCatalog,
  ...storageCatalog,
  ...securityCatalog,
  ...observabilityCatalog,
  ...messagingCatalog,
  ...aiCatalog,
];

const catalogByKind = new Map<ResourceKind, ResourceCatalogEntry>(
  RESOURCE_CATALOG.map((entry) => [entry.kind, entry]),
);

export function getCatalogEntry(kind: ResourceKind): ResourceCatalogEntry {
  const entry = catalogByKind.get(kind);
  if (!entry) throw new Error(`Unknown resource kind: ${kind}`);
  return entry;
}

export function getCatalogByCategory(category: ResourceCategory): ResourceCatalogEntry[] {
  return RESOURCE_CATALOG.filter((entry) => entry.category === category);
}

export function searchCatalog(query: string): ResourceCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return RESOURCE_CATALOG;
  return RESOURCE_CATALOG.filter(
    (entry) =>
      entry.label.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.kind.toLowerCase().includes(q),
  );
}
