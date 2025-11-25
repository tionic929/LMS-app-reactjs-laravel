import { useState } from 'react'

type Role = 'instructor' | 'student'

export default function RegisterLayout() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<Role>('student')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      alert('Passwords do not match')
      return
    }
    alert(JSON.stringify({ name, email, role, password: password ? '' : '' }))
  }

  return (
    <main className='overflow-auto'>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Register</h1>
            <p className="text-sm text-gray-500">Create a new account</p>
          </div>

          <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-gray-600">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 text-gray-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 text-gray-600">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 text-gray-600">Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 text-gray-600">Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </label>

              <div className="flex items-center justify-between">
                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Create account</button>
                <button type="button" onClick={() => alert('Back to login (not wired)')} className="text-sm text-gray-600 hover:underline">Back to login</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
