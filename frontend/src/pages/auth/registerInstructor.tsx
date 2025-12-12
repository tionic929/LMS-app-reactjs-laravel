// src/pages/auth/RegisterInstructor.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BookOpen, User, Lock, Mail, Calendar, Phone, Building,
    AlertCircle, Loader2, FileText, ArrowRight, CheckCircle, ListChecks
} from "lucide-react";
import InstructorPNG from "../../assets/instructor.png";
import { useAuth } from "../../contexts/AuthContext";
import { FaLock } from "react-icons/fa6";
import { toast } from "react-toastify";

interface InputWithIconProps {
    label: string;
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    icon: any;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
    label, id, type, value, onChange, icon: Icon, placeholder = "", required = true, className = ""
}) => {

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange(e);

    return (
        <label htmlFor={id} className={`block text-sm font-medium text-gray-700 ${className}`}>
            {label}
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Icon className="w-4 h-4" />
                </div>

                {type === "textarea" ? (
                    <textarea
                        id={id}
                        rows={2}
                        value={value}
                        onChange={handleChange}
                        required={required}
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                    />
                ) : (
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={handleChange}
                        required={required}
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                    />
                )}
            </div>
        </label>
    );
};

interface FileInputProps {
    label: string;
    id: string;
    onChange: (file: File | null) => void;
    icon: any;
    required?: boolean;
}

const FileInput: React.FC<FileInputProps> = ({
    label, id, onChange, icon: Icon, required = true
}) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFileName(file?.name || null);
        onChange(file);
    };

    return (
        <label className="block text-sm font-medium text-gray-700">
            {label}
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    id={id}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required={required}
                    className="sr-only"
                />

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => document.getElementById(id)?.click()}
                        className="flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-all duration-200"
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {fileName ? "Change File" : "Upload File"}
                    </button>

                    {fileName && (
                        <span className="text-xs text-gray-500 truncate max-w-[150px] italic">
                            {fileName}
                        </span>
                    )}
                </div>
            </div>
        </label>
    );
};

