import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  setupRecaptcha,
  sendOTP,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  Globe,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Loader2,
} from 'lucide-react';

const LOGIN_TRANSLATIONS = {
  English: {
    welcome: 'Welcome to VYOMIK',
    tagline: 'Rural Micro-Enterprise Intelligence Platform',
    ruralPower: 'Powering Rural Bharat\'s Entrepreneurs',
    selectLanguage: 'Preferred Language / भाषा पसंद',
    googleBtn: 'Continue with Google',
    emailTab: 'Email & Password',
    phoneTab: 'Phone & OTP',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    emailPlaceholder: 'e.g. kisan@gmail.com',
    passwordPlaceholder: 'Enter password',
    showPassword: 'Show',
    hidePassword: 'Hide',
    loginBtn: 'Sign In',
    signupBtn: 'Create Account',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account? Create Account",
    haveAccount: 'Already have an account? Sign In',
    phoneLabel: 'Mobile Number',
    phonePlaceholder: 'e.g. 9876543210',
    sendOtpBtn: 'Send OTP (ओटीपी भेजें)',
    enterOtpLabel: 'Enter 6-Digit Verification Code',
    verifyOtpBtn: 'Verify Code & Sign In',
    resendOtp: 'Resend OTP',
    resendIn: 'Resend in',
    seconds: 'seconds',
    submitting: 'Processing...',
    successLogin: 'Successfully signed in! Redirecting...',
    successSignup: 'Account created successfully!',
    successOtpSent: 'Verification code sent to your phone!',
    errorInvalidEmail: 'Please enter a valid email address.',
    errorPasswordLength: 'Password must be at least 6 characters.',
    errorInvalidPhone: 'Please enter a valid 10-digit mobile number.',
    errorInvalidOtp: 'Verification code must be 6 digits.',
    offlineNotice: 'Running in Offline / Demo Mode. Real Firebase configuration is absent, so mock login credentials will pass.',
    motto: 'Make in Rural India • Empowering Villages',
  },
  'हिंदी': {
    welcome: 'व्योमिक में आपका स्वागत है',
    tagline: 'ग्रामीण सूक्ष्म-उद्यम बुद्धिमत्ता मंच',
    ruralPower: 'ग्रामीण भारत के उद्यमियों को सशक्त बनाना',
    selectLanguage: 'भाषा पसंद / Preferred Language',
    googleBtn: 'गूगल (Google) के साथ आगे बढ़ें',
    emailTab: 'ईमेल और पासवर्ड',
    phoneTab: 'फ़ोन और ओटीपी',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    emailPlaceholder: 'उदा. kisan@gmail.com',
    passwordPlaceholder: 'पासवर्ड दर्ज करें',
    showPassword: 'दिखाएं',
    hidePassword: 'छिपाएं',
    loginBtn: 'साइन इन करें',
    signupBtn: 'नया खाता बनाएं',
    forgotPassword: 'पासवर्ड भूल गए?',
    noAccount: 'खाता नहीं है? नया खाता बनाएं',
    haveAccount: 'पहले से खाता है? साइन इन करें',
    phoneLabel: 'मोबाइल नंबर',
    phonePlaceholder: 'उदा. 9876543210',
    sendOtpBtn: 'ओटीपी भेजें',
    enterOtpLabel: '6-अंकीय सत्यापन कोड दर्ज करें',
    verifyOtpBtn: 'कोड सत्यापित करें और साइन इन करें',
    resendOtp: 'ओटीपी दोबारा भेजें',
    resendIn: 'दोबारा भेजें',
    seconds: 'सेकंड में',
    submitting: 'प्रक्रिया जारी है...',
    successLogin: 'सफलतापूर्वक साइन इन किया गया! रीडायरेक्ट हो रहा है...',
    successSignup: 'नया खाता सफलतापूर्वक बनाया गया!',
    successOtpSent: 'सत्यापन कोड आपके फ़ोन पर भेज दिया गया है!',
    errorInvalidEmail: 'कृपया एक वैध ईमेल पता दर्ज करें।',
    errorPasswordLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    errorInvalidPhone: 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
    errorInvalidOtp: 'सत्यापन कोड 6 अंकों का होना चाहिए।',
    offlineNotice: 'ऑफ़लाइन / डेमो मोड में चल रहा है। फायरबेस अनुपस्थित है, इसलिए मॉक क्रेडेंशियल्स लॉगिन सफल होगा।',
    motto: 'ग्रामीण भारत का निर्माण • गांवों का सशक्तिकरण',
  },
  'मराठी': {
    welcome: 'व्योमिक मध्ये आपले स्वागत आहे',
    tagline: 'ग्रामीण सूक्ष्म-उद्योग बुद्धिमत्ता मंच',
    ruralPower: 'ग्रामीण भारताच्या उद्योजकांना सक्षम बनवणे',
    selectLanguage: 'भाषा निवडा / Preferred Language',
    googleBtn: 'गुगल (Google) सह पुढे जा',
    emailTab: 'ईमेल आणि पासवर्ड',
    phoneTab: 'फोन आणि ओटीपी',
    emailLabel: 'ईमेल पत्ता',
    passwordLabel: 'पासवर्ड',
    emailPlaceholder: 'उदा. kisan@gmail.com',
    passwordPlaceholder: 'पासवर्ड प्रविष्ट करा',
    showPassword: 'दाखवा',
    hidePassword: 'लपवा',
    loginBtn: 'साइन इन करा',
    signupBtn: 'नवीन खाते तयार करा',
    forgotPassword: 'पासवर्ड विसरलात?',
    noAccount: 'खाते नाही? नवीन खाते तयार करा',
    haveAccount: 'आधीच खाते आहे? साइन इन करा',
    phoneLabel: 'मोबाईल नंबर',
    phonePlaceholder: 'उदा. 9876543210',
    sendOtpBtn: 'ओटीपी पाठवा',
    enterOtpLabel: '६-अंकी पडताळणी कोड प्रविष्ट करा',
    verifyOtpBtn: 'कोड सत्यापित करा आणि साइन इन करा',
    resendOtp: 'ओटीपी पुन्हा पाठवा',
    resendIn: 'पुन्हा पाठवा',
    seconds: 'सेकंदात',
    submitting: 'प्रक्रिया सुरू आहे...',
    successLogin: 'यशस्वीरित्या साइन इन केले! पुढे जात आहे...',
    successSignup: 'नवीन खाते यशस्वीरित्या तयार केले गेले!',
    successOtpSent: 'पडताळणी कोड तुमच्या फोनवर पाठवला गेला आहे!',
    errorInvalidEmail: 'कृपया एक वैध ईमेल पत्ता प्रविष्ट करा.',
    errorPasswordLength: 'पासवर्ड किमान ६ अक्षरांचा असावा.',
    errorInvalidPhone: 'कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.',
    errorInvalidOtp: 'पडताळणी कोड ६ अंकी असावा.',
    offlineNotice: 'ऑफलाईन / डेमो मोड सुरू आहे. फायरबेस अनुपस्थित असल्याने मॉक लॉगिन क्रेडेंशियल्स यशस्वी होतील.',
    motto: 'ग्रामीण भारताची निर्मिती • गावांचे सक्षमीकरण',
  },
};

