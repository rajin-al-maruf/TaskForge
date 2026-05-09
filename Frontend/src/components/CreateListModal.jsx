import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const CreateListModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);

  // Handle mount and unmount animations
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setName('');
      const timer = setTimeout(() => {
        setIsVisible(true);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Add ESC key support for quick closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onCreate(name.trim());
    setIsSubmitting(false);
    onClose();
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md bg-neutral-900 border border-neutral-800/60 p-1.5 rounded-2xl shadow-2xl transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'}`}
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-neutral-950/50 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your new list..."
            className="flex-1 bg-transparent text-white text-base px-5 py-3.5 outline-none placeholder-neutral-600"
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2 pr-2">
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? '...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
};

export default CreateListModal;
