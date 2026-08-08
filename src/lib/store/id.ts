let counter = 0;

/** Collision-safe enough for a client-side graph editor; not a security identifier. */
export function makeId(prefix = "n"): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${counter}_${random}`;
}
