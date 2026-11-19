import { describe, expect, it } from 'vitest'
import { createAbstRegisterSchema } from './registers/abst'
import { createArticleSchema } from './kb'
import {
  addCommentSchema,
  createTicketSchema,
  ticketFilterSchema,
  updateTicketSchema,
} from './ticket'

describe('createTicketSchema', () => {
  it('accepts a minimal ticket and defaults priority to medium', () => {
    const parsed = createTicketSchema.parse({ subject: '  Printer is down  ' })

    expect(parsed.subject).toBe('Printer is down')
    expect(parsed.priority).toBe('medium')
  })

  it('rejects an empty subject', () => {
    expect(createTicketSchema.safeParse({ subject: '   ' }).success).toBe(false)
  })

  it('rejects an unknown priority', () => {
    const result = createTicketSchema.safeParse({
      subject: 'Help',
      priority: 'whenever',
    })

    expect(result.success).toBe(false)
  })

  it('rejects a malformed requester email', () => {
    const result = createTicketSchema.safeParse({
      subject: 'Help',
      requesterEmail: 'not-an-email',
    })

    expect(result.success).toBe(false)
  })

  it('rejects a non-uuid assignee', () => {
    const result = createTicketSchema.safeParse({
      subject: 'Help',
      assignedTo: 'someone',
    })

    expect(result.success).toBe(false)
  })
})

describe('updateTicketSchema', () => {
  it('allows a partial update', () => {
    expect(updateTicketSchema.safeParse({ status: 'resolved' }).success).toBe(
      true,
    )
  })

  it('allows clearing the assignee with null', () => {
    expect(updateTicketSchema.safeParse({ assignedTo: null }).success).toBe(true)
  })

  it('rejects more than 10 tags', () => {
    const result = updateTicketSchema.safeParse({
      tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`),
    })

    expect(result.success).toBe(false)
  })
})

describe('ticketFilterSchema', () => {
  it('coerces string query params to numbers', () => {
    const parsed = ticketFilterSchema.parse({ limit: '25', offset: '5' })

    expect(parsed.limit).toBe(25)
    expect(parsed.offset).toBe(5)
  })

  it('applies defaults', () => {
    const parsed = ticketFilterSchema.parse({})

    expect(parsed.limit).toBe(100)
    expect(parsed.offset).toBe(0)
  })

  it('rejects a limit above the maximum', () => {
    expect(ticketFilterSchema.safeParse({ limit: '500' }).success).toBe(false)
  })
})

describe('addCommentSchema', () => {
  it('trims content and defaults isInternal to false', () => {
    const parsed = addCommentSchema.parse({ content: '  looking into it  ' })

    expect(parsed.content).toBe('looking into it')
    expect(parsed.isInternal).toBe(false)
  })

  it('rejects empty content', () => {
    expect(addCommentSchema.safeParse({ content: '   ' }).success).toBe(false)
  })
})

describe('createArticleSchema', () => {
  const valid = {
    title: '  How to reset a password  ',
    slug: 'how-to-reset-a-password',
    content: 'Steps go here.',
  }

  it('trims the title and defaults isPublished to false', () => {
    const parsed = createArticleSchema.parse(valid)

    expect(parsed.title).toBe('How to reset a password')
    expect(parsed.isPublished).toBe(false)
  })

  it('rejects a slug with uppercase or spaces', () => {
    expect(
      createArticleSchema.safeParse({ ...valid, slug: 'How To Reset' }).success,
    ).toBe(false)
  })

  it('rejects more than 10 tags', () => {
    const result = createArticleSchema.safeParse({
      ...valid,
      tags: Array.from({ length: 11 }, (_, i) => `t${i}`),
    })

    expect(result.success).toBe(false)
  })
})

describe('createAbstRegisterSchema', () => {
  it('accepts a valid date and sensitivity values', () => {
    const parsed = createAbstRegisterSchema.parse({
      date: '2026-01-15',
      antibioticResults: { o: 'S', czx: 'R', ex10: 'I' },
    })

    expect(parsed.date).toBe('2026-01-15')
    expect(parsed.antibioticResults?.o).toBe('S')
  })

  it('rejects a non-ISO date', () => {
    expect(createAbstRegisterSchema.safeParse({ date: '15/01/2026' }).success).toBe(
      false,
    )
  })

  it('rejects an unknown sensitivity value', () => {
    const result = createAbstRegisterSchema.safeParse({
      date: '2026-01-15',
      antibioticResults: { o: 'X' },
    })

    expect(result.success).toBe(false)
  })
})
