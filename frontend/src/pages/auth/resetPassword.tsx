import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await axios.post(
                "http://127.0.0.1:8000/api/reset-password",
                {
                    token: token,
                    password: password,
                    password_confirmation: passwordConfirmation,
                },
                { withCredentials: true }
            );

            setMessage("Password updated! Redirecting...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong.");
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">

                <h2 className="text-2xl font-semibold text-center mb-4">
                    Reset Password
                </h2>

                {message && <p className="bg-green-200 p-2 mb-2">{message}</p>}
                {error && <p className="bg-red-200 p-2 mb-2">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded"
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
