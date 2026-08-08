import { localDataProvider } from "./local-data-provider";
import type { DataProvider } from "./types";

export * from "./types";

/**
 * Single point of truth for which DataProvider implementation is active.
 * Swap this to a Supabase-backed provider later — nothing else in the
 * app imports local-data-provider directly.
 */
export function getDataProvider(): DataProvider {
  return localDataProvider;
}
