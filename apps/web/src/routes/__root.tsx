/**
 * Root Route
 * 
 * Main layout for the application
 */

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { WhiteLabelProvider } from '../components/branding/WhiteLabelProvider'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <WhiteLabelProvider>
        <Outlet />
      </WhiteLabelProvider>
    </div>
  ),
})
