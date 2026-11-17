/**
 * API Client Setup
 * 
 * Configure @orpc/tanstack-query for type-safe API calls
 */

import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { BatchLinkPlugin } from '@orpc/client/plugins'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { RouterClient } from '@orpc/server'
import { QueryClient } from '@tanstack/react-query'
// TODO: Replace with actual package name
import type { AppRouter } from '../../../../apps/api/src/routers'

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_URL ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3101')

const link = new RPCLink({
  url: API_BASE_URL,
  plugins: [
    new BatchLinkPlugin({
      exclude: ({ path }) => path[0] === 'sse',
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
  ],
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
