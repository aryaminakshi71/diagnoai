/**
 * Home/Index Route
 * 
 * Redirects to dashboard or login
 */

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect to dashboard
    throw redirect({
      to: '/app/dashboard',
    })
  },
})
