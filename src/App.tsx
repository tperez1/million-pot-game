import { useGameStore } from './store/gameStore';
import PotDisplay from './components/PotDisplay';
import WalletModal from './components/WalletModal';
import AddMoneyModal from './components/AddMoneyModal';
import RecentActivity from './components/RecentActivity';
import RoundHistory from './components/RoundHistory';
import GameRules from './components/GameRules';
import AICommentary from './components/AICommentary';
import { Wallet, LogOut, Coins } from 'lucide-react';

export default function App() {
  const { 
    isConnected, 
    walletAddress, 
    setShowWalletModal, 
    setShowAddMoneyModal,
    disconnectWallet,
    currentRound
  } = useGameStore();

  const isActive = currentRound.status === 'ACTIVE';

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent)]"
            >
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">
              MILLION$
            </span>
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="text-sm font-semibold">{walletAddress}</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="p-2 hover:bg-[var(--accent-light)] rounded-full transition-colors"
                aria-label="Disconnect wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg btn-gold-glow"
            >
              <Wallet className="w-4 h-4" />
              Connect
            </button>
          )}
        </div>
      </header>
      
      <main className="max-w-lg mx-auto">
        <PotDisplay />
        
        {isActive && (
          <div className="px-4 mb-6">
            <button
              onClick={() => {
                if (isConnected) {
                  setShowAddMoneyModal(true);
                } else {
                  setShowWalletModal(true);
                }
              }}
              className="w-full py-5 rounded-2xl font-bold text-xl bg-[var(--accent)] text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl btn-gold-glow"
            >
              {isConnected ? 'Add 0G' : 'Connect to Play'}
            </button>
          </div>
        )}
        
        <AICommentary />
        <GameRules />
        <RecentActivity />
        <RoundHistory />
      </main>
      
      <WalletModal />
      <AddMoneyModal />
    </div>
  );
}