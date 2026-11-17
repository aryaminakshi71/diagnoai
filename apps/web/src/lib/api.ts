/**
 * API Client Setup
 * 
 * Configure @orpc/tanstack-query for type-safe API calls
 */

import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { RouterClient } from '@orpc/server'
import { QueryClient } from '@tanstack/react-query'
// TODO: Replace with actual package name
import type { AppRouter } from '../../../../apps/api/src/routers'

// API base URL
const RAW_API_URL = import.meta.env.VITE_PUBLIC_API_URL ?? '/api/rpc'
const API_BASE_URL =
  typeof window !== 'undefined'
    ? new URL(RAW_API_URL, window.location.origin).toString()
    : 'http://localhost:3101/api/rpc'

const link = new RPCLink({
  url: API_BASE_URL,
})

export const orpcClient: RouterClient<AppRouter> = createORPCClient(link)
export const orpc = createTanstackQueryUtils(orpcClient)

// Create query client with defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
})

// Export AppRouter type for use in components
export type { AppRouter }
