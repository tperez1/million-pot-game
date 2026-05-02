import { useState, useEffect } from 'react';
import { Zap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useWallet } from '../hooks/useWallet';

const PRESET_AMOUNTS = ['0.1', '0.5', '1', '5', '10'];

export function ContributionForm() {
  const { contributionAmount, isSubmitting, setContributionAmount, deposit, currentRound } = useGame();
  const { address, balance, isCorrectChain, switchToOGChain } = useWallet();
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (txStatus === 'success' || txStatus === 'error') {
      const timer = setTimeout(() => setTxStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [txStatus]);

  // Only show deposit form for active rounds
  if (!currentRound || currentRound.status !== 'active') {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--muted)]">
          {currentRound?.status === 'won' 
            ? 'Round completed. Deposit in the new round above!'
            : 'Round failed. Check Previous Rounds for refunds.'
          }
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--muted)]">Connect wallet to participate</p>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-[var(--muted)] mb-4">Wrong network detected</p>
        <button
          onClick={() => switchToOGChain(16602)}
          className="px-6 py-3 rounded-xl btn-primary"
        >
          Switch to 0G Testnet
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionAmount || isSubmitting) return;

    try {
      setTxStatus('pending');
      setErrorMsg('');
      await deposit(contributionAmount);
      setTxStatus('success');
    } catch (error) {
      setTxStatus('error');
      setErrorMsg(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  const handlePreset = (amount: string) => {
    setContributionAmount(amount);
  };

  const handleMax = () => {
    const maxAmount = Math.max(0, parseFloat(balance) - 0.001);
    setContributionAmount(maxAmount.toFixed(6));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Input */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-[var(--muted)]">Amount to Add</label>
          <button
            type="button"
            onClick={handleMax}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            MAX
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder="0.0"
            step="0.000001"
            min="0"
            className="flex-1 bg-transparent text-2xl font-mono font-semibold outline-none placeholder:text-[var(--muted)]/50"
          />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent-soft)]">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
            <span className="text-sm font-medium">0G</span>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Available: {parseFloat(balance).toFixed(4)} 0G
        </p>
      </div>

      {/* Preset Amounts */}
      <div className="flex gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePreset(amount)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              contributionAmount === amount
                ? 'bg-[var(--accent)] text-black'
                : 'glass hover:bg-white/5'
            }`}
          >
            {amount}
          </button>
        ))}
      </div>

      {/* Status Message */}
      {txStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Deposit successful!</span>
        </div>
      )}
      {txStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{errorMsg || 'Transaction failed'}</span>
        </div>
      )}

      {/* Warning */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-400">
          ⚠️ <strong>Important:</strong> The pot must reach <strong>exactly</strong> $1,000,000 to win. 
          If it crosses above, the round fails and a new round starts.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!contributionAmount || parseFloat(contributionAmount) <= 0 || isSubmitting}
        className="w-full py-4 rounded-2xl btn-primary flex items-center justify-center gap-2 text-lg"
      >
        {isSubmitting || txStatus === 'pending' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Add Crypto
          </>
        )}
      </button>

      <p className="text-xs text-center text-[var(--muted)]">
        Your contribution could win you $1,000,000!
      </p>
    </form>
  );
}
