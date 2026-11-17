/**
 * LIS Workspace
 *
 * Industry-standard laboratory workflow in one place:
 * Patients, Orders, Samples, Results, Reports, Billing, Inventory, QC.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  usePatients,
  useCreatePatient,
  useDoctors,
  useCreateDoctor,
  useTests,
  useCreateTest,
  useOrders,
  useOrder,
  useCreateOrder,
  useUpdateOrderStatus,
  useSamples,
  useCreateSample,
  useResultsBySample,
  useUpsertResult,
  useVerifyResult,
  useLisReports,
  useCreateReport,
  useInvoices,
  useCreateInvoice,
  useAddPayment,
  useInventory,
  useCreateInventoryItem,
  useInventoryTransaction,
  useQcRuns,
  useCreateQcRun,
} from '../../../lib/hooks/lis'

export const Route = createFileRoute('/app/lis/')({
  component: LisPage,
})

const TABS = [
  'Patients',
  'Tests',
  'Orders',
  'Samples',
  'Results',
  'Reports',
  'Billing',
  'Inventory',
  'QC',
] as const
type Tab = (typeof TABS)[number]

function LisPage() {
  const [tab, setTab] = useState<Tab>('Patients')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Laboratory Workspace</h1>
        <p className="mt-1 text-gray-600">
          Patient → Order → Sample → Result → Report → Billing
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Patients' && <PatientsTab />}
      {tab === 'Tests' && <TestsTab />}
      {tab === 'Orders' && <OrdersTab />}
      {tab === 'Samples' && <SamplesTab />}
      {tab === 'Results' && <ResultsTab />}
      {tab === 'Reports' && <ReportsTab />}
      {tab === 'Billing' && <BillingTab />}
      {tab === 'Inventory' && <InventoryTab />}
      {tab === 'QC' && <QcTab />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shared UI                                                           */
/* ------------------------------------------------------------------ */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {children}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'

