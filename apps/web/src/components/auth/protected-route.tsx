/**
 * Protected Route Component
 * 
 * Wrapper to protect routes that require authentication
 */

import { useSession } from '../../lib/auth'
import { Navigate } from '@tanstack/react-router'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session?.user) {
    return <Navigate to={redirectTo} />
  }

  return <>{children}</>
}
