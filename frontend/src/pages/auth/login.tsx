import React, { useState } from 'react'
import { useAuth } from "../../contexts/AuthContext"; // <-- Integrated Logic
// Using mock image URL for portability, replace with actual MonkeyPNG import if available
import MonkeyPNG from '../../assets/monkey.png';
import { FaBook, FaUser, FaLock } from 'react-icons/fa6'; // Assuming this icon is correctly imported
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Added loading state

  const { login } = useAuth(); // <-- Integrated Logic
  const navigate = useNavigate(); // Make sure to call inside component

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true); // Start loading

    try {
      await login(email, password); 
      // Login successful → redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      // Backend returns 403 for pre-instructor pending
      if (err.response?.status === 403) {
        toast.warning(err.response.data.message || "Your instructor application is pending approval.");
        navigate("/pending"); // optional: redirect to a dedicated Pending Approval page
      } else if (err.response?.status === 401) {
        toast.error("Invalid credentials");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
        setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <>
        {/*
            This style block ensures the 'animate-spin' utility works for the loader icon,
            in case the environment doesn't load default Tailwind keyframes.
        */}
        <style>
            {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}
        </style>

        <div className="min-h-screen flex">
            {/* --- 1. Visual/Image Column (LMS Branding) --- */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center p-12">
                <div className="text-left text-white">
                    <h2 className="text-[5rem] font-extrabold leading-tight">
                        Learn anything like a monkey would
                    </h2>
                    <p className="text-lg opacity-80">
                        Your centralized portal for learning and collaboration.
                    </p>
                    <div className="mt-10 mx-auto max-w-sm">
                        {/* Using a placeholder image for 'MonkeyPNG' */}
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
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <FaUser className='h-4 w-4' />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                />
                            </div>
                        </label>

                        {/* Password Input with Icon */}
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <FaLock className='h-4 w-4' />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
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
                            <Link
                                to="/forgot-password"
                                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button (Updated with Loading State) */}
                        <div>
                            <button 
                                type="submit" 
                                disabled={isLoading} // Disabled when loading
                                className={`
                                    w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white transition duration-150 ease-in-out
                                    ${isLoading 
                                        ? 'bg-indigo-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Signing In...</span>
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                        
                        {/* Create Account Link */}
                        <p className="mt-4 text-center text-sm text-gray-600">
                            Don't have an account? 
                            <Link
                                to="/register"
                                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                                Create account
                            </Link>
                        </p>

                        {/* Sign up as instructor */}
                        <p className="mt-4 text-center text-sm text-gray-600">
                            Want to share your knowledge?
                            <Link
                                to="/registerInstructor"
                                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                                Click me!
                            </Link>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    </>
  )
}

export default Login