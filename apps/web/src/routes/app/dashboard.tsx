/**
 * Dashboard Page
 * 
 * Shows register statistics and overview
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '../../lib/api'
import { ProtectedRoute } from '../../components/auth/protected-route'

export const Route = createFileRoute('/app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: stats, isLoading } = useQuery(
    orpc.dashboard.registerStats.queryOptions({}),
  )

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your lab register management
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading statistics...</div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Entries"
                value={stats.totalEntries}
                description="Entry registers"
              />
              <StatCard
                title="OPD Records"
                value={stats.totalOpd}
                description="Outpatient records"
              />
              <StatCard
                title="Stock Items"
                value={stats.totalStock}
                description="Stock registers"
              />
              <StatCard
                title="Tests Performed"
                value={
                  stats.totalBiochemistry +
                  stats.totalBrucellaRbpt +
                  stats.totalBrucellaSero +
                  stats.totalFmd +
                  stats.totalBirdFlu +
                  stats.totalAbst
                }
                description="Total test records"
              />
            </div>

            {/* Register Type Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Register Type Counts</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {stats.registerTypeCounts.map((item) => (
                  <div
                    key={item.type}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-indigo-600">
                      {item.count}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Entries */}
            {stats.recentEntries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Article/Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentEntries.map((entry: any) => (
                        <tr key={entry.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.receivingDate
                              ? new Date(entry.receivingDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.nameOfArticle || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.source || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/app/registers/entry"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Add Entry</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Create new entry register
                  </div>
                </a>
                <a
                  href="/app/registers/opd"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Add OPD Record</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Record new OPD entry
                  </div>
                </a>
                <a
                  href="/app/registers"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">View All Registers</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Browse all register types
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No statistics available
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
    </div>
  )
}
