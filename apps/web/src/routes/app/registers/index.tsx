/**
 * Register List Page
 *
 * Lists register types filtered by lab type (human / veterinary / both).
 * Set VITE_LAB_TYPE=human|veterinary|both to switch modes.
 */

import { createFileRoute } from '@tanstack/react-router'

type LabType = 'human' | 'veterinary'

interface RegisterDef {
  id: string
  name: string
  description: string
  type: LabType | 'both'
}

// Register types configuration
const REGISTER_TYPES: RegisterDef[] = [
  { id: 'entry', name: 'Entry Register', description: 'Track incoming articles/goods', type: 'both' },
  { id: 'opd', name: 'OPD Register', description: 'Outpatient samples and tests', type: 'both' },
  { id: 'stock', name: 'Stock Register', description: 'Lab stock inventory', type: 'both' },
  { id: 'biochemistry', name: 'Biochemistry Register', description: 'Biochemistry test results', type: 'both' },
  { id: 'daily-expenditure', name: 'Daily Expenditure', description: 'Daily expenditures tracking', type: 'both' },
  { id: 'ledger', name: 'Ledger Register', description: 'Article ledger tracking', type: 'both' },
  { id: 'dispatch', name: 'Dispatch Register', description: 'Dispatched items/documents', type: 'both' },
  { id: 'brucella-rbpt', name: 'Brucella RBPT', description: 'Brucella Rose Bengal Plate Test', type: 'veterinary' },
  { id: 'brucella-sero', name: 'Brucella Sero Surveillance', description: 'Brucella serological surveillance', type: 'veterinary' },
  { id: 'fmd', name: 'FMD Register', description: 'Foot and Mouth Disease samples', type: 'veterinary' },
  { id: 'bird-flu', name: 'Bird Flu Register', description: 'Avian Influenza samples', type: 'veterinary' },
  { id: 'abst', name: 'AbSt Register', description: 'Antibiotic Sensitivity Testing', type: 'veterinary' },
  { id: 'psks-cashbook', name: 'PSKS Cashbook', description: 'PSKS cashbook entries', type: 'veterinary' },
  { id: 'psks-entry', name: 'PSKS Entry', description: 'PSKS entry records', type: 'veterinary' },
  { id: 'psks-ledger', name: 'PSKS Ledger', description: 'PSKS ledger entries', type: 'veterinary' },
  { id: 'psks-stock', name: 'PSKS Stock', description: 'PSKS stock tracking', type: 'veterinary' },
]

const LAB_TYPE = (import.meta.env.VITE_LAB_TYPE as 'human' | 'veterinary' | 'both' | undefined) ?? 'both'

function visibleRegisters(): RegisterDef[] {
  if (LAB_TYPE === 'both') return REGISTER_TYPES
  return REGISTER_TYPES.filter((r) => r.type === 'both' || r.type === LAB_TYPE)
}

export const Route = createFileRoute('/app/registers/')({
  component: RegistersPage,
})

function RegistersPage() {
  const registers = visibleRegisters()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DiagnoAI</h1>
        <p className="mt-2 text-gray-600">
          Manage all your lab register types in one place
          {LAB_TYPE !== 'both' && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {LAB_TYPE === 'human' ? 'Human' : 'Veterinary'} lab
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registers.map((register) => (
          <a
            key={register.id}
            href={`/app/registers/${register.id}`}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {register.name}
            </h2>
            <p className="text-gray-600 text-sm">{register.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
