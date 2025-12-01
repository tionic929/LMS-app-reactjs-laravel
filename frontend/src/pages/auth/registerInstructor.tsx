import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Lock, Mail, Calendar, Phone, Building, AlertCircle, Loader2, FileText, ArrowRight, CheckCircle, ListChecks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react'; 
import InstructorPNG from '../../assets/instructor.png'
import { useAuth } from '../../contexts/AuthContext'; 

// --- 1. REUSABLE INPUT COMPONENTS ---

// Define the reusable Input component interface
interface InputWithIconProps {
    label: string; 
    id: string; 
    type: string; 
    value: string; 
    // Simplified handler type in the component props
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; 
    icon: LucideIcon;
    placeholder?: string;
    required?: boolean;
    className?: string; 
}

// Reusable Input Component (Type Assertion Fix Applied Here)
const InputWithIcon: React.FC<InputWithIconProps> = ({ 
    label, id, type, value, onChange, icon: Icon, placeholder = '', required = true, className = '' 
}) => {
    
    // Universal Change Handler with Type Assertion
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Assert the target element type to ensure 'value' property exists confidently.
        // This resolves the TypeScript error 'Property 'value' does not exist on type...'
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        onChange(e); // Pass the original event object up
    };

    return (
        <label htmlFor={id} className={`block text-sm font-medium text-gray-700 ${className}`}>
            {label}
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Icon className='w-4 h-4' />
                </div>
                {type === 'textarea' ? (
                    <textarea
                        id={id}
                        value={value}
                        // Use the universal handler here
                        onChange={handleChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
                        required={required}
                        rows={2} // Reduced rows for compactness
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                    />
                ) : (
                    <input
                        id={id}
                        type={type}
                        value={value}
                        // Use the universal handler here
                        onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
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
    icon: LucideIcon;
    required?: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ label, id, onChange, icon: Icon, required = true }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFileName(file ? file.name : null);
        onChange(file);
    };

    return (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    id={id}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required={required}
                    onChange={handleFileChange}
                    className="sr-only"
                />
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => document.getElementById(id)?.click()}
                        className="flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-all duration-200"
                    >
                        <Icon className='w-4 h-4 mr-2' />
                        {fileName ? 'Change File' : 'Upload File'}
                    </button>
                    {fileName && (
                        <span className="text-xs text-gray-500 truncate max-w-[150px] italic">
                            {fileName}
                        </span>
                    )}
                    {!fileName && required && (
                        <span className="text-xs text-red-500">
                            Required
                        </span>
                    )}
                </div>
            </div>
        </label>
    );
};


// --- 2. MULTI-STEP INSTRUCTOR REGISTRATION COMPONENT (COMPACTED WITH TWO COLUMNS) ---

