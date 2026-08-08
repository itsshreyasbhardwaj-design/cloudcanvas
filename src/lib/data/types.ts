import type { ArchitectureGraph } from "../graph/types";

export interface ArchitectureSummary {
  id: string;
  name: string;
  updatedAt: string;
}

/**
 * Every architecture read/write in the app goes through this interface.
 * The local implementation persists to localStorage; a Supabase-backed
 * implementation with the same shape replaces it later without any
 * caller changes.
 */
export interface DataProvider {
  listArchitectures(): Promise<ArchitectureSummary[]>;
  loadArchitecture(id: string): Promise<ArchitectureGraph | null>;
  saveArchitecture(graph: ArchitectureGraph): Promise<void>;
  deleteArchitecture(id: string): Promise<void>;
}
