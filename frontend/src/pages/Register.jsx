import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'

function registerApi(data) {
  return fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json())
}

export default function Register() {
  const navigate = useNavigate()
  const mutation = useMutation({ mutationFn: registerApi })
  const [form, setForm] = useState({ username: '', password: '' })

  const onSubmit = e => {
    e.preventDefault()
    mutation.mutate(form, {
      onSuccess: () => navigate('/login'),
    })
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" disabled={mutation.isPending}>Register</button>
      </form>
      {mutation.isError && <p style={{color:'red'}}>Error registering</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}