const RegisterInstructor: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const [error, setError] = useState("");
    // Note: 'success' state is optional if you rely purely on toast, 
    // but kept here for inline feedback if preferred.
    const [success, setSuccess] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);

    const [isSendingCode, setIsSendingCode] = useState(false);
    const [timer, setTimer] = useState(0);

    const handleSendCode = async () => {
        if (!email) return setError("Please enter your email first.");

        setError("");
        setIsSendingCode(true);
        setTimer(60);

        try {
            console.log("Sending verification code to:", email);
            const res = await fetch("http://localhost:8000/api/send-email-verification-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Verification Code Error:", text);
                setError("Failed to send verification code.");
                return;
            }

            console.log("Verification code sent successfully.");
            toast.success("✅ Verification code sent to your email!");
        } catch (err) {
            console.error(err);
            setError("Unable to send verification code. Try again.");
        }
    };

    /* TIMER */
    useEffect(() => {
        if (timer <= 0) {
            setIsSendingCode(false);
            return;
        }

        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const isStepOneValid = () =>
        firstName && lastName && dateOfBirth && phoneNumber && address;

    const isStepTwoValid = () =>
        email && password && passwordConfirmation && resumeFile && verificationCode;

    // --- SUBMIT FUNCTION WITH DEBUGGING ---
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!isStepTwoValid()) {
            return setError("Please complete all fields.");
        }

        if (password !== passwordConfirmation) {
            return setError("Passwords do not match.");
        }

        setIsLoading(true);

        try {
            console.log("🔍 Attempting to register instructor...");

            const result = await register({
                firstName,
                middleInitial: middleInitial || null,
                lastName,
                email,
                password,
                passwordConfirmation,
                dateOfBirth,
                phoneNumber,
                address,
                resumeFile,
                role: "instructor",
            }) as { message: string } | undefined;
            
            console.log("✅ Register API returned:", result);

            // 2. Extract message safely
            let successMessage = "✅ Application submitted and is pending approval.";
            
            if (result && typeof result === 'object' && 'message' in result) {
                successMessage = result.message;
            } else if (!result) {
                console.warn("⚠️ Warning: Register result is null/undefined. Using default message.");
            }
            navigate("/pending");

        } catch (err: any) {
            console.error("❌ Registration Error Caught:", err);
            
            if(err.response?.status === 401){
                console.error("Invalid credentials.");
                setError(err.message || "Registration failed.");
            } else {
                setError(err.message || "Something went wrong, please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const StepIndicator = ({
        currentStep,
        stepNumber,
        label,
    }: {
        currentStep: number;
        stepNumber: number;
        label: string;
    }) => {
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
            <div className="flex flex-col items-center">
                <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold transition
                    ${isCompleted ? "bg-green-500" : isActive ? "bg-red-600" : "bg-gray-300"} `}
                >
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                    className={`text-sm mt-1 ${
                        isActive ? "text-red-600" : "text-gray-500"
                    }`}
                >
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex font-sans antialiased">
            {/* LEFT: IMAGE / BRANDING */}
            <div className="hidden lg:flex w-1/2 bg-red-600 items-center justify-center p-12 shadow-2xl">
                <div className="text-left text-white max-w-lg">
                    <h2 className="text-5xl font-extrabold">Empower the Next Generation</h2>
                    <p className="text-xl mt-4 opacity-90">
                        Apply to teach and help shape future learners.
                    </p>
                    <img src={InstructorPNG} className="mt-20 rounded-xl" title="instructor image" />
                </div>
            </div>

            {/* RIGHT: FORM */}
            <div className="w-full lg:w-1/2 flex items-center bg-white">
                <div className="mx-auto w-full max-w-lg p-8">

                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-2 text-red-600">
                            <span className="p-3 border border-red-200 rounded-full bg-red-50 shadow-md">
                                <BookOpen className="w-6 h-6" />
                            </span>
                            <h1 className="text-3xl font-bold px-5 text-gray-900">Instructor Application</h1>
                        </div>
                    </div>

                    {/* STEP INDICATORS */}
                    <div className="flex justify-around items-center py-3 border-b">
                        <StepIndicator currentStep={step} stepNumber={1} label="Personal Info" />
                        <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? "bg-red-600" : "bg-gray-300"}`} />
                        <StepIndicator currentStep={step} stepNumber={2} label="Account & Docs" />
                    </div>

                    {/* ERRORS */}
                    {error && (
                        <div className="p-3 mt-4 text-red-700 bg-red-100 rounded-lg border border-red-300 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-lg border border-green-300">
                            {success}
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={submit} className="space-y-6 mt-6">
                        {/* ------------------ STEP 1 ------------------ */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-red-600" />
                                    Personal Details
                                </h2>

                                <div className="grid grid-cols-3 gap-4">
                                    <InputWithIcon label="First Name" id="firstName" type="text"
                                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                        icon={User} placeholder="John" />

                                    <InputWithIcon label="M.I" id="middleInitial" type="text"
                                        value={middleInitial}
                                        onChange={(e) =>
                                            setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())
                                        }
                                        icon={User} required={false} placeholder="D" />

                                    <InputWithIcon label="Last Name" id="lastName" type="text"
                                        value={lastName} onChange={(e) => setLastName(e.target.value)}
                                        icon={User} placeholder="Doe" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithIcon label="Date of Birth" id="dob" type="date"
                                        value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                                        icon={Calendar} />

                                    <InputWithIcon label="Phone Number" id="phone" type="tel"
                                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                        icon={Phone} placeholder="09xx-xxx-xxxx" />
                                </div>

                                <InputWithIcon label="Residential Address" id="address" type="textarea"
                                    value={address} onChange={(e) => setAddress(e.target.value)}
                                    icon={Building} placeholder="Street, City, Province" />

                                <button
                                    type="button"
                                    onClick={() => isStepOneValid() && setStep(2)}
                                    disabled={!isStepOneValid()}
                                    className={`w-full flex justify-center py-2 px-4 rounded-lg text-sm text-white shadow-md 
                                        ${isStepOneValid()
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-red-400 cursor-not-allowed"
                                        }`}
                                >
                                    Next: Account Details <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* ------------------ STEP 2 ------------------ */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center">
                                    <ListChecks className="w-5 h-5 mr-2 text-red-600" />
                                    Account & Documents
                                </h2>

                                <FileInput
                                    label="Upload Resume (PDF/DOCX)"
                                    id="resume"
                                    onChange={setResumeFile}
                                    icon={FileText}
                                />

                                <InputWithIcon label="Email" id="email" type="email"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    icon={Mail} placeholder="you@example.com" />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithIcon label="Password" id="password" type="password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        icon={Lock} placeholder="••••••" />

                                    <InputWithIcon label="Confirm Password" id="passConfirm" type="password"
                                        value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        icon={Lock} placeholder="••••••" />
                                </div>

                                {/* VERIFICATION CODE */}
                                <div className="flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <InputWithIcon
                                            label="Verification Code"
                                            id="verification"
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            icon={FaLock}
                                            placeholder="Enter code"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={isSendingCode}
                                        className={`h-[42px] px-5 rounded-md text-sm text-white 
                                            ${isSendingCode 
                                                ? "bg-gray-400" 
                                                : "bg-red-600 hover:bg-red-700"
                                            }`}
                                    >
                                        {isSendingCode ? `Wait ${timer}s` : "Send Code"}
                                    </button>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-1/3 py-2 px-4 bg-white border border-gray-300 rounded-lg shadow-sm text-sm"
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !isStepTwoValid()}
                                        className={`w-2/3 py-2 px-4 rounded-lg text-sm text-white shadow-md
                                            ${isLoading || !isStepTwoValid()
                                                ? "bg-red-400 cursor-not-allowed"
                                                : "bg-red-600 hover:bg-red-700"
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* FOOTER */}
                        <div className="pt-4 border-t">
                            <p className="text-sm text-center text-gray-600">
                                Already have an account?
                                <Link to="/login" className="text-red-600 ml-1 hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default RegisterInstructor;