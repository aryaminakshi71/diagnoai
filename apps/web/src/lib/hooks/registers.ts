/**
 * Register Hooks
 * 
 * Custom hooks for register operations using @orpc/tanstack-query
 */

import { orpc } from '../api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Entry Register Hooks
export function useEntryRegisters(
  input?: any,
) {
  return useQuery(orpc.registers.entry.list.queryOptions({ input: input ?? {} }))
}

export function useEntryRegister(id: string) {
  return useQuery(orpc.registers.entry.get.queryOptions({ input: { id } }))
}

export function useCreateEntryRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.registers.entry.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'entry'] })
    },
  })
}

export function useUpdateEntryRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.registers.entry.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'entry'] })
    },
  })
}

export function useDeleteEntryRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.registers.entry.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'entry'] })
    },
  })
}

// OPD Register Hooks
export function useOpdRegisters(
  input?: any,
) {
  return useQuery(orpc.registers.opd.list.queryOptions({ input: input ?? {} }))
}

export function useOpdRegister(id: string) {
  return useQuery(orpc.registers.opd.get.queryOptions({ input: { id } }))
}

export function useCreateOpdRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.registers.opd.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'opd'] })
    },
  })
}

export function useUpdateOpdRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.registers.opd.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'opd'] })
    },
  })
}

export function useDeleteOpdRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.registers.opd.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'opd'] })
    },
  })
}

// Similar hooks can be created for other register types
// For brevity, creating a generic pattern that can be extended
