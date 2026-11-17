/**
 * Register Import Router
 * 
 * Handles Excel import/export for registers
 */

import { z } from 'zod'
import { orgAuthed } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  parseExcelSchema,
  parseExcelData,
  validateExcelData,
  generateExcel,
  generateExcelTemplate,
  type ExcelSchema,
  type ExcelRow,
} from '../../../../../packages/core/src/services/excel'

export const registerImportRouter = {
  /**
   * Parse Excel file to extract schema
   */
  parseSchema: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/import/parse-schema',
      summary: 'Parse Excel file to extract schema',
      tags: ['Registers', 'Import'],
    })
    .input(
      z.object({
        file: z.string(), // Base64 encoded file
        sheetName: z.string().optional(),
      }),
    )
    .output(
      z.object({
        schema: z.object({
          sheetName: z.string(),
          headerRow: z.number(),
          columns: z.array(
            z.object({
              header: z.string(),
              index: z.number(),
              dataType: z.enum(['text', 'number', 'date', 'boolean']).optional(),
            }),
          ),
        }),
      }),
    )
    .handler(async ({ context, input }) => {
      try {
        const fileBuffer = Buffer.from(input.file, 'base64')
        const schema = parseExcelSchema(fileBuffer, input.sheetName)

        return { schema }
      } catch (error) {
        throw new ORPCError('BAD_REQUEST', { message: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}` })
      }
    }),

  /**
   * Validate Excel data before import
   */
  validateImport: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/import/validate',
      summary: 'Validate Excel data before import',
      tags: ['Registers', 'Import'],
    })
    .input(
      z.object({
        registerType: z.string(),
        file: z.string(), // Base64 encoded file
        schema: z.any(), // ExcelSchema
      }),
    )
    .output(
      z.object({
        valid: z.number(),
        errors: z.array(
          z.object({
            row: z.number(),
            errors: z.any(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }) => {
      try {
        const fileBuffer = Buffer.from(input.file, 'base64')
        const rows = parseExcelData(fileBuffer, input.schema as ExcelSchema)

        // TODO: Get appropriate validator schema based on registerType
        // For now, return basic validation
        return {
          valid: rows.length,
          errors: [],
        }
      } catch (error) {
        throw new ORPCError('BAD_REQUEST', { message: `Failed to validate Excel data: ${error instanceof Error ? error.message : 'Unknown error'}` })
      }
    }),

  /**
   * Get import template Excel file
   */
  getTemplate: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/import/template/:registerType',
      summary: 'Download Excel import template',
      tags: ['Registers', 'Import'],
    })
    .input(
      z.object({
        registerType: z.string(),
      }),
    )
    .output(z.string()) // Base64 encoded Excel file
    .handler(async ({ context, input }) => {
      // TODO: Generate template based on register type schema
      // For now, return empty template
      const schema: ExcelSchema = {
        sheetName: input.registerType,
        headerRow: 1,
        columns: [],
      }

      const buffer = generateExcelTemplate(schema)
      return buffer.toString('base64')
    }),
}
