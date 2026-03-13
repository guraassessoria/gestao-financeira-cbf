/**
 * Cache in-memory para resultados do cálculo DRE.
 * O DRE só muda quando um novo CT2 é importado.
 * Cada entrada expira em 10 minutos como segurança extra.
 */

const TTL_MS = 10 * 60 * 1000 // 10 minutos

type CacheEntry = {
  data: unknown
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

export function dreCache() {
  return {
    get(key: string): unknown | null {
      const entry = cache.get(key)
      if (!entry) return null
      if (Date.now() > entry.expiresAt) {
        cache.delete(key)
        return null
      }
      return entry.data
    },

    set(key: string, data: unknown): void {
      cache.set(key, { data, expiresAt: Date.now() + TTL_MS })
    },

    invalidateAll(): void {
      cache.clear()
    },
  }
}
