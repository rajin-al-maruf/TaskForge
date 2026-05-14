import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { FaCrown, FaCheck, FaChartLine, FaPaintBrush, FaStopwatch, FaListUl, FaCreditCard, FaCalendarCheck, FaSync } from 'react-icons/fa';
import { AuthContext } from '../api/AuthContext.jsx';
import { updateProfile } from '../api/userApi.js';
import { toast } from 'sonner';

const ProPlanModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('12');

  const isProUser = user?.userType === 'pro';

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isMounted || !user) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await updateProfile({ userType: 'pro' });
      if (setUser) {
        setUser((prev) => {
          const updated = { ...prev, userType: 'pro' };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
      toast.success("Payment successful! Welcome to TaskForge Pro ✨");
    } catch (error) {
      toast.error("An error occurred while upgrading.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await updateProfile({ userType: 'free' });
      if (setUser) {
        setUser((prev) => {
          const updated = { ...prev, userType: 'free' };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
      toast.success("Your subscription has been canceled.");
    } catch (error) {
      toast.error("Failed to cancel subscription.");
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    { icon: FaListUl, text: "Unlimited Custom Lists" },
    { icon: FaChartLine, text: "Advanced Performance Analytics" },
    { icon: FaStopwatch, text: "Deep Work Focus Timer" },
    { icon: FaPaintBrush, text: "Custom Workspace Themes" },
    { icon: FaCalendarCheck, text: "Extended History Tracking" },
    { icon: FaSync, text: "Recurring Tasks" },
  ];

  return createPortal(
    <div 
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-4xl bg-brand-surface border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-gray-500 hover:text-white bg-neutral-800/50 hover:bg-neutral-700/50 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer">
          ✕
        </button>

        <div className="p-8">
          {isProUser ? (
            <div className="flex flex-col items-center text-center p-8">
              <div className="h-16 w-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-4">
                <FaCrown size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">TaskForge Pro Active</h2>
              <p className="text-gray-400 text-sm max-w-md mb-8">Thank you for supporting TaskForge! You have access to all premium features to maximize your productivity.</p>
              
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md text-left mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-400 font-medium">Current Plan</span>
                  <span className="text-xs text-brand-primary font-bold bg-brand-primary/10 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-white font-semibold">Pro Subscription</span>
                  <span className="text-sm text-gray-500">Renews on {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                  <FaCreditCard /> Update Payment Method
                </button>
                <button onClick={handleCancel} disabled={isProcessing} className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-red-400 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                  {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Upgrade to TaskForge Pro</h2>
                <p className="text-gray-400 text-sm">Unlock your full potential with all premium features.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side: Features */}
                <div className="flex flex-col">
                  <ul className="space-y-4">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20">
                          <f.icon className="text-brand-primary" size={14} />
                        </div>
                        <p className="text-xs text-gray-200">{f.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Side: Pricing Options */}
                <div className="flex flex-col gap-4">
                  <div onClick={() => setSelectedPlan('1')} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPlan === '1' ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_-5px_rgba(var(--color-brand-primary),0.3)]' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className={`font-bold ${selectedPlan === '1' ? 'text-brand-primary' : 'text-white'}`}>1 Month</h5>
                        <p className="text-xs text-gray-400">Pay monthly, cancel anytime.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">$4.99</span>
                        <span className="text-xs text-gray-500"> /mo</span>
                      </div>
                    </div>
                  </div>

                  <div onClick={() => setSelectedPlan('6')} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPlan === '6' ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_-5px_rgba(var(--color-brand-primary),0.3)]' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className={`font-bold ${selectedPlan === '6' ? 'text-brand-primary' : 'text-white'}`}>6 Months</h5>
                        <p className="text-xs text-gray-400">Billed $23.94 every 6 months.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">$3.99</span>
                        <span className="text-xs text-gray-500"> /mo</span>
                      </div>
                    </div>
                  </div>

                  <div onClick={() => setSelectedPlan('12')} className={`p-4 rounded-xl border cursor-pointer transition-all relative ${selectedPlan === '12' ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_-5px_rgba(var(--color-brand-primary),0.3)]' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}>
                    <div className="absolute -top-3 right-4 bg-yellow-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Best Value</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className={`font-bold ${selectedPlan === '12' ? 'text-brand-primary' : 'text-white'}`}>12 Months</h5>
                        <p className="text-xs text-gray-400">Billed $29.88 annually.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">$2.49</span>
                        <span className="text-xs text-gray-500"> /mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-800">
                    <button onClick={handleUpgrade} disabled={isProcessing} className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                      {isProcessing ? <span className="animate-pulse">Processing...</span> : <>Upgrade to Pro</>}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-500">
                      <FaCheck className="text-green-500" /> Cancel anytime. Secure payment.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProPlanModal;