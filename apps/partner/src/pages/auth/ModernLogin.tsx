import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Building2, Users, Shield, Smartphone, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import kuddlLogoFull from '../../assets/images/kuddl-logo-full.svg';
import { toast } from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

const ModernLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOTP, verifyOTP, isAuthenticated, user, isLoading, setWorkerSession } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('otp'); // Default to OTP login
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // OTP Login States
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'mpin' | 'worker_password'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpinValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [workerPassword, setWorkerPassword] = useState('');
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'partner':
        return '/dashboard';
      case 'service_worker':
        return '/worker/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = location.state?.from?.pathname || getDashboardRoute(user.role);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        const redirectTo = location.state?.from?.pathname || getDashboardRoute(result.user?.role || 'partner');
        navigate(redirectTo, { replace: true });
      } else {
        // Check if error is about missing password
        if (result.message && result.message.includes('No password set')) {
          setError('No password set for this account. Please use Phone OTP login or set a password first.');
          toast.error('Please use Phone OTP login', { duration: 4000 });
        } else {
          setError(result.message || 'Login failed');
          toast.error(result.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // First check if this phone belongs to a service worker
      const checkRes = await fetch(`${API_BASE_URL}/api/service-workers/check?phone=${encodeURIComponent(phoneNumber)}`);
      const checkData = await checkRes.json();

      if (checkData.is_service_worker) {
        // Switch to worker password flow instead of OTP
        setOtpStep('worker_password');
        setIsSubmitting(false);
        return;
      }

      // Check if partner has MPIN set
      const mpinCheckRes = await fetch(`${API_BASE_URL}/api/auth/mpin/status?phone=${encodeURIComponent(phoneNumber)}&role=partner`);
      const mpinData = await mpinCheckRes.json();
      
      if (mpinData.success && mpinData.hasMpin && !mpinData.locked) {
        setOtpStep('mpin');
        setIsSubmitting(false);
        return;
      }

      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setOtpStep('otp');
        setCountdown(60);
        toast.success('OTP sent successfully!');
      } else {
        setError(result.message || 'Failed to send OTP');
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMpin = async () => {
    if (!/^\d{4,6}$/.test(mpin)) {
      setError('Enter a valid MPIN');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/mpin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, mpin }),
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        const redirectTo = location.state?.from?.pathname || getDashboardRoute('partner');
        navigate(redirectTo, { replace: true });
      } else {
        const msg = data.message || 'Login failed';
        const attemptsMsg = typeof data.attemptsLeft === 'number' ? ` (${data.attemptsLeft} tries left)` : '';
        setError(msg + attemptsMsg);
        toast.error(msg + attemptsMsg);
        setMpinValue('');
      }
    } catch (error) {
      console.error('MPIN login error:', error);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToOtp = async () => {
    setIsSubmitting(true);
    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setOtpStep('otp');
        setCountdown(60);
        toast.success('OTP sent successfully!');
      } else {
        setError(result.message || 'Failed to send OTP');
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkerPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerPassword.trim()) {
      setError('Please enter your password');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/service-workers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, username: phoneNumber, email: phoneNumber, password: workerPassword })
      });
      const data = await res.json();
      if (data.success) {
        const workerUser = data.worker || data.user;
        setWorkerSession(workerUser, data.token);
        toast.success(`Welcome, ${workerUser?.full_name || 'Worker'}!`);
        navigate('/worker/dashboard', { replace: true });
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success) {
        toast.success('Phone verified successfully!');
        const redirectTo = location.state?.from?.pathname || getDashboardRoute(result.user?.role || 'partner');
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.message || 'Invalid OTP');
        toast.error(result.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('OTP verification failed. Please try again.');
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setCountdown(60);
        toast.success('OTP resent successfully!');
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-slide-in-up min-h-[600px]">
          <div className="hidden lg:flex bg-[#faf8f5] p-12 flex-col justify-center relative overflow-hidden animate-fade-in-down border-r border-gray-100">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-8 w-32"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-slide-in-up min-h-[600px]">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex bg-[#faf8f5] p-12 flex-col justify-between relative overflow-hidden animate-fade-in-down border-r border-gray-100">
          <div>
            <div className="mb-12">
              <img 
                src={kuddlLogoFull} 
                alt="Kuddl" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900 tracking-tight">
                Welcome to Your
                <br />
                <span className="text-[#578f82]">Partner Portal</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md leading-relaxed">
                Manage your services, track bookings, and grow your business with our comprehensive platform.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center space-x-4 text-gray-700 bg-white/50 p-3 rounded-xl border border-white">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Building2 className="w-5 h-5 text-[#578f82]" />
              </div>
              <span className="font-medium">Professional Service Management</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-700 bg-white/50 p-3 rounded-xl border border-white">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Users className="w-5 h-5 text-[#578f82]" />
              </div>
              <span className="font-medium">Customer Relationship Tools</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-700 bg-white/50 p-3 rounded-xl border border-white">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Shield className="w-5 h-5 text-[#578f82]" />
              </div>
              <span className="font-medium">Secure & Reliable Platform</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex items-center justify-center p-4 sm:p-8 md:p-12 animate-fade-in-up bg-white">
          <div className="w-full max-w-[400px]">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 px-0 sm:px-6">
                <div className="lg:hidden text-center mb-2 sm:mb-4">
                  <img 
                    src={kuddlLogoFull} 
                    alt="Kuddl" 
                    className="h-8 sm:h-10 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                  />
                </div>
                <CardTitle className="text-xl sm:text-3xl font-bold text-center text-gray-900 tracking-tight">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-center text-gray-500 text-xs sm:text-base">
                  Access your partner dashboard and manage your services
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <form className="space-y-4 sm:space-y-6">
                  {/* Login Method Toggle */}
                  <div className="flex bg-[#faf8f5] rounded-xl p-1 border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className={`flex-1 py-2 sm:py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                        loginMethod === 'otp'
                          ? 'bg-white text-[#578f82] shadow-sm border border-gray-100'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Phone OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 py-2 sm:py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                        loginMethod === 'email'
                          ? 'bg-white text-[#578f82] shadow-sm border border-gray-100'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Email
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-red-600 text-xs sm:text-sm font-medium">{error}</p>
                    </div>
                  )}

                  {/* Email Login Form */}
                  {loginMethod === 'email' && (
                    <>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 sm:pl-11 h-11 sm:h-14 rounded-xl border-gray-200 focus:border-[#578f82] focus:ring-[#578f82] bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                              placeholder="Enter your email"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-14 rounded-xl border-gray-200 focus:border-[#578f82] focus:ring-[#578f82] bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                              placeholder="Enter your password"
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleEmailLogin}
                        disabled={isSubmitting}
                        className="w-full h-11 sm:h-14 rounded-xl text-sm sm:text-base font-bold bg-[#cf956d] hover:bg-[#b8845f] text-white shadow-md hover:shadow-lg transition-all"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </>
                  )}

                  {/* OTP Login Form */}
                  {loginMethod === 'otp' && (
                    <>
                      {otpStep === 'phone' && (
                        <div className="space-y-4 sm:space-y-6">
                          <div>
                            <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Smartphone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="pl-10 sm:pl-11 h-11 sm:h-14 rounded-xl border-gray-200 focus:border-[#578f82] focus:ring-[#578f82] bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                                placeholder="+91 98765 43210"
                                disabled={isSubmitting}
                              />
                            </div>
                            <p className="text-[11px] sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
                              We'll send you a verification code via SMS
                            </p>
                          </div>

                          <Button
                            onClick={handleSendOTP}
                            disabled={isSubmitting || !phoneNumber.trim()}
                            className="w-full h-11 sm:h-14 rounded-xl text-sm sm:text-base font-bold bg-[#cf956d] hover:bg-[#b8845f] text-white shadow-md hover:shadow-lg transition-all"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                <span>Sending OTP...</span>
                              </div>
                            ) : (
                              'Send Verification Code'
                            )}
                          </Button>
                        </div>
                      )}

                      {otpStep === 'mpin' && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-start gap-2">
                            <Lock className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-teal-800 font-semibold text-xs sm:text-sm">MPIN Login</p>
                              <p className="text-teal-600 text-[11px] sm:text-xs mt-0.5">Enter your 4-6 digit MPIN to login quickly</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                              Enter MPIN
                            </label>
                            <Input
                              type="password"
                              inputMode="numeric"
                              pattern="\d*"
                              maxLength={6}
                              value={mpin}
                              onChange={(e) => setMpinValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="h-11 sm:h-14 rounded-xl text-center text-2xl sm:text-3xl tracking-[0.5em] border-gray-200 focus:border-[#578f82] focus:ring-[#578f82] bg-gray-50 focus:bg-white transition-colors font-bold text-gray-900"
                              placeholder="••••"
                              disabled={isSubmitting}
                              autoFocus
                            />
                          </div>
                          <Button
                            onClick={handleVerifyMpin}
                            disabled={!/^\d{4,6}$/.test(mpin) || isSubmitting}
                            className="w-full h-11 sm:h-14 rounded-xl text-sm sm:text-base font-bold bg-[#cf956d] hover:bg-[#b8845f] text-white shadow-md transition-all"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Verifying...</span>
                              </div>
                            ) : 'Login with MPIN'}
                          </Button>
                          <button
                            type="button"
                            onClick={switchToOtp}
                            disabled={isSubmitting}
                            className="w-full text-xs sm:text-sm text-[#578f82] hover:text-[#4a7c70] font-medium text-center"
                          >
                            Use OTP instead
                          </button>
                          <button
                            type="button"
                            onClick={() => { setOtpStep('phone'); setMpinValue(''); setError(''); }}
                            className="w-full text-xs sm:text-sm text-gray-500 hover:text-gray-700 text-center"
                          >
                            ← Back
                          </button>
                        </div>
                      )}

                      {otpStep === 'worker_password' && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
                            <Users className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-indigo-800 font-semibold text-xs sm:text-sm">Staff Member Detected</p>
                              <p className="text-indigo-600 text-[11px] sm:text-xs mt-0.5">Enter your password to continue to the staff dashboard</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                              <Input
                                type={showWorkerPassword ? 'text' : 'password'}
                                value={workerPassword}
                                onChange={(e) => setWorkerPassword(e.target.value)}
                                className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-14 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                                placeholder="Enter your password"
                                disabled={isSubmitting}
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => setShowWorkerPassword(!showWorkerPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                              >
                                {showWorkerPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                              </button>
                            </div>
                          </div>
                          <Button
                            onClick={handleWorkerPasswordLogin}
                            disabled={isSubmitting || !workerPassword.trim()}
                            className="w-full h-11 sm:h-14 rounded-xl text-sm sm:text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Signing in...</span>
                              </div>
                            ) : 'Sign In as Staff'}
                          </Button>
                          <button
                            type="button"
                            onClick={() => { setOtpStep('phone'); setWorkerPassword(''); setError(''); }}
                            className="w-full text-xs sm:text-sm text-gray-500 hover:text-gray-700 text-center"
                          >
                            ← Back
                          </button>
                        </div>
                      )}

                      {otpStep === 'otp' && (
                        <div className="space-y-4 sm:space-y-6">
                          <div>
                            <label htmlFor="otp" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                              Verification Code
                            </label>
                            <Input
                              id="otp"
                              name="otp"
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="h-11 sm:h-14 rounded-xl text-center text-lg sm:text-2xl tracking-[0.3em] sm:tracking-[0.75em] border-gray-200 focus:border-[#578f82] focus:ring-[#578f82] bg-gray-50 focus:bg-white transition-colors font-bold text-gray-900"
                              placeholder="000000"
                              maxLength={6}
                              disabled={isSubmitting}
                            />
                            <p className="text-[11px] sm:text-sm text-gray-500 mt-1.5 sm:mt-2 text-center">
                              Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{phoneNumber}</span>
                            </p>
                          </div>

                          <Button
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || isSubmitting}
                            className="w-full h-11 sm:h-14 rounded-xl text-sm sm:text-base font-bold bg-[#cf956d] hover:bg-[#b8845f] text-white shadow-md hover:shadow-lg transition-all"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                <span>Verifying...</span>
                              </div>
                            ) : (
                              'Verify & Continue'
                            )}
                          </Button>

                          <div className="text-center mt-3 sm:mt-4">
                            {countdown > 0 ? (
                              <p className="text-gray-600 text-xs sm:text-sm flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                Resend code in {countdown}s
                              </p>
                            ) : (
                              <button
                                onClick={handleResendOTP}
                                disabled={isSubmitting}
                                className="text-[#578f82] hover:text-[#4a7c70] font-medium text-xs sm:text-sm"
                              >
                                Resend verification code
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Security Notice */}
                  <div className="bg-green-50/50 sm:bg-green-50 border border-green-100 sm:border-green-200 rounded-xl p-3">
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-medium text-xs sm:text-sm">Secure & Private</p>
                        <p className="text-green-600 text-[10px] sm:text-xs mt-0.5">
                          Your information is encrypted and never shared
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-2 pt-2">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/mobile-verification')}
                        className="text-[#578f82] hover:text-[#4a7c70] font-semibold"
                      >
                        Join as a Partner
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