const RegisterInstructor: React.FC = () => {
    // State variables
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const { register } = useAuth(); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);

    // Form validation check for Step 1
    const isStepOneValid = () => {
        return firstName && lastName && dateOfBirth && phoneNumber && address;
    };
    
    // Form validation check for Step 2
    const isStepTwoValid = () => {
        return email && password && passwordConfirmation && resumeFile;
    };

    const handleNextStep = () => {
        setError('');
        if (isStepOneValid()) {
            setStep(2);
        } else {
            setError('Please fill out all required personal details before proceeding.');
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError('');
        setSuccess('');

        if (!isStepTwoValid()) {
            setError('Please fill out all required account details and upload your resume.');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }
        
        setIsLoading(true);
        
        try {
            await register({
                firstName,
                middleInitial: middleInitial || null, 
                lastName,
                email,
                password,
                passwordConfirmation,
                dateOfBirth,
                phoneNumber,
                address,
                role: 'instructor',
                resumeFile,
            }); 
            
            setSuccess('Application submitted successfully! Your account requires administrator review and approval.');
            // Clear sensitive fields
            setPassword('');
            setPasswordConfirmation('');

        } catch (err: any) {
            console.error('Registration failed', err);
            const message = err.message || 'Application failed. Please check your details and ensure the email is not already registered.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper component for the step indicator
    const StepIndicator: React.FC<{ currentStep: number, stepNumber: number, label: string }> = ({ currentStep, stepNumber, label }) => {
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        
        let circleClasses = 'w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold transition-colors duration-300';
        let textClasses = 'text-sm font-medium transition-colors duration-300';
        
        if (isCompleted) {
            circleClasses += ' bg-green-500';
            textClasses += ' text-gray-800';
        } else if (isActive) {
            circleClasses += ' bg-red-600 shadow-md';
            textClasses += ' text-red-600';
        } else {
            circleClasses += ' bg-gray-300';
            textClasses += ' text-gray-500';
        }

        return (
            <div className="flex flex-col items-center">
                <div className={circleClasses}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                <span className={textClasses + " mt-1 hidden sm:block"}>{label}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex font-sans antialiased">
            {/* --- 1. Visual/Image Column (Instructor Branding - Reinstated) --- */}
            <div className="hidden lg:flex w-1/2 bg-red-600 items-center justify-center p-12 shadow-2xl">
                <div className="text-left text-white max-w-lg">
                    <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
                        Empower the Next Generation of Learners
                    </h2>
                    <p className="text-xl mt-4 opacity-90">
                        Join our platform to manage courses, share materials, and build educational communities.
                    </p>
                    <div className="mt-20 mx-auto max-w-sm">
                        <img 
                            // Reusing the placeholder logic for the image path
                            src={InstructorPNG} 
                            alt="Learning Management System Instructor illustration" 
                            className="rounded-xl "
                        />
                    </div>
                </div>
            </div>

            {/* --- 2. Registration Form Column (Now hosting the compact multi-step form) --- */}
            <div className="w-full lg:w-1/2 flex items-center bg-white">
                <div className="mx-auto w-full max-w-lg p-8 sm:p-10 lg:p-12">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-2 text-red-600">
                            <span className="p-3 border border-red-200 rounded-full bg-red-50 shadow-md">
                                <BookOpen className='w-6 h-6'/>
                            </span>
                            <h1 className="text-3xl font-bold px-5 text-gray-900">Instructor Application</h1>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Submit your details in two steps for review.</p>
                    </div>
                    
                    {/* --- Step Indicator --- */}
                    <div className="flex justify-around items-center pt-2 pb-4 border-b">
                        <StepIndicator currentStep={step} stepNumber={1} label="Personal Info" />
                        <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: step >= 2 ? '#ef4444' : '#d1d5db' }} />
                        <StepIndicator currentStep={step} stepNumber={2} label="Account & Docs" />
                    </div>
                    
                    {/* Success/Error Messages */}
                    {error && (
                        <div className="p-3 mt-4 flex items-center text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="p-3 mt-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-300" role="alert">
                            <span className="font-medium">Success!</span> {success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6 mt-6">
                        
                        {/* --- STEP 1: PERSONAL DETAILS --- */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center"><User className='w-5 h-5 mr-2 text-red-600'/> Personal Details</h2>

                                {/* NAME FIELDS */}
                                <div className="grid grid-cols-3 gap-4">
                                    <InputWithIcon label="First Name" id="firstName" type="text" value={firstName} 
                                        // The component's internal handler now correctly asserts the type
                                        onChange={(e) => setFirstName(e.target.value)} icon={User} placeholder="John" />
                                    <InputWithIcon label="M.I" id="middleInitial" type="text" value={middleInitial} 
                                        onChange={(e) => setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())} 
                                        icon={User} placeholder="D" required={false}/>
                                    <InputWithIcon label="Last Name" id="lastName" type="text" value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} icon={User} placeholder="Doe" />
                                </div>
                                
                                {/* Middle Initial (Single Row) */}
                                
                                {/* CONTACT & DOB */}
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithIcon label="Date of Birth" id="dateOfBirth" type="date" value={dateOfBirth} 
                                        onChange={(e) => setDateOfBirth(e.target.value)} icon={Calendar} />
                                    <InputWithIcon label="Phone Number" id="phoneNumber" type="tel" value={phoneNumber} 
                                        onChange={(e) => setPhoneNumber(e.target.value)} icon={Phone} placeholder="09xx-xxx-xxxx" />
                                </div>

                                {/* ADDRESS */}
                                <InputWithIcon label="Residential Address" id="address" type="textarea" value={address} 
                                    onChange={(e) => setAddress(e.target.value)} icon={Building} 
                                    placeholder="Full address (Street, City, Province)" />

                                {/* Next Step Button */}
                                <button 
                                    type="button" 
                                    onClick={handleNextStep}
                                    disabled={!isStepOneValid()}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition duration-150 ease-in-out ${
                                        isStepOneValid() 
                                        ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                        : 'bg-red-400 cursor-not-allowed'
                                    }`}
                                >
                                    Next: Account Details <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        )}
                        
                        {/* --- STEP 2: ACCOUNT & DOCUMENTS --- */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center"><ListChecks className='w-5 h-5 mr-2 text-red-600'/> Account & Documents</h2>

                                {/* FILE UPLOAD */}
                                <FileInput 
                                    label="Upload Professional Resume/CV (PDF/DOCX)" id="resumeFile" 
                                    onChange={setResumeFile} icon={FileText} 
                                />

                                {/* EMAIL */}
                                <InputWithIcon label="Email Address" id="email" type="email" value={email} 
                                    onChange={(e) => setEmail(e.target.value)} icon={Mail} placeholder="you@example.com" />

                                {/* PASSWORD FIELDS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithIcon label="Password" id="password" type="password" value={password} 
                                        onChange={(e) => setPassword(e.target.value)} icon={Lock} placeholder="••••••••" />
                                    <InputWithIcon label="Confirm Password" id="passwordConfirmation" type="password" value={passwordConfirmation} 
                                        onChange={(e) => setPasswordConfirmation(e.target.value)} icon={Lock} placeholder="••••••••" />
                                </div>

                                {/* Back and Submit Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out"
                                    >
                                        Back
                                    </button>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading || !isStepTwoValid()}
                                        className={`w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition duration-150 ease-in-out ${
                                            isLoading || !isStepTwoValid()
                                            ? 'bg-red-400 cursor-not-allowed' 
                                            : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting Application...
                                            </>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Links */}
                        <div className="pt-4 border-t">
                            <p className="mt-4 text-center text-sm text-gray-600">
                                Already have an account?
                                <Link to="/login" className="ml-1 font-medium text-red-600 hover:text-red-500 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Or register as a standard learner?
                                <Link to="/register" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                                    Learner Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterInstructor;