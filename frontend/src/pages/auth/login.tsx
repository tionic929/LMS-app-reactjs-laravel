import React, { useState } from 'react'
import { useAuth } from "../../contexts/AuthContext"; // <-- Integrated Logic
import MonkeyPNG from '../../assets/monkey.png';
import { FaBook, FaUser, FaLock } from 'react-icons/fa6'; // Assuming this icon is correctly imported
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false) // <-- Retained from UI Component

  const { login } = useAuth(); // <-- Integrated Logic

  const submit = async (e: React.FormEvent) => { // <-- Integrated Logic
    e.preventDefault()
    // You can optionally pass 'remember' if your login function handles it:
    await login(email, password); 
    
    // NOTE: Removed the 'alert' from the previous UI component for actual logic execution.
  }

  return (
    <div className="min-h-screen flex">
      {/* --- 1. Visual/Image Column (LMS Branding) --- */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center p-12">
        <div className="text-left text-white">
          <h2 className="text-[5rem] font-extrabold">
            Learn anything like a monkey would
          </h2>
          <p className="text-lg opacity-80">
            Your centralized portal for learning and collaboration.
          </p>
          <div className="mt-10 mx-auto max-w-sm">
            <img src={ MonkeyPNG } alt="" />
          </div>
        </div>
      </div>

      {/* --- 2. Login Form Column --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2 text-indigo-600">
                <span className="px-3">
                  <FaBook className='w-6 h-6'/>
                </span>
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
                  <FaUser />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:py-5 px-2 transition-all duration-200"
                />
              </div>
            </label>

            {/* Password Input with Icon */}
            <label className="block text-sm font-medium text-gray-700">
              Password
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:py-5 px-2 transition-all duration-200"
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
              <Link
                to="/register" // Use the 'to' prop for navigation
                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Create account
              </Link>
            </p>

            {/* Sign up as instructor */}
            <p className="mt-4 text-center text-sm text-gray-600">
              Want to share your knowledge?
              <Link
                to="/registerInstructor" // Use the 'to' prop for navigation
                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Click me!
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login