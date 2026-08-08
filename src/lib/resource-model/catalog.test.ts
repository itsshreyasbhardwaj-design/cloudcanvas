import { describe, expect, it } from "vitest";
import { RESOURCE_CATALOG, getCatalogEntry, getCatalogByCategory, searchCatalog } from "./index";

describe("resource catalog", () => {
  it("has no duplicate resource kinds", () => {
    const kinds = RESOURCE_CATALOG.map((e) => e.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it("every entry's category matches its own getCatalogByCategory bucket", () => {
    for (const entry of RESOURCE_CATALOG) {
      expect(getCatalogByCategory(entry.category)).toContainEqual(entry);
    }
  });

  it("searchCatalog matches on label, description, and kind", () => {
    expect(searchCatalog("postgres").some((e) => e.kind === "database.postgresql")).toBe(true);
    expect(searchCatalog("bucket-shaped-nonsense")).toHaveLength(0);
  });

  it("throws for an unknown resource kind", () => {
    // @ts-expect-error deliberately invalid kind to test the error path
    expect(() => getCatalogEntry("not.a.kind")).toThrow();
  });
});
