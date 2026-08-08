import type { AuthProvider, AuthSession } from "./types";

const MOCK_SESSION: AuthSession = {
  user: {
    id: "user_local_dev",
    name: "Local Developer",
    email: "dev@cloudcanvas.local",
  },
  organizationId: "org_local_dev",
};

/**
 * Stand-in for Clerk during local development. No network calls, no
 * persisted identity — every load is "logged in" as the same local user.
 */
export const mockAuthProvider: AuthProvider = {
  async getSession() {
    return MOCK_SESSION;
  },
  async signOut() {
    // no-op: there is nothing to sign out of in mock mode
  },
};
