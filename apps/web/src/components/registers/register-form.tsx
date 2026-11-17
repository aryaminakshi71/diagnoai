/**
 * Register Form Component
 * 
 * Dynamic form for creating/editing register entries
 */

import { useState } from 'react'

interface RegisterFormProps {
  fields: Array<{
    name: string
    label: string
    type?: 'text' | 'number' | 'date' | 'select' | 'textarea'
    required?: boolean
    options?: string[]
    placeholder?: string
  }>
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function RegisterForm({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
}: RegisterFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialData,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    name: string,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={(formData[field.name] as string) || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors[field.name]
                  ? 'border-red-300'
                  : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              rows={4}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={(formData[field.name] as string) || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors[field.name]
                  ? 'border-red-300'
                  : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              id={field.name}
              name={field.name}
              value={(formData[field.name] as string | number) || ''}
              onChange={(e) =>
                handleChange(
                  field.name,
                  field.type === 'number'
                    ? Number(e.target.value)
                    : e.target.value,
                )
              }
              placeholder={field.placeholder}
              required={field.required}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors[field.name]
                  ? 'border-red-300'
                  : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          )}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
