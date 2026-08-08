import { mockAuthProvider } from "./mock-auth-provider";
import type { AuthProvider } from "./types";

export * from "./types";

/**
 * Single point of truth for which AuthProvider implementation is active.
 * Swap this to a ClerkAuthProvider once Clerk is configured — nothing
 * else in the app imports mock-auth-provider directly.
 */
export function getAuthProvider(): AuthProvider {
  return mockAuthProvider;
}
