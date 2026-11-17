/**
 * Register Type List Page
 * 
 * Shows entries for a specific register type with table editing
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { RegisterTable } from '../../../../components/registers/register-table'
import { RegisterForm } from '../../../../components/registers/register-form'
import { useEntryRegisters, useCreateEntryRegister, useUpdateEntryRegister, useDeleteEntryRegister } from '../../../../lib/hooks/registers'

export const Route = createFileRoute('/app/registers/$type/')({
  component: RegisterTypePage,
})

function RegisterTypePage() {
  const { type } = Route.useParams()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const limit = 50

  const { data, isLoading, error } = useEntryRegisters({
    limit,
    offset: (page - 1) * limit,
  })
  const createMutation = useCreateEntryRegister()
  const updateMutation = useUpdateEntryRegister()
  const deleteMutation = useDeleteEntryRegister()

  const columns = [
    { key: 'receivingDate', label: 'Receiving Date', type: 'date' as const, editable: true },
    { key: 'nameOfArticle', label: 'Article Name', editable: true },
    { key: 'quantity', label: 'Quantity', type: 'number' as const, editable: true },
    { key: 'source', label: 'Source', editable: true },
  ]

  const handleUpdate = (id: string, updateData: Record<string, unknown>) => {
    updateMutation.mutate({ id, data: updateData })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate({ id })
    }
  }

  const handleAdd = () => {
    setShowForm(true)
  }

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    await createMutation.mutateAsync(formData as any)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error loading data</div>
      </div>
    )
  }

  const registerName = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {registerName} Register
          </h1>
          <p className="mt-2 text-gray-600">
            Manage entries for {registerName.toLowerCase()} register
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Import Excel
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Excel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + Add Entry
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
          <RegisterForm
            fields={[
              { name: 'receivingDate', label: 'Receiving Date', type: 'date', required: true },
              { name: 'nameOfArticle', label: 'Article Name', required: true },
              { name: 'quantity', label: 'Quantity', type: 'number', required: true },
              { name: 'source', label: 'Source' },
            ]}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            submitLabel="Create Entry"
          />
        </div>
      )}

      {data && (
        <RegisterTable
          data={data.registers || []}
          columns={columns}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}

      {data && data.total > limit && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of{' '}
            {data.total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= data.total}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
