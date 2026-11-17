/**
 * Register List Page
 * 
 * Lists all available register types
 */

import { createFileRoute } from '@tanstack/react-router'

// Register types configuration
const REGISTER_TYPES = [
  { id: 'entry', name: 'Entry Register', description: 'Track incoming articles/goods' },
  { id: 'opd', name: 'OPD Register', description: 'Outpatient Department samples and tests' },
  { id: 'stock', name: 'Stock Register', description: 'Lab stock inventory' },
  { id: 'biochemistry', name: 'Biochemistry Register', description: 'Biochemistry test results' },
  { id: 'brucella-rbpt', name: 'Brucella RBPT', description: 'Brucella Rose Bengal Plate Test' },
  { id: 'brucella-sero', name: 'Brucella Sero Surveillance', description: 'Brucella serological surveillance' },
  { id: 'fmd', name: 'FMD Register', description: 'Foot and Mouth Disease samples' },
  { id: 'bird-flu', name: 'Bird Flu Register', description: 'Avian Influenza samples' },
  { id: 'abst', name: 'AbSt Register', description: 'Antibiotic Sensitivity Testing' },
  { id: 'daily-expenditure', name: 'Daily Expenditure', description: 'Daily expenditures tracking' },
  { id: 'psks-cashbook', name: 'PSKS Cashbook', description: 'PSKS cashbook entries' },
  { id: 'psks-entry', name: 'PSKS Entry', description: 'PSKS entry records' },
  { id: 'ledger', name: 'Ledger Register', description: 'Article ledger tracking' },
  { id: 'dispatch', name: 'Dispatch Register', description: 'Dispatched items/documents' },
  { id: 'psks-ledger', name: 'PSKS Ledger', description: 'PSKS ledger entries' },
  { id: 'psks-stock', name: 'PSKS Stock', description: 'PSKS stock tracking' },
]

export const Route = createFileRoute('/app/registers/')({
  component: RegistersPage,
})

function RegistersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DiagnoLIS</h1>
        <p className="mt-2 text-gray-600">
          Manage all your lab register types in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REGISTER_TYPES.map((register) => (
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
