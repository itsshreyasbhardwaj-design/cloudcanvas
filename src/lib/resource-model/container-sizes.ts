import type { ResourceKind } from "./types";

/** Default canvas footprint for container resources that don't have an explicit `size` yet. */
export const DEFAULT_CONTAINER_SIZE: Partial<Record<ResourceKind, { width: number; height: number }>> = {
  "networking.region": { width: 900, height: 600 },
  "networking.availability-zone": { width: 700, height: 480 },
  "networking.vpc": { width: 600, height: 400 },
  "networking.subnet": { width: 360, height: 240 },
};

export const FALLBACK_CONTAINER_SIZE = { width: 400, height: 260 };
