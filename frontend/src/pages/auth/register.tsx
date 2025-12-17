  import React, { useState, useEffect } from 'react';
  import { useAuth } from "../../contexts/AuthContext";
  import { Link } from 'react-router-dom';
  import MonkeyPNG from '../../assets/monkey.png';
  import { toast } from 'react-toastify';
  import { 
      FaBook, 
      FaUser, 
      FaLock, 
      FaEnvelope, 
      FaCalendarDay, 
      FaPhone,  
      FaBuilding,
  } from 'react-icons/fa6';

  // Reusable Input Component
  interface InputWithIconProps {
      label: string; 
      id: string; 
      type: string; 
      value: string; 
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; 
      icon: React.ElementType; 
      placeholder?: string;
      required?: boolean;
  }
  const InputWithIcon: React.FC<InputWithIconProps> = ({ 
      label, id, type, value, onChange, icon: Icon, placeholder = '', required = true 
  }) => (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Icon className='w-4 h-4' />
              </div>
              {type === 'textarea' ? (
                  <textarea
                      id={id}
                      value={value}
                      onChange={onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
                      required={required}
                      rows={3}
                      placeholder={placeholder}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                  />
              ) : (
                  <input
                      id={id}
                      type={type}
                      value={value}
                      onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                      required={required}
                      placeholder={placeholder}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                  />
              )}
          </div>
      </label>
  );

  const Register: React.FC = () => {
    // Registration fields
    const [firstName, setFirstName] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const { register } = useAuth(); 
    const [error, setError] = useState('');

    // Email verification state
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [timer, setTimer] = useState(0);

    // Handle email verification code
    const handleSubmitForCode = async () => {
      if (!email) {
        setError("Please enter your email first.");
        return;
      }

      setIsSendingCode(true);
      setTimer(60); // 60-second cooldown

      try {
        const res = await fetch("http://localhost:8000/api/send-email-verification-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (!res.ok) {
          const text = await res.text();
          setError(data.message || "Failed to send verification code.");
          setIsSendingCode(false);
          return;
        }

        toast.success("Verification code sent to your Gmail!");
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Try again.");
        setIsSendingCode(false);
      }
    };

    // Timer effect
    useEffect(() => {
      let interval: number;
      if (timer > 0) {
        interval = setInterval(() => setTimer(t => t - 1), 1000);
      } else {
        setIsSendingCode(false);
      }
      return () => clearInterval(interval);
    }, [timer]);

    // Registration form submission
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

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
            });
            // Redirect or success handling
        } catch (err) {
            console.error('Registration failed', err);
            setError('Registration failed. Please check your details and try again.');
        }
    };

    return (
      <div className="min-h-screen flex">
        {/* Branding Column */}
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

        {/* Registration Form Column */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
          <div className="mx-auto w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-2 text-indigo-600">
                <span className="px-3"><FaBook className='w-6 h-6'/></span>
                <h1 className="text-3xl font-bold text-gray-900">Learner Registration</h1>
              </div>
              <p className="text-md text-gray-500">Sign up to begin your learning journey.</p>
            </div>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">

              {/* Name Fields */}
              <div className="grid grid-cols-3 gap-4">
                  <InputWithIcon label="First Name" id="firstName" type="text" value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} icon={FaUser} placeholder="John"/>
                  <InputWithIcon label="M.I." id="middleInitial" type="text" value={middleInitial} 
                                onChange={(e) => setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())} 
                                icon={FaUser} placeholder="D" required={false}/>
                  <InputWithIcon label="Last Name" id="lastName" type="text" value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} icon={FaUser} placeholder="Doe"/>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                  <InputWithIcon label="Email" id="email" type="email" value={email} 
                                onChange={(e) => setEmail(e.target.value)} icon={FaEnvelope} placeholder="you@example.com"/>
                  <InputWithIcon label="Phone Number" id="phoneNumber" type="tel" value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)} icon={FaPhone} placeholder="09xx-xxx-xxxx"/>
              </div>

              {/* Date of Birth */}
              <InputWithIcon label="Date of Birth" id="dateOfBirth" type="date" value={dateOfBirth} 
                            onChange={(e) => setDateOfBirth(e.target.value)} icon={FaCalendarDay}/>

              {/* Address */}
              <InputWithIcon label="Address" id="address" type="textarea" value={address} 
                            onChange={(e) => setAddress(e.target.value)} icon={FaBuilding} placeholder="Full address"/>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                  <InputWithIcon label="Password" id="password" type="password" value={password} 
                                onChange={(e) => setPassword(e.target.value)} icon={FaLock} placeholder="••••••••"/>
                  <InputWithIcon label="Confirm Password" id="passwordConfirmation" type="password" value={passwordConfirmation} 
                                onChange={(e) => setPasswordConfirmation(e.target.value)} icon={FaLock} placeholder="••••••••"/>
              </div>

              {/* Email Verification */}
              <div className="space-y-6">
                {/* <div className="px-0">
                    <InputWithIcon 
                        label="Verify Email" 
                        id="verifyEmail" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        icon={FaEnvelope} 
                        placeholder="you@example.com"
                    />
                </div> */}
                <div className="flex items-end gap-3 px-0">
                    <div className="flex-grow">
                        <InputWithIcon
                            label="Verification Code"
                            id="verificationCode"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            icon={FaLock} 
                            placeholder="Enter the 6-digit code"
                            required={true}
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handleSubmitForCode}
                        disabled={isSendingCode}
                        className={`h-[42px] px-6 rounded-md shadow-sm text-sm font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap
                            ${isSendingCode 
                                ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'}`
                        }
                    >
                        {isSendingCode ? `Send again in ${timer}s` : "Send Code"}
                    </button>
                </div>
            </div>

              {/* Submit Button */}
              <div>
                <button type="submit" 
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                  Sign up
                </button>
              </div>

              {/* Login Link */}
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account? 
                <Link to="/login" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                  Sign in
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    );
  };

  export default Register;
