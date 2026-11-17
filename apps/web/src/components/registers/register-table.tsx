/**
 * Register Table Component
 * 
 * Editable table for register entries with inline editing
 */

import { useState } from 'react'

interface RegisterTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Array<{
    key: string
    label: string
    type?: 'text' | 'number' | 'date' | 'select'
    editable?: boolean
    options?: string[]
  }>
  onUpdate?: (id: string, data: Partial<T>) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
}

export function RegisterTable<T extends { id: string }>({
  data,
  columns,
  onUpdate,
  onDelete,
  onAdd,
}: RegisterTableProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<T>>({})

  const handleEdit = (row: T) => {
    setEditingId(row.id)
    setEditData({ ...row })
  }

  const handleSave = (id: string) => {
    if (onUpdate && editData) {
      onUpdate(id, editData)
    }
    setEditingId(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {editingId === row.id ? (
                      <input
                        type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                        value={
                          (editData[column.key as keyof T] as string) || ''
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            [column.key]: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {String(row[column.key as keyof T] || '')}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === row.id ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSave(row.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onAdd && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + Add New Row
          </button>
        </div>
      )}
    </div>
  )
}
