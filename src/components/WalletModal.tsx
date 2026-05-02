import { useGameStore } from '../store/gameStore';
import { X } from 'lucide-react';

export default function WalletModal() {
  const { showWalletModal, setShowWalletModal, connectWallet } = useGameStore();
  
  if (!showWalletModal) return null;
  
  const handleConnect = (type: 'metamask' | 'rabby') => {
    connectWallet(type);
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={() => setShowWalletModal(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-sm bg-[var(--surface)] rounded-3xl p-6 animate-fade-in-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <button 
            onClick={() => setShowWalletModal(false)}
            className="p-2 hover:bg-[var(--accent-light)] rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => handleConnect('metamask')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] hover:bg-[var(--accent-light)] hover:border-[var(--accent)] transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F6851B]/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <path d="M36.4 3L22 14l2.7-6.3L36.4 3z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.5"/>
                <path d="M3.6 3l14.3 11.1-2.6-6.4L3.6 3zM31.2 28.4l-3.8 5.8 8.2 2.3 2.3-8-6.7-.1zM2.1 28.5l2.3 8 8.2-2.3-3.8-5.8-6.7.1z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.5"/>
                <path d="M12.1 17.4l-2.3 3.4 8.1.4-.3-8.7-5.5 4.9zM27.9 17.4l-5.6-5-.2 8.8 8.1-.4-2.3-3.4zM12.6 34.2l4.9-2.4-4.2-3.3-.7 5.7zM22.5 31.8l4.9 2.4-.7-5.7-4.2 3.3z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.5"/>
                <path d="M27.4 34.2l-4.9-2.4.4 3.3 0 1.4 4.5-2.3zM12.6 34.2l4.5 2.3 0-1.4.4-3.3-4.9 2.4z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="0.5"/>
                <path d="M17.2 26.1l-4-1.2 2.8-1.3 1.2 2.5zM22.8 26.1l1.2-2.5 2.8 1.3-4 1.2z" fill="#233447" stroke="#233447" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold group-hover:text-[var(--accent)]">MetaMask</p>
              <p className="text-xs text-[var(--muted)]">Browser extension</p>
            </div>
            <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleConnect('rabby')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] hover:bg-[var(--accent-light)] hover:border-[var(--accent)] transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#637FFF]/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="4" width="32" height="32" rx="8" fill="#637FFF"/>
                <path d="M20 10C14.5 10 10 14.5 10 20s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="white"/>
                <circle cx="20" cy="20" r="3" fill="white"/>
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold group-hover:text-[var(--accent)]">Rabby</p>
              <p className="text-xs text-[var(--muted)]">Web3 wallet</p>
            </div>
            <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <p className="text-xs text-center text-[var(--muted)] mt-6">
          By connecting, you agree to the game terms.
        </p>
      </div>
    </div>
  );
}