import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { Round } from '../store/gameStore';

const formatUsd = (value: string) => {
  const num = parseFloat(value);
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const formatAddress = (addr: string) => {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function RoundHistory() {
  const { previousRounds, claimRefund, isSubmitting } = useGame();
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [claimingRound, setClaimingRound] = useState<number | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<number | null>(null);

  if (previousRounds.length === 0) return null;

  const handleClaimRefund = async (roundId: number) => {
    setClaimingRound(roundId);
    try {
      const success = await claimRefund(roundId);
      if (success) {
        setClaimSuccess(roundId);
      }
    } catch (error) {
      console.error('Claim failed:', error);
    }
    setClaimingRound(null);
  };

  const toggleExpand = (roundId: number) => {
    setExpandedRound(expandedRound === roundId ? null : roundId);
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[var(--muted)]" />
        Previous Rounds
      </h3>
      
      <div className="space-y-3">
        {previousRounds.map((round) => (
          <div key={round.id} className="glass rounded-xl overflow-hidden">
            {/* Round Header */}
            <button
              onClick={() => toggleExpand(round.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  round.status === 'won' 
                    ? 'bg-amber-500/10' 
                    : 'bg-red-500/10'
                }`}>
                  {round.status === 'won' 
                    ? <CheckCircle className="w-4 h-4 text-amber-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div>
                  <p className="font-medium text-sm">Round #{round.id}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(round.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  round.status === 'won'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {round.status === 'won' ? 'Won' : 'Failed'}
                </span>
                {expandedRound === round.id 
                  ? <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
                  : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                }
              </div>
            </button>
            
            {/* Expanded Details */}
            {expandedRound === round.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
                {/* Pot Value */}
                <div className="pt-3 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--surface)]">
                    <p className="text-xs text-[var(--muted)]">Final Pot</p>
                    <p className="font-mono font-semibold">{formatUsd(round.potUsdValue)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface)]">
                    <p className="text-xs text-[var(--muted)]">Players</p>
                    <p className="font-mono font-semibold">{round.contributorCount}</p>
                  </div>
                </div>
                
                {/* Winner or Last Contributor */}
                {round.status === 'won' && round.winner && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 mb-1">Winner</p>
                    <p className="font-mono text-sm">{formatAddress(round.winner)}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Won $1,000,000</p>
                  </div>
                )}
                
                {round.status === 'failed' && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 mb-1">Last Depositor</p>
                    <p className="font-mono text-sm">{formatAddress(round.lastContributor)}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Deposited {round.lastContributionAmount} 0G before failure
                    </p>
                  </div>
                )}
                
                {/* User's Deposits */}
                {parseFloat(round.userDeposits) > 0 && (
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <p className="text-xs text-violet-400 mb-1">Your Deposits</p>
                    <p className="font-mono font-semibold">{round.userDeposits} 0G</p>
                  </div>
                )}
                
                {/* Claim Refund Button */}
                {round.status === 'failed' && parseFloat(round.userDeposits) > 0 && (
                  <div className="pt-2">
                    {claimSuccess === round.id ? (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">Refund claimed</span>
                      </div>
                    ) : round.hasClaimedRefund ? (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">You have claimed your refund</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaimRefund(round.id)}
                        disabled={isSubmitting || claimingRound === round.id}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {claimingRound === round.id ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <ArrowLeft className="w-4 h-4" />
                            Claim Refund ({round.userDeposits} 0G)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
                
                {/* No Deposits Message */}
                {round.status === 'failed' && parseFloat(round.userDeposits) === 0 && (
                  <p className="text-xs text-center text-[var(--muted)] pt-2">
                    You had no deposits in this round.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
