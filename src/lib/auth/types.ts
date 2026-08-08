export interface AuthUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface AuthSession {
  user: AuthUser;
  organizationId: string | null;
}

/**
 * Everything in the app reads the current session through this interface,
 * never through a specific auth vendor. The mock implementation below is
 * what Phase 1 runs on; a ClerkAuthProvider implementing the same shape
 * drops in later with zero changes to callers.
 */
export interface AuthProvider {
  getSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}
