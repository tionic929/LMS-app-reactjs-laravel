import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Lock, Key } from 'lucide-react'; 

const API_URL = 'http://localhost:3000/api/reset-password';

const ResetPassword: React.FC = () => {
    // Hooks for navigation and URL parameters
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // State for form data and status
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // --- 1. Token Extraction (Runs on component mount) ---
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            // No token found in URL, show an error message
            setError('Missing password reset token. Please check your email link or request a new reset.');
        }
    }, [searchParams]);

    // --- 2. Form Submission Handler ---
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        if (!token) {
            setError('Reset token is missing or invalid.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token, 
                    newPassword,
                    confirmPassword // Sending confirmation is good practice for server-side validation too
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Success! Your password has been reset. Redirecting to login...');
                
                // Clear inputs
                setNewPassword('');
                setConfirmPassword('');

                // Redirect to the login page after a few seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } else {
                // Handle token expired, token invalid, or validation errors (400)
                console.error("Server responded with error status:", response.status, data);
                setError(data.message || 'The reset link is invalid or has expired. Please request a new one.');
            }
        } catch (err) {
            console.error("Network or Fetch Error:", err);
            setError('Could not connect to the reset service. Please ensure the Node.js server is running on port 3000.');
        } finally {
            setLoading(false);
        }
    };

    // --- 3. Render Logic ---

    // If no token is present and we've verified it, or an unrecoverable error occurred:
    if (error && !token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
                <div className="mx-auto w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-4">Reset Link Error</h1>
                    <p className="text-red-700 mb-6">{error}</p>
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition duration-150"
                    >
                        Request a New Password Reset Link
                    </Link>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="mx-auto w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-2 text-indigo-600">
                        <span className="px-3">
                            <Key className='w-7 h-7'/>
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
                    </div>
                    <p className="text-md text-gray-500">
                        Enter and confirm your new password below.
                    </p>
                </div>

                {/* Success/Error Message Display */}
                {(message || error) && (
                    <div className={`p-4 mb-6 rounded-lg ${message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center shadow-md`}>
                        {message ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                        <span className="text-sm font-medium">{message || error}</span>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">

                    {/* New Password Input */}
                    <label className="block text-sm font-medium text-gray-700">
                        New Password
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock className='w-4 h-4' />
                            </div>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading || !!message}
                                placeholder="Minimum 8 characters"
                                className="w-full rounded-lg border-2 border-gray-300 pl-10 pr-3 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:opacity-75"
                            />
                        </div>
                    </label>

                    {/* Confirm Password Input */}
                    <label className="block text-sm font-medium text-gray-700">
                        Confirm Password
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock className='w-4 h-4' />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading || !!message}
                                placeholder="Re-enter new password"
                                className="w-full rounded-lg border-2 border-gray-300 pl-10 pr-3 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:opacity-75"
                            />
                        </div>
                    </label>
                    
                    {/* Submit Button */}
                    <div>
                        <button 
                            type="submit" 
                            disabled={loading || !!message || !token} 
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Change Password'}
                        </button>
                    </div>
                    
                    {/* Link to Login */}
                    <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
                        <Link
                            to="/login"
                            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition duration-150"
                        >
                            Return to Sign In
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ResetPassword;