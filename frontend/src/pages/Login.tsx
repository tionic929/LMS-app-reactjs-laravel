import { useState } from 'react'

export default function LoginLayout() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(JSON.stringify({ email, password: password ? '' : '', remember }))
  }

  return (
    <main className='overflow-auto'>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-1 gap-4">
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

              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" onClick={() => alert('Forgot password flow (not implemented)')} className="text-indigo-600 hover:underline">Forgot password?</button>
              </div>

              <div className="flex items-center justify-between">
                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Sign in</button>
                <button type="button" onClick={() => alert('Register flow not implemented')} className="text-sm text-gray-600 hover:underline">Create account</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
