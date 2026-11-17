/**
 * Better Auth API Handler
 * 
 * Expose Better Auth endpoints for authentication
 */

import { auth } from '@diagnoai/core/auth/config'

export async function handleAuthRequest(req: Request) {
  return auth.handler(req)
}
