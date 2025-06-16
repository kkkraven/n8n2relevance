import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'

function loginApi(data) {
  return fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json())
}

export default function Login() {
  const navigate = useNavigate()
  const mutation = useMutation({ mutationFn: loginApi })
  const [form, setForm] = useState({ username: '', password: '' })

  const onSubmit = e => {
    e.preventDefault()
    mutation.mutate(form, {
      onSuccess: () => navigate('/dashboard'),
    })
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" disabled={mutation.isPending}>Login</button>
      </form>
      {mutation.isError && <p style={{color:'red'}}>Error logging in</p>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  )
}
