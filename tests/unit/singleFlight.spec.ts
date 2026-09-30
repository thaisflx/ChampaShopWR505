import { describe, expect, it, vi } from 'vitest'
import { createSingleFlight } from '../../utils/singleFlight'

describe('createSingleFlight', () => {
  it("ne lance qu'une seule tâche pour des appels simultanés", async () => {
    const task = vi.fn<() => Promise<boolean>>().mockResolvedValue(true)
    const run = createSingleFlight(task)

    const results = await Promise.all([run(), run(), run()])

    expect(task).toHaveBeenCalledTimes(1)
    expect(results).toEqual([true, true, true])
  })

  it('relance une nouvelle tâche une fois la précédente terminée', async () => {
    const task = vi.fn<() => Promise<boolean>>().mockResolvedValue(true)
    const run = createSingleFlight(task)

    await run()
    await run()

    expect(task).toHaveBeenCalledTimes(2)
  })

  it('libère le verrou même si la tâche échoue', async () => {
    const task = vi
      .fn<() => Promise<boolean>>()
      .mockRejectedValueOnce(new Error('refresh KO'))
      .mockResolvedValueOnce(true)
    const run = createSingleFlight(task)

    await expect(run()).rejects.toThrow('refresh KO')
    await expect(run()).resolves.toBe(true)
    expect(task).toHaveBeenCalledTimes(2)
  })
})
