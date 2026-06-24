import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../api/AuthContext.jsx';
import { toast } from 'sonner';
import { GrTarget } from 'react-icons/gr';
import { FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { auth, googleProvider } from '../api/firebase.js';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  
  const { login, register, socialLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirectResult = async () => {
      let handled = false;
      try {
        const result = await getRedirectResult(auth);
        
        if (result) {
          // User has just been redirected back from the provider.
          handled = true;
          setIsSocialSubmitting(true);
          const user = result.user;
          const nameParts = user.displayName ? user.displayName.split(' ') : ['User'];
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          const res = await socialLogin({
            email: user.email,
            firstName,
            lastName,
            profilePicture: user.photoURL
          });

          if (res.token) {
            toast.success(`Welcome to TaskForge, ${firstName}! ✨`);
            navigate('/dashboard');
          } else {
            setError(res.message);
            setIsSocialSubmitting(false);
          }
        }
      } catch (err) {
        setError(err.message || "Authentication failed during redirect.");
        setIsSocialSubmitting(false);
      } finally {
        // In case getRedirectResult didn't return a result (some browsers block redirect state),
        // listen for auth state changes as a fallback.
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user || handled) return;
          handled = true;
          setIsSocialSubmitting(true);

          const nameParts = user.displayName ? user.displayName.split(' ') : ['User'];
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          try {
            const res = await socialLogin({
              email: user.email,
              firstName,
              lastName,
              profilePicture: user.photoURL
            });

            if (res.token) {
              toast.success(`Welcome to TaskForge, ${firstName}! ✨`);
              navigate('/dashboard');
            } else {
              setError(res.message);
              setIsSocialSubmitting(false);
            }
          } catch (e) {
            setError(e.message || 'Authentication failed during redirect.');
            setIsSocialSubmitting(false);
          }
        });

        setIsCheckingRedirect(false);
        return () => unsubscribe();
      }
    };
    handleRedirectResult();
  }, [socialLogin, navigate]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('All fields are required.');
        return;
      }
      setIsSubmitting(true);
      const res = await login({ email: formData.email, password: formData.password });
      setIsSubmitting(false);
      
      if (res.token) {
        toast.success("Welcome back to TaskForge!");
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } else {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('All fields are required.');
        return;
      }
      setIsSubmitting(true);
      const res = await register(formData);
      setIsSubmitting(false);
      
      if (res.token) {
        toast.success("Account created! Welcome to TaskForge ✨");
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      setIsSocialSubmitting(true);
      setError(null);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const nameParts = user.displayName ? user.displayName.split(' ') : ['User'];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const res = await socialLogin({
        email: user.email,
        firstName,
        lastName,
        profilePicture: user.photoURL
      });

      if (res.token) {
        toast.success(`Welcome to TaskForge, ${firstName}! ✨`);
        navigate('/dashboard');
      } else {
        setError(res.message);
        setIsSocialSubmitting(false);
      }
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        toast.info("Popup blocked. Trying redirect instead...");
        // The page will redirect, so we don't need to manage state further here.
        // The useEffect hook will handle the result on the next page load.
        await signInWithRedirect(auth, provider);
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || "Authentication failed. Please try again.");
        setIsSocialSubmitting(false);
      } else {
        // User closed the popup, so we are no longer submitting.
        setIsSocialSubmitting(false);
      }
    }
  };

  if (isCheckingRedirect) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-bg font-sans text-white">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
        <p className="mt-4 text-sm text-gray-400">Finalizing login...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-bg font-sans text-white selection:bg-brand-primary/30 p-4">
      
      {/* Ambient Top Glow */}
      <div className="absolute top-0 inset-x-0 h-125 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 -top-48 w-200 h-200 opacity-15 bg-brand-primary blur-[120px] rounded-full" />
      </div>

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-110 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-neutral-900/80 border border-white/10 rounded-xl flex items-center justify-center mb-6 shadow-2xl">
            <GrTarget size={22} className="text-brand-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {isLogin ? 'Enter your credentials to access your workspace.' : 'Join TaskForge and master your productivity.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name</label>
                  <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-all" type="text" placeholder="John" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name</label>
                  <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-all" type="text" placeholder="Doe" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
              <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-all" type="email" placeholder="name@example.com" name="email" value={formData.email} onChange={handleInputChange} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-400">Password</label>
                {isLogin && <a href="#" onClick={(e) => { e.preventDefault(); toast.info("Password resets coming soon!"); }} className="text-xs font-medium text-gray-500 hover:text-brand-primary transition-colors">Forgot password?</a>}
              </div>
              <div className="relative">
                <input className="w-full bg-black/40 border border-white/10 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-all" type={showPassword ? "text" : "password"} placeholder="••••••••" name="password" value={formData.password} onChange={handleInputChange} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1.5"
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-in fade-in duration-300 mt-2">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            <button className="group w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {isLogin ? 'Authenticating...' : 'Creating account...'}</>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} /></>
              )}
            </button>
          </form>

          {/* Social Auth */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500 font-medium">or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleSocialAuth(googleProvider)}
              className="flex items-center justify-center gap-2 w-full bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 hover:border-white/10 text-white font-medium py-2.5 px-4 rounded-lg transition-all cursor-pointer shadow-sm"
              disabled={isSocialSubmitting}
            >
              {isSocialSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Signing in...</>
              ) : (
                <><FcGoogle size={16} /> Google</>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Toggle Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); setFormData({ firstName: '', lastName: '', email: '', password: '' }); setShowPassword(false); }} className="text-white hover:text-brand-primary font-medium ml-2 transition-colors cursor-pointer border-b border-transparent hover:border-brand-primary pb-0.5">
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;