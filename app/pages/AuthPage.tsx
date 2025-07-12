import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toaster';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const { toast } = useToast();
  const { login, register, verifyOTP, resendOTP } = useAuth();

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [otpForm, setOtpForm] = useState({
    otp: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast({ title: 'Success', description: 'Logged in successfully!', variant: 'success' });
    } catch (error) {
      toast({ 
        title: 'Login Failed', 
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.email || !registerForm.firstName || !registerForm.lastName || !registerForm.password) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (registerForm.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await register({
        email: registerForm.email,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        phone: registerForm.phone || undefined,
        password: registerForm.password,
      });
      
      setPendingEmail(registerForm.email);
      setMode('verify');
      toast({ 
        title: 'Registration Successful', 
        description: 'Please check your email for the OTP code',
        variant: 'success' 
      });
    } catch (error) {
      toast({ 
        title: 'Registration Failed', 
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpForm.otp || otpForm.otp.length !== 6) {
      toast({ title: 'Error', description: 'Please enter a valid 6-digit OTP', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(pendingEmail, otpForm.otp);
      toast({ title: 'Success', description: 'Email verified successfully!', variant: 'success' });
    } catch (error) {
      toast({ 
        title: 'Verification Failed', 
        description: error instanceof Error ? error.message : 'Invalid or expired OTP',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await resendOTP(pendingEmail);
      toast({ title: 'Success', description: 'OTP sent successfully!', variant: 'success' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to resend OTP',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold gradient-brand bg-clip-text text-transparent">
                FoodieExpress
              </h1>
              <p className="text-gray-600 mt-2">
                {mode === 'login' && 'Welcome back! Please sign in to your account'}
                {mode === 'register' && 'Create your account to get started'}
                {mode === 'verify' && 'Please verify your email address'}
              </p>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}

            {mode === 'verify' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a 6-digit verification code to<br />
                    <span className="font-medium">{pendingEmail}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm({ otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpForm.otp.length !== 6}
                  className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back to registration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-red-600 items-center justify-center text-white p-12">
        <div className="max-w-lg text-center">
          <h2 className="text-5xl font-bold mb-6">
            Delicious Food<br />Delivered Fast
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Order from your favorite restaurants and get fresh, hot meals delivered right to your door.
          </p>
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm opacity-75">Restaurants</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm opacity-75">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">30min</div>
              <div className="text-sm opacity-75">Average Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-75">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}