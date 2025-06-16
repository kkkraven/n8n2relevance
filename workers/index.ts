import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
const { sign } = jwt
import { validateJwt, limitConversions, EnvBindings } from './middleware.js'

interface Env extends EnvBindings {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env; Variables: { jwtPayload: JwtPayload } }>()

app.post('/api/register', async c => {
  const { email, password } = await c.req.json()
  const hash = await bcrypt.hash(password, 10)
  await c.env.DB.prepare(
    'INSERT INTO users (email, password) VALUES (?, ?)'
  ).bind(email, hash).run()
  return c.json({ success: true })
})

app.post('/api/login', async c => {
  const { email, password } = await c.req.json()
  const result = await c.env.DB.prepare(
    'SELECT id, password FROM users WHERE email = ?'
  ).bind(email).first<{ id: number; password: string }>()
  if (!result) return c.json({ error: 'Invalid credentials' }, 401)
  const match = await bcrypt.compare(password, result.password)
  if (!match) return c.json({ error: 'Invalid credentials' }, 401)
  const token = sign({ id: result.id, email }, c.env.TOKEN_SECRET, {
    expiresIn: '1h',
  })
  return c.json({ token })
})

// Example protected route using middleware
app.get('/api/convert', validateJwt(), limitConversions(5), c => {
  return c.json({ data: 'conversion allowed' })
})

export default app
