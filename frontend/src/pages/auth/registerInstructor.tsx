// src/pages/auth/RegisterInstructor.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BookOpen, User, Lock, Mail, Calendar, Phone, Building,
    AlertCircle, Loader2, FileText, ArrowRight, CheckCircle, Camera
} from "lucide-react";
import InstructorPNG from "../../assets/instructor.png";
import { useAuth } from "../../contexts/AuthContext";
import { FaLock } from "react-icons/fa6";
import { toast } from "react-toastify";

// --- Sub-Components (Keep as is) ---
interface InputWithIconProps {
    label: string; id: string; type: string; value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    icon: any; placeholder?: string; required?: boolean; className?: string;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
    label, id, type, value, onChange, icon: Icon, placeholder = "", required = true, className = ""
}) => (
    <label htmlFor={id} className={`block text-sm font-medium text-gray-700 ${className}`}>
        {label}
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Icon className="w-4 h-4" />
            </div>
            {type === "textarea" ? (
                <textarea id={id} rows={2} value={value} onChange={onChange} required={required} placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200" />
            ) : (
                <input id={id} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200" />
            )}
        </div>
    </label>
);

interface FileInputProps { label: string; id: string; onChange: (file: File | null) => void; icon: any; required?: boolean; }

const FileInput: React.FC<FileInputProps> = ({ label, id, onChange, icon: Icon, required = true }) => {
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
                <input id={id} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required={required} className="sr-only" />
                <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => document.getElementById(id)?.click()}
                        className="flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-all duration-200">
                        <Icon className="w-4 h-4 mr-2" />
                        {fileName ? "Change File" : "Upload File"}
                    </button>
                    {fileName && <span className="text-xs text-gray-500 truncate max-w-[150px] italic">{fileName}</span>}
                </div>
            </div>
        </label>
    );
};

// --- Main Page Component ---
const RegisterInstructor: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [timer, setTimer] = useState(0);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSendCode = async () => {
        if (!email) return setError("Please enter your email first.");
        setError("");
        setIsSendingCode(true);
        setTimer(60);
        try {
            const res = await fetch("http://localhost:8000/api/send-email-verification-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Failed to send verification code.");
            toast.success("✅ Verification code sent to your email!");
        } catch (err) {
            setError("Unable to send verification code. Try again.");
            setIsSendingCode(false);
            setTimer(0);
        }
    };

    useEffect(() => {
        if (timer <= 0) { setIsSendingCode(false); return; }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const isStepOneValid = () => firstName && lastName && dateOfBirth && phoneNumber && address;
    const isStepTwoValid = () => email && password && passwordConfirmation && resumeFile && verificationCode;

    // 💡 ADJUSTED SUBMIT LOGIC: Move FormData append inside component
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isStepTwoValid()) return setError("Please complete all fields.");
        if (password !== passwordConfirmation) return setError("Passwords do not match.");

        setIsLoading(true);

        try {
            const formData = new FormData();
            
            // Text Fields
            formData.append("firstName", firstName);
            formData.append("middleInitial", middleInitial || "");
            formData.append("lastName", lastName);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("passwordConfirmation", passwordConfirmation);
            formData.append("dateOfBirth", dateOfBirth);
            formData.append("phoneNumber", phoneNumber);
            formData.append("address", address);
            formData.append("verificationCode", verificationCode);
            formData.append("role", "instructor");

            // 💡 File Fields - This is the crucial part for Laravel
            if (avatarFile) {
                formData.append("avatarFile", avatarFile);
            }
            if (resumeFile) {
                formData.append("resumeFile", resumeFile);
            }

            // Pass the FormData object directly to the context's register function
            await register(formData);
            
            navigate("/pending");
        } catch (err: any) {
            setError(err.message || "Something went wrong, please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const StepIndicator = ({ currentStep, stepNumber, label }: { currentStep: number; stepNumber: number; label: string; }) => (
        <div className="flex flex-col items-center">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold transition ${currentStep > stepNumber ? "bg-green-500" : currentStep === stepNumber ? "bg-red-600" : "bg-gray-300"}`}>
                {currentStep > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
            </div>
            <span className={`text-xs mt-1 font-medium ${currentStep === stepNumber ? "text-red-600" : "text-gray-400"}`}>{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen flex font-sans antialiased bg-gray-50">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 bg-red-600 items-center justify-center p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -mr-32 -mt-32 opacity-50" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-700 rounded-full -ml-48 -mb-48 opacity-30" />
                <div className="text-left text-white max-w-lg z-10">
                    <h2 className="text-5xl font-extrabold leading-tight">Empower the Next Generation</h2>
                    <p className="text-xl mt-6 opacity-90 leading-relaxed">Join our elite community of educators.</p>
                    <img src={InstructorPNG} className="mt-16 rounded-2xl shadow-2xl transform hover:scale-105 transition duration-500" alt="instructor" />
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex items-center bg-white">
                <div className="mx-auto w-full max-w-lg p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <span className="p-3 border border-red-100 rounded-2xl bg-red-50 text-red-600 shadow-sm">
                                <BookOpen className="w-8 h-8" />
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Instructor Application</h1>
                    </div>

                    <div className="flex justify-between items-center px-10 mb-10">
                        <StepIndicator currentStep={step} stepNumber={1} label="Personal Info" />
                        <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`} />
                        <StepIndicator currentStep={step} stepNumber={2} label="Account & Docs" />
                    </div>

                    {error && (
                        <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative group">
                                        <div onClick={() => fileInputRef.current?.click()}
                                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer transition hover:opacity-90 active:scale-95">
                                            {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar Preview" /> : <User className="w-12 h-12 text-gray-300" />}
                                        </div>
                                        <button title="fileupload" type="button" onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full text-white shadow-md hover:bg-red-700 transition-transform hover:scale-110">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <input title="filechange" ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3">Upload Profile Photo</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <InputWithIcon label="First Name" id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} icon={User} placeholder="John" />
                                    <InputWithIcon label="M.I" id="middleInitial" type="text" value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())} icon={User} required={false} placeholder="D" />
                                    <InputWithIcon label="Last Name" id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} icon={User} placeholder="Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithIcon label="Date of Birth" id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} icon={Calendar} />
                                    <InputWithIcon label="Phone Number" id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} icon={Phone} placeholder="09xx-xxx-xxxx" />
                                </div>
                                <InputWithIcon label="Residential Address" id="address" type="textarea" value={address} onChange={(e) => setAddress(e.target.value)} icon={Building} placeholder="Street, City, Province" />
                                <button type="button" onClick={() => setStep(2)} disabled={!isStepOneValid()}
                                    className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${isStepOneValid() ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}>
                                    Continue to Step 2 <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <FileInput label="Upload Resume (PDF/DOCX)" id="resume" onChange={setResumeFile} icon={FileText} />
                                <InputWithIcon label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} placeholder="name@domain.com" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithIcon label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} placeholder="••••••" />
                                    <InputWithIcon label="Confirm Password" id="passConfirm" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} icon={Lock} placeholder="••••••" />
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <InputWithIcon label="Verification Code" id="verification" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} icon={FaLock} placeholder="Enter code" />
                                    </div>
                                    <button type="button" onClick={handleSendCode} disabled={isSendingCode}
                                        className="h-[42px] px-6 rounded-lg text-xs font-bold text-white bg-red-600">
                                        {isSendingCode ? `Wait ${timer}s` : "Send Code"}
                                    </button>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Back</button>
                                    <button type="submit" disabled={isLoading}
                                        className="w-2/3 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 shadow-lg flex items-center justify-center">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterInstructor;