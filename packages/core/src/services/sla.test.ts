import { describe, expect, it } from 'vitest'
import {
  calculateSLADueDates,
  checkSLAStatus,
  getDefaultSLATargets,
} from '../services/sla'

const MINUTE = 60 * 1000

describe('getDefaultSLATargets', () => {
  it('returns tighter targets for higher priority', () => {
    const urgent = getDefaultSLATargets('urgent')
    const high = getDefaultSLATargets('high')
    const medium = getDefaultSLATargets('medium')
    const low = getDefaultSLATargets('low')

    expect(urgent.firstResponseTime).toBeLessThan(high.firstResponseTime)
    expect(high.firstResponseTime).toBeLessThan(medium.firstResponseTime)
    expect(medium.firstResponseTime).toBeLessThan(low.firstResponseTime)
  })

  it('returns the documented values', () => {
    expect(getDefaultSLATargets('urgent')).toEqual({
      firstResponseTime: 30,
      resolutionTime: 240,
    })
    expect(getDefaultSLATargets('low')).toEqual({
      firstResponseTime: 480,
      resolutionTime: 2880,
    })
  })
})

describe('calculateSLADueDates', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z')
  const targets = { firstResponseTime: 60, resolutionTime: 480 }

  it('applies the medium multiplier of 1', () => {
    const { firstResponseDue, resolutionDue } = calculateSLADueDates(
      createdAt,
      'medium',
      targets,
    )

    expect(firstResponseDue.getTime() - createdAt.getTime()).toBe(60 * MINUTE)
    expect(resolutionDue.getTime() - createdAt.getTime()).toBe(480 * MINUTE)
  })

  it('halves the window for urgent tickets', () => {
    const { firstResponseDue } = calculateSLADueDates(
      createdAt,
      'urgent',
      targets,
    )

    expect(firstResponseDue.getTime() - createdAt.getTime()).toBe(30 * MINUTE)
  })

  it('extends the window for low priority tickets', () => {
    const { firstResponseDue } = calculateSLADueDates(createdAt, 'low', targets)

    expect(firstResponseDue.getTime() - createdAt.getTime()).toBe(90 * MINUTE)
  })

  it('does not mutate the input date', () => {
    const original = createdAt.getTime()
    calculateSLADueDates(createdAt, 'high', targets)
    expect(createdAt.getTime()).toBe(original)
  })
})

describe('checkSLAStatus', () => {
  it('reports on_track when deadlines are far away', () => {
    const now = Date.now()
    expect(
      checkSLAStatus({
        firstResponseDue: new Date(now + 10 * 60 * MINUTE),
        firstResponseAt: null,
        resolutionDue: new Date(now + 20 * 60 * MINUTE),
        resolvedAt: null,
      }),
    ).toBe('on_track')
  })

  it('reports breached when the first response deadline has passed', () => {
    const now = Date.now()
    expect(
      checkSLAStatus({
        firstResponseDue: new Date(now - MINUTE),
        firstResponseAt: null,
        resolutionDue: new Date(now + 60 * MINUTE),
        resolvedAt: null,
      }),
    ).toBe('breached')
  })

  it('reports breached when the resolution deadline has passed', () => {
    const now = Date.now()
    expect(
      checkSLAStatus({
        firstResponseDue: new Date(now + 60 * MINUTE),
        firstResponseAt: new Date(now - MINUTE),
        resolutionDue: new Date(now - MINUTE),
        resolvedAt: null,
      }),
    ).toBe('breached')
  })

  it('ignores deadlines that were already met', () => {
    const now = Date.now()
    expect(
      checkSLAStatus({
        firstResponseDue: new Date(now - 60 * MINUTE),
        firstResponseAt: new Date(now - 50 * MINUTE),
        resolutionDue: new Date(now - 30 * MINUTE),
        resolvedAt: new Date(now - 20 * MINUTE),
      }),
    ).toBe('on_track')
  })
})
