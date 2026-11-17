/**
 * Excel Import/Export Service
 * 
 * Handles parsing Excel files and generating Excel files for register data
 */

import * as XLSX from 'xlsx'
import type { WorkBook, WorkSheet } from 'xlsx'
import { z } from 'zod'

export interface ExcelColumn {
  header: string
  index: number
  dataType?: 'text' | 'number' | 'date' | 'boolean'
}

export interface ExcelSchema {
  sheetName: string
  headerRow: number
  columns: ExcelColumn[]
}

export interface ExcelRow {
  [columnHeader: string]: unknown
}

export interface ExcelData {
  schema: ExcelSchema
  rows: ExcelRow[]
}

/**
 * Parse Excel file to extract schema (column structure)
 */
export function parseExcelSchema(
  fileBuffer: Buffer,
  sheetName?: string,
): ExcelSchema {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const sheet = sheetName
    ? workbook.Sheets[sheetName]
    : workbook.Sheets[workbook.SheetNames[0]]

  if (!sheet) {
    throw new Error('Sheet not found')
  }

  // Find header row (first non-empty row with at least 3 cells)
  let headerRow = 1
  for (let row = 1; row <= 10; row++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r: row - 1, c: 0 })]
    const cellB = sheet[XLSX.utils.encode_cell({ r: row - 1, c: 1 })]
    const cellC = sheet[XLSX.utils.encode_cell({ r: row - 1, c: 2 })]

    if (cellA && cellB && cellC) {
      headerRow = row
      break
    }
  }

  // Extract column headers
  const columns: ExcelColumn[] = []
  let colIndex = 0

  while (true) {
    const cell = sheet[
      XLSX.utils.encode_cell({ r: headerRow - 1, c: colIndex })
    ]
    if (!cell || !cell.v) {
      break
    }

    columns.push({
      header: String(cell.v).trim(),
      index: colIndex,
    })

    colIndex++
  }

  return {
    sheetName: sheetName || workbook.SheetNames[0],
    headerRow,
    columns,
  }
}

/**
 * Parse Excel file to extract data rows
 */
export function parseExcelData(
  fileBuffer: Buffer,
  schema: ExcelSchema,
): ExcelRow[] {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const sheet = workbook.Sheets[schema.sheetName]

  if (!sheet) {
    throw new Error(`Sheet "${schema.sheetName}" not found`)
  }

  const rows: ExcelRow[] = []
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')

  // Start from row after header
  for (let rowIndex = schema.headerRow; rowIndex <= range.e.r; rowIndex++) {
    const row: ExcelRow = {}
    let hasData = false

    for (const column of schema.columns) {
      const cell = sheet[
        XLSX.utils.encode_cell({ r: rowIndex, c: column.index })
      ]

      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
        row[column.header] = cell.v
        hasData = true
      }
    }

    if (hasData) {
      rows.push(row)
    }
  }

  return rows
}

/**
 * Detect data type from cell value
 */
function detectDataType(value: unknown): 'text' | 'number' | 'date' | 'boolean' {
  if (typeof value === 'number') {
    return 'number'
  }
  if (typeof value === 'boolean') {
    return 'boolean'
  }
  if (value instanceof Date) {
    return 'date'
  }
  if (typeof value === 'string') {
    // Check if it's a date string
    if (
      /^\d{4}-\d{2}-\d{2}/.test(value) ||
      /^\d{2}\/\d{2}\/\d{4}/.test(value)
    ) {
      return 'date'
    }
    // Check if it's a numeric string
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return 'number'
    }
  }
  return 'text'
}

/**
 * Validate Excel data against a Zod schema
 */
export function validateExcelData<T>(
  rows: ExcelRow[],
  schema: z.ZodSchema<T>,
): { valid: T[]; errors: Array<{ row: number; errors: z.ZodError }> } {
  const valid: T[] = []
  const errors: Array<{ row: number; errors: z.ZodError }> = []

  rows.forEach((row, index) => {
    const result = schema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      errors.push({
        row: index + 1,
        errors: result.error,
      })
    }
  })

  return { valid, errors }
}

/**
 * Generate Excel file from data
 */
export function generateExcel(
  data: ExcelRow[],
  schema: ExcelSchema,
  sheetName = 'Sheet1',
): Buffer {
  const workbook = XLSX.utils.book_new()

  // Create worksheet data
  const worksheetData: unknown[][] = []

  // Add header row
  worksheetData.push(schema.columns.map((col) => col.header))

  // Add data rows
  data.forEach((row) => {
    const rowData = schema.columns.map((col) => row[col.header] || '')
    worksheetData.push(rowData)
  })

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return buffer
}

/**
 * Generate Excel template from schema
 */
export function generateExcelTemplate(schema: ExcelSchema): Buffer {
  return generateExcel([], schema, schema.sheetName)
}
