import { MiddlewareHandler } from 'hono'
import { verify, JwtPayload } from 'jsonwebtoken'

export interface EnvBindings {
  TOKEN_SECRET: string
  CONVERSION_KV: KVNamespace
}

export const validateJwt = (): MiddlewareHandler<{ Bindings: EnvBindings }> => {
  return async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header) return c.json({ error: 'Unauthorized' }, 401)
    const token = header.replace(/^Bearer\s+/, '')
    try {
      const payload = verify(token, c.env.TOKEN_SECRET) as JwtPayload
      c.set('jwtPayload', payload)
    } catch (err) {
      return c.json({ error: 'Invalid token' }, 401)
    }
    await next()
  }
}

export const limitConversions = (limit: number): MiddlewareHandler<{ Bindings: EnvBindings }> => {
  return async (c, next) => {
    const payload = c.get('jwtPayload') as JwtPayload
    const key = `count:${payload.sub ?? payload.id}`
    const stored = await c.env.CONVERSION_KV.get(key)
    const count = stored ? parseInt(stored) : 0
    if (count >= limit) {
      return c.json({ error: 'Conversion limit reached' }, 429)
    }
    await c.env.CONVERSION_KV.put(key, String(count + 1))
    await next()
  }
}
