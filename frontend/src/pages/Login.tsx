import React, { useState } from 'react'

// --- Assuming you have an icon component available, e.g., from Heroicons ---
// Replace these with actual imports if using a library
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-6 0h18a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75v-7.5A2.25 2.25 0 015.25 9.75z" /></svg>;

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // NOTE: For security, never include the password in an alert/log in a real app.
    alert(JSON.stringify({ email, password: password ? '[MASKED]' : '', remember }))
  }

  return (
    <div className="min-h-screen flex">
      {/* --- 1. Visual/Image Column (LMS Branding) --- */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">
            Welcome to the LMS Hub
          </h2>
          <p className="text-lg mb-6 opacity-80">
            Your centralized portal for learning and collaboration.
          </p>
          <div className="mt-8 mx-auto max-w-sm">
            {/* Contextually relevant image for e-learning/LMS */}
            

[Image of digital learning platform interface]

          </div>
        </div>
      </div>

      {/* --- 2. Login Form Column --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25m0 0V5.25M12 12.75h.008v.008H12v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75H3M12 12.75h9" /></svg>
                <h1 className="text-3xl font-bold text-gray-900">LMS Access</h1>
            </div>
            <p className="text-md text-gray-500">Sign in to continue your course.</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            
            {/* Email Input with Icon */}
            <label className="block text-sm font-medium text-gray-700">
              Email
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </label>

            {/* Password Input with Icon */}
            <label className="block text-sm font-medium text-gray-700">
              Password
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </label>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-600">
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)} 
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => alert('Forgot password flow (not implemented)')} 
                className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Sign in
              </button>
            </div>
            
            {/* Create Account Link */}
            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account? 
              <button 
                type="button" 
                onClick={() => alert('Register flow not implemented')} 
                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Create account
              </button>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login