function Table({
  headers,
  children,
}: {
  headers: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="py-8 text-center text-gray-500">{text}</div>
}

/* ------------------------------------------------------------------ */
/* Patients                                                            */
/* ------------------------------------------------------------------ */

function PatientsTab() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePatients(search || undefined)
  const create = useCreatePatient()
  const [form, setForm] = useState({
    mrn: '',
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    labType: 'human' as 'human' | 'veterinary',
    species: '',
    ownerName: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({
      mrn: form.mrn,
      firstName: form.firstName,
      lastName: form.lastName || undefined,
      gender: form.gender || undefined,
      phone: form.phone || undefined,
      labType: form.labType,
      species: form.species || undefined,
      ownerName: form.ownerName || undefined,
    })
    setForm({ ...form, mrn: '', firstName: '', lastName: '', phone: '' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Patients</h2>
            <input
              className={`${inputCls} max-w-xs`}
              placeholder="Search name, MRN, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.patients?.length ? (
            <Empty text="No patients yet. Add your first patient." />
          ) : (
            <Table headers={['MRN', 'Name', 'Gender', 'Phone', 'Type']}>
              {data.patients.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-mono text-xs">{p.mrn}</td>
                  <td className="px-3 py-2">
                    {p.firstName} {p.lastName ?? ''}
                  </td>
                  <td className="px-3 py-2">{p.gender ?? '—'}</td>
                  <td className="px-3 py-2">{p.phone ?? '—'}</td>
                  <td className="px-3 py-2 capitalize">{p.labType}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">New Patient</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="MRN *">
            <input
              required
              className={inputCls}
              value={form.mrn}
              onChange={(e) => setForm({ ...form, mrn: e.target.value })}
            />
          </Field>
          <Field label="First name *">
            <input
              required
              className={inputCls}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </Field>
          <Field label="Last name">
            <input
              className={inputCls}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <select
                className={inputCls}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Phone">
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Lab type">
            <select
              className={inputCls}
              value={form.labType}
              onChange={(e) =>
                setForm({ ...form, labType: e.target.value as 'human' | 'veterinary' })
              }
            >
              <option value="human">Human</option>
              <option value="veterinary">Veterinary</option>
            </select>
          </Field>
          {form.labType === 'veterinary' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Species">
                <input
                  className={inputCls}
                  value={form.species}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                />
              </Field>
              <Field label="Owner">
                <input
                  className={inputCls}
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                />
              </Field>
            </div>
          )}
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Saving…' : 'Add Patient'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

function TestsTab() {
  const { data, isLoading } = useTests()
  const create = useCreateTest()
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'Biochemistry',
    sampleType: 'Serum',
    price: '',
    labType: 'both',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({
      code: form.code,
      name: form.name,
      category: form.category,
      sampleType: form.sampleType,
      price: Number(form.price) || 0,
      labType: form.labType as any,
    })
    setForm({ ...form, code: '', name: '', price: '' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Test Catalog</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.tests?.length ? (
            <Empty text="No tests yet. Add your first test." />
          ) : (
            <Table headers={['Code', 'Name', 'Category', 'Sample', 'Price', 'Type']}>
              {data.tests.map((t: any) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 font-mono text-xs">{t.code}</td>
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2">{t.category ?? '—'}</td>
                  <td className="px-3 py-2">{t.sampleType ?? '—'}</td>
                  <td className="px-3 py-2">₹{t.price.toFixed(2)}</td>
                  <td className="px-3 py-2 capitalize">{t.labType}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">New Test</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Code *">
            <input
              required
              className={inputCls}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </Field>
          <Field label="Name *">
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <input
              className={inputCls}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Sample type">
            <input
              className={inputCls}
              value={form.sampleType}
              onChange={(e) => setForm({ ...form, sampleType: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <input
                type="number"
                className={inputCls}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Lab type">
              <select
                className={inputCls}
                value={form.labType}
                onChange={(e) => setForm({ ...form, labType: e.target.value })}
              >
                <option value="both">Both</option>
                <option value="human">Human</option>
                <option value="veterinary">Veterinary</option>
              </select>
            </Field>
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Saving…' : 'Add Test'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

function OrdersTab() {
  const { data, isLoading } = useOrders()
  const { data: patients } = usePatients()
  const { data: tests } = useTests()
  const create = useCreateOrder()
  const updateStatus = useUpdateOrderStatus()
  const [patientId, setPatientId] = useState('')
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [priority, setPriority] = useState('routine')

  const toggleTest = (id: string) =>
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !selectedTests.length) return
    await create.mutateAsync({
      patientId,
      priority: priority as 'routine' | 'urgent' | 'stat',
      testIds: selectedTests,
    })
    setSelectedTests([])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Orders</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.orders?.length ? (
            <Empty text="No orders yet." />
          ) : (
            <Table headers={['Order #', 'Patient', 'Priority', 'Status', '']}>
              {data.orders.map((row: any) => (
                <tr key={row.order.id}>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.order.orderNumber}
                  </td>
                  <td className="px-3 py-2">
                    {row.patient
                      ? `${row.patient.firstName} ${row.patient.lastName ?? ''}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 capitalize">{row.order.priority}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {row.order.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                      value={row.order.status}
                      onChange={(e) =>
                        updateStatus.mutate({
                          id: row.order.id,
                          status: e.target.value as any,
                        })
                      }
                    >
                      {[
                        'ordered',
                        'collected',
                        'received',
                        'in_progress',
                        'resulted',
                        'verified',
                        'reported',
                        'cancelled',
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">New Order</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Patient *">
            <select
              required
              className={inputCls}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select patient…</option>
              {patients?.patients?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.mrn} — {p.firstName} {p.lastName ?? ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className={inputCls}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </Field>
          <Field label="Tests *">
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {tests?.tests?.length ? (
                tests.tests.map((t: any) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(t.id)}
                      onChange={() => toggleTest(t.id)}
                    />
                    <span>
                      {t.name}{' '}
                      <span className="text-gray-400">({t.code})</span>
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No tests in catalog. Add tests first.
                </p>
              )}
            </div>
          </Field>
          <button
            type="submit"
            disabled={create.isPending || !patientId || !selectedTests.length}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creating…' : 'Create Order'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Samples                                                             */
/* ------------------------------------------------------------------ */

function SamplesTab() {
  const { data, isLoading } = useSamples()
  const { data: orders } = useOrders()
  const create = useCreateSample()
  const [orderId, setOrderId] = useState('')
  const [sampleType, setSampleType] = useState('Blood')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return
    await create.mutateAsync({ orderId, sampleType })
    setOrderId('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Samples</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.samples?.length ? (
            <Empty text="No samples yet." />
          ) : (
            <Table headers={['Accession', 'Type', 'Status', 'Collected']}>
              {data.samples.map((s: any) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 font-mono text-xs">{s.accession}</td>
                  <td className="px-3 py-2">{s.sampleType}</td>
                  <td className="px-3 py-2 capitalize">{s.status}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {s.collectedAt
                      ? new Date(s.collectedAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Register Sample</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Order *">
            <select
              required
              className={inputCls}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">Select order…</option>
              {orders?.orders?.map((row: any) => (
                <option key={row.order.id} value={row.order.id}>
                  {row.order.orderNumber} —{' '}
                  {row.patient ? row.patient.firstName : 'Unknown'}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sample type *">
            <select
              className={inputCls}
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
            >
              {['Blood', 'Serum', 'Plasma', 'Urine', 'Stool', 'Swab', 'Tissue', 'Other'].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </Field>
          <button
            type="submit"
            disabled={create.isPending || !orderId}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Saving…' : 'Register Sample'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function ResultsTab() {
  const { data: samples } = useSamples()
  const [sampleId, setSampleId] = useState('')
  const selectedSample = samples?.samples?.find((s: any) => s.id === sampleId)
  const { data: orderData } = useOrder(selectedSample?.orderId ?? '')
  const { data, isLoading } = useResultsBySample(sampleId)
  const upsert = useUpsertResult()
  const verify = useVerifyResult()
  const [form, setForm] = useState({ value: '', unit: '', refLow: '', refHigh: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sampleId) return
    const firstItem = orderData?.items?.[0]
    if (!firstItem) return
    await upsert.mutateAsync({
      sampleId,
      orderItemId: firstItem.item.id,
      value: form.value,
      numericValue: form.value ? Number(form.value) : undefined,
      unit: form.unit || undefined,
      refLow: form.refLow ? Number(form.refLow) : undefined,
      refHigh: form.refHigh ? Number(form.refHigh) : undefined,
    })
    setForm({ value: '', unit: '', refLow: '', refHigh: '' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Results</h2>
            <select
              className={`${inputCls} max-w-xs`}
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
            >
              <option value="">Select sample…</option>
              {samples?.samples?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.accession} — {s.sampleType}
                </option>
              ))}
            </select>
          </div>
          {!sampleId ? (
            <Empty text="Select a sample to view or enter results." />
          ) : isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.results?.length ? (
            <Empty text="No results entered for this sample." />
          ) : (
            <Table headers={['Analyte', 'Value', 'Unit', 'Flag', 'Status', '']}>
              {data.results.map((r: any) => (
                <tr key={r.result.id}>
                  <td className="px-3 py-2">
                    {r.analyte?.name ?? r.test?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2 font-mono">{r.result.value ?? '—'}</td>
                  <td className="px-3 py-2">{r.result.unit ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.result.flag === 'high' || r.result.flag === 'low'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {r.result.flag ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 capitalize">{r.result.status}</td>
                  <td className="px-3 py-2">
                    {r.result.status !== 'verified' && (
                      <button
                        onClick={() => verify.mutate({ id: r.result.id })}
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Enter Result</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Value">
            <input
              className={inputCls}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </Field>
          <Field label="Unit">
            <input
              className={inputCls}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ref low">
              <input
                className={inputCls}
                value={form.refLow}
                onChange={(e) => setForm({ ...form, refLow: e.target.value })}
              />
            </Field>
            <Field label="Ref high">
              <input
                className={inputCls}
                value={form.refHigh}
                onChange={(e) => setForm({ ...form, refHigh: e.target.value })}
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={upsert.isPending || !sampleId}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {upsert.isPending ? 'Saving…' : 'Save Result'}
          </button>
          {upsert.error && (
            <p className="text-sm text-red-600">{String(upsert.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

function ReportsTab() {
  const { data, isLoading } = useLisReports()
  const { data: orders } = useOrders()
  const create = useCreateReport()
  const [orderId, setOrderId] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return
    await create.mutateAsync({ orderId })
    setOrderId('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Reports</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.reports?.length ? (
            <Empty text="No reports yet." />
          ) : (
            <Table headers={['Report #', 'Status', 'Generated', 'Delivered']}>
              {data.reports.map((r: any) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-mono text-xs">{r.reportNumber}</td>
                  <td className="px-3 py-2 capitalize">{r.status}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {r.generatedAt
                      ? new Date(r.generatedAt).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {r.deliveredAt
                      ? new Date(r.deliveredAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Generate Report</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Order *">
            <select
              required
              className={inputCls}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">Select order…</option>
              {orders?.orders?.map((row: any) => (
                <option key={row.order.id} value={row.order.id}>
                  {row.order.orderNumber}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            disabled={create.isPending || !orderId}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Generating…' : 'Generate Report'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Billing                                                             */
/* ------------------------------------------------------------------ */

function BillingTab() {
  const { data, isLoading } = useInvoices()
  const create = useCreateInvoice()
  const pay = useAddPayment()
  const [form, setForm] = useState({ subtotal: '', discount: '', taxPercent: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({
      subtotal: Number(form.subtotal) || 0,
      discount: Number(form.discount) || 0,
      taxPercent: Number(form.taxPercent) || 0,
    })
    setForm({ subtotal: '', discount: '', taxPercent: '' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Invoices</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.invoices?.length ? (
            <Empty text="No invoices yet." />
          ) : (
            <Table headers={['Invoice #', 'Total', 'Paid', 'Status', '']}>
              {data.invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="px-3 py-2 font-mono text-xs">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-3 py-2">₹{inv.total.toFixed(2)}</td>
                  <td className="px-3 py-2">₹{inv.amountPaid.toFixed(2)}</td>
                  <td className="px-3 py-2 capitalize">{inv.status}</td>
                  <td className="px-3 py-2">
                    {inv.status !== 'paid' && (
                      <button
                        onClick={() =>
                          pay.mutate({
                            id: inv.id,
                            amount: inv.total - inv.amountPaid,
                            method: 'cash',
                          })
                        }
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">New Invoice</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Subtotal (₹) *">
            <input
              required
              type="number"
              className={inputCls}
              value={form.subtotal}
              onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Discount (₹)">
              <input
                type="number"
                className={inputCls}
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
            </Field>
            <Field label="Tax %">
              <input
                type="number"
                className={inputCls}
                value={form.taxPercent}
                onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creating…' : 'Create Invoice'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Inventory                                                           */
/* ------------------------------------------------------------------ */

function InventoryTab() {
  const { data, isLoading } = useInventory()
  const create = useCreateInventoryItem()
  const tx = useInventoryTransaction()
  const [form, setForm] = useState({
    name: '',
    category: 'reagent',
    unit: 'ml',
    quantity: '',
    reorderLevel: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({
      name: form.name,
      category: form.category as any,
      unit: form.unit,
      quantity: Number(form.quantity) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
    })
    setForm({ ...form, name: '', quantity: '', reorderLevel: '' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Inventory</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.items?.length ? (
            <Empty text="No inventory items yet." />
          ) : (
            <Table headers={['Item', 'Category', 'Qty', 'Reorder', '']}>
              {data.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2 capitalize">{item.category}</td>
                  <td
                    className={`px-3 py-2 ${
                      item.quantity <= item.reorderLevel
                        ? 'font-semibold text-red-600'
                        : ''
                    }`}
                  >
                    {item.quantity} {item.unit ?? ''}
                  </td>
                  <td className="px-3 py-2">{item.reorderLevel}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        tx.mutate({
                          id: item.id,
                          type: 'in',
                          quantity: 10,
                          reference: 'Restock',
                        })
                      }
                      className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                    >
                      +10
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">New Item</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Name *">
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {['reagent', 'consumable', 'control', 'calibrator', 'other'].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity">
              <input
                type="number"
                className={inputCls}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </Field>
            <Field label="Reorder level">
              <input
                type="number"
                className={inputCls}
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm({ ...form, reorderLevel: e.target.value })
                }
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Saving…' : 'Add Item'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* QC                                                                  */
/* ------------------------------------------------------------------ */

function QcTab() {
  const { data, isLoading } = useQcRuns()
  const { data: tests } = useTests()
  const create = useCreateQcRun()
  const [form, setForm] = useState({
    testId: '',
    level: 'normal',
    runDate: new Date().toISOString().slice(0, 10),
    status: 'pass',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.testId) return
    await create.mutateAsync({
      testId: form.testId,
      level: form.level as any,
      runDate: form.runDate,
      status: form.status as any,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Quality Control</h2>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : !data?.runs?.length ? (
            <Empty text="No QC runs yet." />
          ) : (
            <Table headers={['Test', 'Level', 'Date', 'Status']}>
              {data.runs.map((row: any) => (
                <tr key={row.run.id}>
                  <td className="px-3 py-2">{row.test?.name ?? '—'}</td>
                  <td className="px-3 py-2 capitalize">{row.run.level}</td>
                  <td className="px-3 py-2">{String(row.run.runDate).slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.run.status === 'pass'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">New QC Run</h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Test *">
            <select
              required
              className={inputCls}
              value={form.testId}
              onChange={(e) => setForm({ ...form, testId: e.target.value })}
            >
              <option value="">Select test…</option>
              {tests?.tests?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Level">
            <select
              className={inputCls}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              {['normal', 'abnormal', 'low', 'high'].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Run date">
            <input
              type="date"
              className={inputCls}
              value={form.runDate}
              onChange={(e) => setForm({ ...form, runDate: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {['pass', 'fail', 'warning'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            disabled={create.isPending || !form.testId}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Saving…' : 'Record QC Run'}
          </button>
          {create.error && (
            <p className="text-sm text-red-600">{String(create.error)}</p>
          )}
        </form>
      </Card>
    </div>
  )
}
