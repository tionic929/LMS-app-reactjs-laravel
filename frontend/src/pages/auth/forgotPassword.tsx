import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Book, User } from 'lucide-react'; 
import SadImg from '../../assets/sad.png'

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      console.log("[DEBUG] Sending forgot-password request:", { email });

      const res = await fetch("/api/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("[DEBUG] Response object:", res);

      // Try to parse JSON even if status is not 200
      let data: any = {};
      try {
        data = await res.json();
      } catch (err) {
        console.error("[DEBUG] Failed to parse JSON response:", err);
      }

      console.log("[DEBUG] Parsed response data:", data);

      if (res.ok) {
        setSuccessMessage(data.message || "Reset link sent to your email.");
        setEmail("");
      } else {
        setErrorMessage(data.message || `Something went wrong (status ${res.status})`);
      }
    } catch (err: any) {
      console.error("[DEBUG] Network or fetch error:", err);
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className="min-h-screen flex font-sans">
            {/* --- 1. Visual/Image Column (Branding) --- */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center p-12">
                <div className="text-center text-white">
                    <h2 className="text-[4rem] leading-tight font-extrabold mb-4">
                        Trouble Signing In?
                    </h2>
                    <p className="text-lg opacity-90 mb-10">
                        We'll send you instructions to securely reset your password.
                    </p>
                    <div className="mt-10 mx-auto max-w-sm overflow-hidden rounded-xl">
                        {/* Using a placeholder image instead of a local asset (SadImg) */}
                        <img src={SadImg} alt="Password Recovery Placeholder" className="w-full h-auto object-cover rounded-lg shadow-xl" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/400x300/e0e7ff/4338ca?text=Recovery+Info'; }}/>
                    </div>
                </div>
            </div>

            {/* --- 2. Forgot Password Form Column --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
                <div className="mx-auto w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-2 text-indigo-600">
                            <span className="px-3">
                                {/* Using the corrected 'Book' icon from lucide-react */}
                                <Book className='w-7 h-7'/>
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900">Password Reset</h1>
                        </div>
                        <p className="text-md text-gray-500">
                            Enter your email address to receive a password reset link.
                        </p>
                    </div>

                    {/* Success/Error Message Display */}
                    {(message || error) && (
                        <div className={`p-4 mb-6 rounded-lg ${message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center shadow-md`}>
                            {message ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                            <span className="text-sm font-medium">{message || error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email Input with Icon */}
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    {/* Using the corrected 'User' icon from lucide-react */}
                                    <User className='w-4 h-4' />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading || !!message} // Disable after successful submission
                                    placeholder="you@example.com"
                                    className="w-full rounded-lg border-2 border-gray-300 pl-10 pr-3 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:opacity-75"
                                />
                            </div>
                        </label>
                        
                        {/* Submit Button */}
                        <div>
                            <button 
                                type="submit" 
                                // Disable if loading, success, or email is empty
                                disabled={loading || !!message || email === ''} 
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                        
                        {/* Links */}
                        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
                            <p>
                                Remember your password? 
                                <Link
                                    to="/login"
                                    className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition duration-150"
                                >
                                    Return to Sign In
                                </Link>
                            </p>
                            <p>
                                New user? 
                                <Link
                                    to="/register"
                                    className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition duration-150"
                                >
                                    Create an Account
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

// import React, { useState } from "react";

// const ForgotPassword: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setSuccessMessage("");
//     setErrorMessage("");

//     try {
//       console.log("[DEBUG] Sending forgot-password request:", { email });

//       const res = await fetch("/api/forget-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       console.log("[DEBUG] Response object:", res);

//       // Try to parse JSON even if status is not 200
//       let data: any = {};
//       try {
//         data = await res.json();
//       } catch (err) {
//         console.error("[DEBUG] Failed to parse JSON response:", err);
//       }

//       console.log("[DEBUG] Parsed response data:", data);

//       if (res.ok) {
//         setSuccessMessage(data.message || "Reset link sent to your email.");
//         setEmail("");
//       } else {
//         setErrorMessage(data.message || `Something went wrong (status ${res.status})`);
//       }
//     } catch (err: any) {
//       console.error("[DEBUG] Network or fetch error:", err);
//       setErrorMessage(err.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password</h2>
//         <p className="text-gray-600 mb-6">
//           Enter your email address and we will send you a link to reset your password.
//         </p>

//         {successMessage && (
//           <div className="mb-4 text-green-600 bg-green-100 p-2 rounded">{successMessage}</div>
//         )}
//         {errorMessage && (
//           <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{errorMessage}</div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
//               placeholder="you@example.com"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 px-4 rounded text-white font-medium ${
//               loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
