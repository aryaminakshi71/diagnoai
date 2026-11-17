/**
 * Better Auth Client
 * 
 * Frontend Better Auth client configuration
 */

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  basePath: '/api/auth',
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