export const LoginPage: React.FC = () => {
  const { setUser } = useAuth();
  const { language, setLanguage } = useApp();

  // Selected language translations
  const currentLang = (language === 'हिंदी' || language === 'मराठी') ? language : 'English';
  const t = LOGIN_TRANSLATIONS[currentLang];

  // Tabs: 'email' | 'phone'
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('phone');
  
  // Email mode: 'signin' | 'signup'
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // OTP Countdown Timer
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  // Clean alerts when toggling forms
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [activeTab, emailMode]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      const result = await signInWithGoogle();
      setSuccessMessage(t.successLogin);
      setTimeout(() => {
        setUser(result.user);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Login Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Email Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Validation
    if (!email || !email.includes('@')) {
      setErrorMessage(t.errorInvalidEmail);
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage(t.errorPasswordLength);
      return;
    }

    setSubmitting(true);
    try {
      if (emailMode === 'signin') {
        const result = await loginWithEmail(email, password);
        setSuccessMessage(t.successLogin);
        setTimeout(() => {
          setUser(result.user);
        }, 1000);
      } else {
        const result = await registerWithEmail(email, password);
        setSuccessMessage(t.successSignup);
        // Automatically switch to signin mode or sign in immediately
        setTimeout(() => {
          setUser(result.user);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate 10-digit Indian phone number
    const phoneClean = phone.replace(/\s+/g, '');
    if (!/^\d{10}$/.test(phoneClean)) {
      setErrorMessage(t.errorInvalidPhone);
      return;
    }

    setSubmitting(true);
    try {
      const formattedPhone = `+91${phoneClean}`;
      
      let appVerifier = null;
      if (isFirebaseConfigured) {
        appVerifier = setupRecaptcha('recaptcha-container');
      }

      const confirmResult = await sendOTP(formattedPhone, appVerifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      setCountdown(30); // 30 seconds wait
      setSuccessMessage(t.successOtpSent);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otp || otp.length !== 6) {
      setErrorMessage(t.errorInvalidOtp);
      return;
    }

    setSubmitting(true);
    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otp);
        setSuccessMessage(t.successLogin);
        setTimeout(() => {
          setUser(result.user);
        }, 1000);
      } else {
        throw new Error('No OTP transaction active. Resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code entered.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password reset
  const handleForgotPassword = () => {
    setSuccessMessage('Password reset instructions sent (Demo mode simulated).');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#fbfaf7] p-4 sm:p-6 select-none overflow-hidden font-sans">
      
      {/* Dynamic Background Patterns */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-50/40 blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-50/30 blur-3xl -z-10"></div>

      {/* Recaptcha container for Phone Authentication */}
      <div id="recaptcha-container"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-900/10 shadow-2xl p-6 sm:p-8 space-y-6 relative transition-all duration-300">
        
        {/* Languages Switcher Segmented Button */}
        <div className="flex flex-col items-center gap-2 border-b border-stone-100 pb-4">
          <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            {t.selectLanguage}
          </span>
          <div className="flex items-center rounded-2xl bg-stone-100 p-1 w-full shadow-inner border border-stone-200">
            {['English', 'हिंदी', 'मराठी'].map((langOption) => (
              <button
                key={langOption}
                type="button"
                onClick={() => setLanguage(langOption)}
                className={`flex-1 rounded-xl py-2 text-xs font-black transition-all min-h-[40px] ${
                  language === langOption
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {langOption === 'English' ? 'EN' : langOption === 'हिंदी' ? 'हिन्दी' : 'मराठी'}
              </button>
            ))}
          </div>
        </div>

        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-400 font-black text-emerald-950 shadow-md transform hover:rotate-6 transition-transform">
            <span className="text-2xl tracking-wider">V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight leading-tight">
            {t.welcome}
          </h1>
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
            {t.ruralPower}
          </p>
          <p className="text-xs text-stone-500 max-w-[280px] mx-auto leading-relaxed font-medium">
            {t.tagline}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl border border-stone-200 hover:border-stone-300 transition-all active:scale-98 shadow-sm hover:shadow min-h-[48px]"
          >
            <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.9 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.5 8.9 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.8-.07-1.56-.2-2.3H12v4.4h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.41-4.94 3.41-8.55z"
              />
              <path
                fill="#FBBC05"
                d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.8 0 10.9 0 13s.54 4.2 1.5 6.1l3.86-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.1.74-2.52 1.19-4.26 1.19-3.1 0-5.73-2.46-6.66-5.46L1.48 15.9C3.38 19.75 7.33 23 12 23z"
              />
            </svg>
            <span>{t.googleBtn}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-between text-stone-400 text-xs py-1">
          <div className="w-[42%] h-[1px] bg-stone-200"></div>
          <span className="font-extrabold uppercase select-none tracking-wider">OR</span>
          <div className="w-[42%] h-[1px] bg-stone-200"></div>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-2xl bg-stone-100 p-1 border border-stone-200/50">
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              activeTab === 'phone'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-500 hover:text-stone-950'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>{t.phoneTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              activeTab === 'email'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-500 hover:text-stone-950'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>{t.emailTab}</span>
          </button>
        </div>

        {/* Dynamic Forms Area */}
        {activeTab === 'email' ? (
          /* Email Form */
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-stone-600 uppercase tracking-wide">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-[50%] translate-y-[-50%] h-5 w-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  disabled={submitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-11 pr-4 py-3.5 border border-stone-200 focus:border-emerald-600 rounded-2xl focus:ring-4 focus:ring-emerald-100 bg-stone-50/50 text-sm font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-stone-600 uppercase tracking-wide">
                  {t.passwordLabel}
                </label>
                {emailMode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-extrabold text-emerald-800 hover:underline"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-[50%] translate-y-[-50%] h-5 w-5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={submitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full pl-11 pr-16 py-3.5 border border-stone-200 focus:border-emerald-600 rounded-2xl focus:ring-4 focus:ring-emerald-100 bg-stone-50/50 text-sm font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[50%] translate-y-[-50%] text-xs font-extrabold text-emerald-800 hover:text-emerald-950 px-2 py-1 bg-stone-100 rounded-lg"
                >
                  {showPassword ? t.hidePassword : t.showPassword}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl transition-all active:scale-98 shadow-md shadow-emerald-900/10 min-h-[48px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <>
                  <span>{emailMode === 'signin' ? t.loginBtn : t.signupBtn}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            {/* Mode Switcher */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setEmailMode(emailMode === 'signin' ? 'signup' : 'signin')}
                disabled={submitting}
                className="text-xs font-bold text-stone-500 hover:text-emerald-800 transition-colors"
              >
                {emailMode === 'signin' ? t.noAccount : t.haveAccount}
              </button>
            </div>
          </form>
        ) : (
          /* Phone OTP Form */
          <div className="space-y-4">
            {!otpSent ? (
              /* Step 1: Input phone number */
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-stone-600 uppercase tracking-wide">
                    {t.phoneLabel}
                  </label>
                  <div className="relative flex rounded-2xl border border-stone-200 bg-stone-50/50 focus-within:ring-4 focus-within:ring-emerald-100 focus-within:border-emerald-600 overflow-hidden transition-all">
                    <span className="flex items-center justify-center bg-stone-100 text-stone-600 text-sm font-extrabold px-3.5 border-r border-stone-200 select-none">
                      🇮🇳 +91
                    </span>
                    <Smartphone className="absolute left-[85px] top-[50%] translate-y-[-50%] h-5 w-5 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      disabled={submitting}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder={t.phonePlaceholder}
                      className="w-full pl-11 pr-4 py-3.5 border-0 focus:ring-0 bg-transparent text-sm font-medium focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl transition-all active:scale-98 shadow-md shadow-emerald-900/10 min-h-[48px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.sendOtpBtn}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Input verification code */
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    {t.enterOtpLabel}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-[50%] translate-y-[-50%] h-5 w-5 text-stone-400" />
                    <input
                      type="text"
                      value={otp}
                      disabled={submitting}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 123456"
                      className="w-full pl-11 pr-4 py-3.5 border border-emerald-300 focus:border-emerald-600 rounded-2xl focus:ring-4 focus:ring-emerald-100 bg-emerald-50/20 text-center tracking-[0.5em] text-lg font-black transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl transition-all active:scale-98 shadow-md shadow-emerald-900/10 min-h-[48px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.verifyOtpBtn}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP Timer */}
                <div className="text-center text-xs text-stone-500 font-medium">
                  {countdown > 0 ? (
                    <span>
                      {t.resendIn} <strong className="text-emerald-800 font-bold">{countdown}</strong> {t.seconds}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={submitting}
                      className="font-extrabold text-emerald-800 hover:underline hover:text-emerald-950 transition-colors"
                    >
                      {t.resendOtp}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Offline notice */}
        {!isFirebaseConfigured && (
          <div className="bg-amber-50 text-amber-900 p-3 rounded-2xl border border-amber-200 text-[10px] leading-relaxed text-center font-semibold">
            {t.offlineNotice}
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 text-[10px] font-extrabold uppercase text-stone-400 tracking-wider">
          {t.motto}
        </div>
      </div>
    </div>
  );
};
