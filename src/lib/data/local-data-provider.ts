import type { ArchitectureGraph } from "../graph/types";
import type { ArchitectureSummary, DataProvider } from "./types";

const STORAGE_KEY = "cloudcanvas.architectures.v1";

function readStore(): Record<string, ArchitectureGraph> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ArchitectureGraph>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, ArchitectureGraph>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** localStorage-backed DataProvider for local development, ahead of a real Supabase-backed one. */
export const localDataProvider: DataProvider = {
  async listArchitectures(): Promise<ArchitectureSummary[]> {
    const store = readStore();
    return Object.values(store)
      .map((g) => ({ id: g.id, name: g.name, updatedAt: g.updatedAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async loadArchitecture(id: string): Promise<ArchitectureGraph | null> {
    const store = readStore();
    return store[id] ?? null;
  },
  async saveArchitecture(graph: ArchitectureGraph): Promise<void> {
    const store = readStore();
    store[graph.id] = graph;
    writeStore(store);
  },
  async deleteArchitecture(id: string): Promise<void> {
    const store = readStore();
    delete store[id];
    writeStore(store);
  },
};
