/**
 * LIS Hooks
 *
 * React Query hooks for the industry-standard LIS workflow.
 */

import { orpc } from '../api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const qc = () => useQueryClient()

/* Patients */
export function usePatients(search?: string) {
  return useQuery(
    orpc.lis.patients.list.queryOptions({ input: { search, limit: 100 } }),
  )
}
export function useCreatePatient() {
  const client = qc()
  return useMutation({
    ...orpc.lis.patients.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.patients.list.queryKey() }),
  })
}

/* Doctors */
export function useDoctors() {
  return useQuery(orpc.lis.doctors.list.queryOptions({ input: { limit: 100 } }))
}
export function useCreateDoctor() {
  const client = qc()
  return useMutation({
    ...orpc.lis.doctors.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.doctors.list.queryKey() }),
  })
}

/* Tests */
export function useTests(search?: string) {
  return useQuery(
    orpc.lis.tests.list.queryOptions({ input: { search, limit: 200 } }),
  )
}
export function useCreateTest() {
  const client = qc()
  return useMutation({
    ...orpc.lis.tests.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.tests.list.queryKey() }),
  })
}

/* Orders */
export function useOrders(status?: string) {
  return useQuery(
    orpc.lis.orders.list.queryOptions({ input: { status, limit: 100 } }),
  )
}
export function useOrder(id: string) {
  return useQuery({
    ...orpc.lis.orders.get.queryOptions({ input: { id } }),
    enabled: !!id,
  })
}
export function useCreateOrder() {
  const client = qc()
  return useMutation({
    ...orpc.lis.orders.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.orders.list.queryKey() }),
  })
}
export function useUpdateOrderStatus() {
  const client = qc()
  return useMutation({
    ...orpc.lis.orders.updateStatus.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.orders.list.queryKey() }),
  })
}

/* Samples */
export function useSamples(status?: string) {
  return useQuery(
    orpc.lis.samples.list.queryOptions({ input: { status, limit: 100 } }),
  )
}
export function useCreateSample() {
  const client = qc()
  return useMutation({
    ...orpc.lis.samples.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.samples.list.queryKey() }),
  })
}

/* Results */
export function useResultsBySample(sampleId: string) {
  return useQuery({
    ...orpc.lis.results.listBySample.queryOptions({ input: { sampleId } }),
    enabled: !!sampleId,
  })
}
export function useUpsertResult() {
  const client = qc()
  return useMutation({
    ...orpc.lis.results.upsert.mutationOptions(),
    onSuccess: () => client.invalidateQueries(),
  })
}
export function useVerifyResult() {
  const client = qc()
  return useMutation({
    ...orpc.lis.results.verify.mutationOptions(),
    onSuccess: () => client.invalidateQueries(),
  })
}

/* Reports */
export function useLisReports() {
  return useQuery(orpc.lis.reports.list.queryOptions({ input: { limit: 100 } }))
}
export function useCreateReport() {
  const client = qc()
  return useMutation({
    ...orpc.lis.reports.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.reports.list.queryKey() }),
  })
}

/* Billing */
export function useInvoices() {
  return useQuery(
    orpc.lis.billing.listInvoices.queryOptions({ input: { limit: 100 } }),
  )
}
export function useCreateInvoice() {
  const client = qc()
  return useMutation({
    ...orpc.lis.billing.createInvoice.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.billing.listInvoices.queryKey() }),
  })
}
export function useAddPayment() {
  const client = qc()
  return useMutation({
    ...orpc.lis.billing.addPayment.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.billing.listInvoices.queryKey() }),
  })
}

/* Inventory */
export function useInventory(search?: string) {
  return useQuery(
    orpc.lis.inventory.list.queryOptions({ input: { search, limit: 200 } }),
  )
}
export function useCreateInventoryItem() {
  const client = qc()
  return useMutation({
    ...orpc.lis.inventory.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.inventory.list.queryKey() }),
  })
}
export function useInventoryTransaction() {
  const client = qc()
  return useMutation({
    ...orpc.lis.inventory.transaction.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.inventory.list.queryKey() }),
  })
}

/* QC */
export function useQcRuns() {
  return useQuery(orpc.lis.qc.list.queryOptions({ input: { limit: 100 } }))
}
export function useCreateQcRun() {
  const client = qc()
  return useMutation({
    ...orpc.lis.qc.create.mutationOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.lis.qc.list.queryKey() }),
  })
}
