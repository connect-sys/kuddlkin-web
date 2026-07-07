import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Smartphone, Shield, Clock, CheckCircle, AlertCircle, Users, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import kuddlLogoFull from '../../assets/images/kuddl-logo-full.svg';
import { useDebouncedCallback } from '../../hooks/useDebounce';

const MobileVerification: React.FC = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, isLoading } = useAuth();

  // Check if coming from login page with mode=login in URL
  const searchParams = new URLSearchParams(window.location.search);
  const isLoginMode = searchParams.get('mode') === 'login';

  const [mode] = useState<'login' | 'signup'>(isLoginMode ? 'login' : 'signup'); // Fixed mode based on URL
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken'
  }>({ status: 'idle' });

  // Phone number validation
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Debounced phone number availability check (only for signup mode)
  const checkPhoneAvailability = useDebouncedCallback(async (phone: string) => {
    if (mode === 'signup' && phone && validatePhoneNumber(phone)) {
      setPhoneStatus({ status: 'checking' });
      try {
        const fullPhoneNumber = `+91${phone}`;
        const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/check-phone?phone=${encodeURIComponent(fullPhoneNumber)}`);
        const data = await response.json();

        if (data.success) {
          setPhoneStatus({ status: data.available ? 'available' : 'taken' });
        } else {
          setPhoneStatus({ status: 'available' }); // Default to available if check fails
        }
      } catch (error) {
        console.error('Phone check error:', error);
        setPhoneStatus({ status: 'available' }); // Default to available if check fails
      }
    } else {
      setPhoneStatus({ status: 'idle' });
    }
  }, 500);

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // For signup mode, check if phone is already taken
    if (mode === 'signup' && phoneStatus.status === 'taken') {
      toast.error('Phone number is already registered. Please login instead.');
      return;
    }

    // For login mode, check if phone exists (opposite check)
    if (mode === 'login' && phoneStatus.status === 'available') {
      toast.error('Phone number not found. Please sign up first.');
      return;
    }

    const result = await sendOTP(phoneNumber);

    if (result.success) {
      setOtpSent(true);
      setStep('otp');
      setTestMode(result.testMode || false);
      startCountdown(60);

      if (result.testMode) {
        toast.success('Test mode: Use any 6-digit code');
      } else {
        toast.success('OTP sent successfully!');
      }
    } else {
      // If rate limited, set a longer cooldown
      if (result.message?.includes('Too many')) {
        startCountdown(300);
      }
      toast.error(result.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const result = await verifyOTP(phoneNumber, otp);

    if (result.success) {
      toast.success('Welcome to Kuddl!');

      // Check if user profile is complete
      if (result.user?.profileComplete) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard'); // Will show profile completion modal
      }
    } else {
      toast.error(result.message);
      setOtp(''); // Clear OTP on failure
    }
  };

  const startCountdown = (seconds: number = 60) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    const result = await sendOTP(phoneNumber);
    if (result.success) {
      startCountdown(60);
      toast.success('OTP resent successfully!');
    } else {
      if (result.message?.includes('Too many')) {
        startCountdown(300);
      }
      toast.error(result.message);
    }
  };

  const handleOtpInputChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-slide-in-up">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex bg-gray-50 p-12 flex-col justify-center relative overflow-hidden animate-fade-in-down">
          <div className="flex flex-col justify-between w-full">
            <div>
              <div className="mb-8">
                <img
                  src={kuddlLogoFull}
                  alt="Kuddl"
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/')}
                />
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl font-bold leading-tight text-gray-900">
                  {step === 'phone' ? (
                    <>
                      {mode === 'login' ? (
                        <>
                          Welcome Back to
                          <br />
                          <span className="text-[#578f82]">Kuddl</span>
                        </>
                      ) : (
                        <>
                          Join Our
                          <br />
                          <span className="text-[#578f82]">Partner Community</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-[#578f82]">Almost There!</span>
                      <br />
                      Verify Your Number
                    </>
                  )}
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  {step === 'phone'
                    ? mode === 'login'
                      ? 'Sign in to your account using your mobile number.'
                      : 'Start your journey with Kuddl and connect with families who need your services.'
                    : 'Enter the verification code we sent to your phone to complete your registration.'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Growing Community</h3>
                  <p className="text-sm text-gray-600">Join thousands of trusted service providers</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-[#cf956d] rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quality First</h3>
                  <p className="text-sm text-gray-600">Build your reputation with verified reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white animate-fade-in-up">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-none animate-scale-in">
              <CardHeader className="space-y-1 pb-8">
                <div className="flex lg:hidden items-center justify-center mb-6">
                  <img
                    src={kuddlLogoFull}
                    alt="Kuddl"
                    className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                  />
                </div>
                <CardTitle className="text-3xl font-bold text-center text-gray-900">
                  {step === 'phone' ? (mode === 'login' ? 'Welcome Back' : 'Get Started') : 'Verify Code'}
                </CardTitle>
                <p className="text-center text-gray-600">
                  {step === 'phone'
                    ? mode === 'login'
                      ? 'Enter your mobile number to login to your account'
                      : 'Enter your mobile number to create your partner account'
                    : 'Enter the 6-digit code sent to your phone'
                  }
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {step === 'phone' ? (
                  <>
                    {/* Phone Number Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mobile Number</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                          +91
                        </div>
                        <Input
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={phoneNumber}
                          onChange={(e) => {
                            const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhoneNumber(phone);
                            checkPhoneAvailability(phone);
                          }}
                          className="pl-12 text-lg tracking-wider"
                          maxLength={10}
                        />
                      </div>
                      {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                        <p className="text-destructive text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Please enter a valid 10-digit mobile number
                        </p>
                      )}
                      {phoneStatus.status === 'checking' && (
                        <p className="text-blue-600 text-sm">Checking availability...</p>
                      )}
                      {mode === 'signup' && phoneStatus.status === 'available' && validatePhoneNumber(phoneNumber) && (
                        <p className="text-green-600 text-sm">✓ Phone number is available</p>
                      )}
                      {mode === 'signup' && phoneStatus.status === 'taken' && (
                        <p className="text-red-600 text-sm">✗ Phone number is already registered. Please login instead.</p>
                      )}
                      {mode === 'login' && phoneStatus.status === 'taken' && validatePhoneNumber(phoneNumber) && (
                        <p className="text-green-600 text-sm">✓ Phone number found</p>
                      )}
                      {mode === 'login' && phoneStatus.status === 'available' && (
                        <p className="text-red-600 text-sm">✗ Phone number not found. Please sign up first.</p>
                      )}
                    </div>

                    {/* Send OTP Button */}
                    <Button
                      onClick={handleSendOTP}
                      disabled={
                        !validatePhoneNumber(phoneNumber) ||
                        isLoading ||
                        phoneStatus.status === 'checking' ||
                        (mode === 'signup' && phoneStatus.status === 'taken') ||
                        (mode === 'login' && phoneStatus.status === 'available')
                      }
                      className="w-full h-11 text-base font-medium bg-[#cf956d] hover:bg-[#b8845f] text-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send Verification Code'
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Phone Number Display */}
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Code sent to</p>
                      <p className="font-semibold">+91 {phoneNumber}</p>
                      <button
                        onClick={() => setStep('phone')}
                        className="text-primary hover:text-primary/80 text-sm font-medium mt-1"
                      >
                        Change number
                      </button>
                    </div>

                    {/* Test Mode Notice */}
                    {testMode && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-blue-800 font-medium text-sm">Test Mode Active</p>
                            <p className="text-blue-600 text-xs">Use any 6-digit code for testing</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OTP Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Verification Code</label>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => handleOtpInputChange(e.target.value)}
                        className="text-center text-2xl tracking-[0.5em] font-mono"
                        maxLength={6}
                      />
                    </div>

                    {/* Verify Button */}
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || isLoading}
                      className="w-full h-11 text-base font-medium bg-[#cf956d] hover:bg-[#b8845f] text-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify & Continue'
                      )}
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-muted-foreground text-sm flex items-center justify-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Resend code in {countdown >= 60 ? `${Math.floor(countdown / 60)}m ${countdown % 60}s` : `${countdown}s`}
                        </p>
                      ) : (
                        <button
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="text-primary hover:text-primary/80 font-medium text-sm"
                        >
                          Resend verification code
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-6">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">Secure & Private</p>
                      <p className="text-green-600 text-xs">
                        Your phone number is encrypted and never shared with third parties.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground text-sm">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-primary hover:text-primary/80 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary hover:text-primary/80 font-medium">
                      Privacy Policy.
                    </a>
                  </p>
                  {step === 'phone' && (
                    <p className="text-sm text-gray-600">
                      {mode === 'login' ? (
                        <>
                          Don't have an account?{' '}
                          <a href="/mobile-verification" className="text-[#578f82] hover:text-[#4a7c70] font-semibold">
                            Sign Up
                          </a>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <a href="/login" className="text-[#578f82] hover:text-[#4a7c70] font-semibold">
                            Login
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileVerification;
