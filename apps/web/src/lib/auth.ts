/**
 * Better Auth Client
 * 
 * Frontend Better Auth client configuration
 */

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3000',
  basePath: '/api/auth',
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
