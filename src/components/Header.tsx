import { Moon, Sun, Wallet, ExternalLink, ChevronDown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useWallet } from '../hooks/useWallet';

export function Header() {
  const { isDark, toggleTheme } = useGameStore();
  const { address, isConnecting, balance, connectWallet, disconnectWallet, isCorrectChain, chainId } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg)]/80 border-b border-[var(--border)]">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-black font-bold text-sm font-display">$</span>
          </div>
          <span className="font-display font-semibold text-lg">Million Pot Game</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {address ? (
            <div className="flex items-center gap-2">
              {!isCorrectChain && (
                <span className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400">
                  Wrong Network
                </span>
              )}
              <button
                onClick={disconnectWallet}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/5 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-mono">{formatAddress(address)}</span>
                <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {address && isCorrectChain && (
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Balance: <span className="font-mono text-[var(--text)]">{parseFloat(balance).toFixed(4)} 0G</span></span>
            <a
              href={chainId === 16602 ? 'https://chainscan-newton.0g.ai' : 'https://chainscan.0g.ai'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
            >
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
