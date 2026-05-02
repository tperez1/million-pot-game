import { useGameStore, Round } from '../store/gameStore';
import { formatUSD, formatOG, formatTimeAgo, safeNumber } from '../utils/format';
import { Trophy, AlertTriangle, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function RoundHistory() {
  const { roundHistory, walletAddress, claimRefund } = useGameStore();
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  
  if (roundHistory.length === 0) return null;
  
  const getUserContribution = (round: Round) => {
    if (!walletAddress) return null;
    return round.contributions.find(c => c.address === walletAddress);
  };
  
  const hasUserContributed = (round: Round) => {
    if (!walletAddress) return false;
    return round.contributions.some(c => c.address === walletAddress);
  };
  
  const toggleExpand = (roundId: string) => {
    setExpandedRound(expandedRound === roundId ? null : roundId);
  };
  
  const handleClaimRefund = (roundId: string) => {
    claimRefund(roundId);
  };
  
  return (
    <div className="px-4 pb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-[var(--muted)]" />
        <h3 className="text-sm font-bold text-[var(--muted)]">Round History</h3>
      </div>
      
      <div className="space-y-2">
        {roundHistory.map((round) => {
          const isExpanded = expandedRound === round.id;
          const userContribution = getUserContribution(round);
          const canClaimRefund = round.status === 'FAILED' && userContribution && !userContribution.refunded;
          const hasRefunded = userContribution?.refunded;
          
          // Safe number handling
          const safePotUSD = safeNumber(round.potUSDValue, 0);
          const safePotOG = safeNumber(round.potOGAmount, 0);
          const safeTarget = safeNumber(round.target, 1000000);
          const safeRoundNumber = safeNumber(round.roundNumber, 0);
          const overflowAmount = safePotUSD - safeTarget;
          
          return (
            <div 
              key={round.id}
              className="glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(round.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--accent-light)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    round.status === 'WON' 
                      ? 'bg-[var(--gold)]/20' 
                      : 'bg-[var(--error)]/10'
                  }`}>
                    {round.status === 'WON' ? (
                      <Trophy className="w-5 h-5 text-[var(--gold)]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Round #{safeRoundNumber}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        round.status === 'WON' 
                          ? 'bg-[var(--gold)]/20 text-[var(--gold)]' 
                          : 'bg-[var(--error)]/10 text-[var(--error)]'
                      }`}>
                        {round.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {round.endedAt ? formatTimeAgo(round.endedAt) : 'In progress'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatUSD(safePotUSD)}</p>
                    <p className="text-xs text-[var(--muted)]">{formatOG(safePotOG)} 0G</p>
                  </div>
                  <div className={`w-5 h-5 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in-up">
                  <div className="pt-3 border-t border-[var(--border)]">
                    {round.status === 'FAILED' && (
                      <div className="mb-3">
                        <p className="text-xs text-[var(--muted)] mb-1">Overflow Amount</p>
                        <p className="font-bold text-[var(--error)]">
                          {formatUSD(Math.max(0, overflowAmount))} over target
                        </p>
                      </div>
                    )}
                    
                    {round.status === 'WON' && (
                      <div className="mb-3">
                        <p className="text-xs text-[var(--muted)] mb-1">Winner</p>
                        <p className="font-mono font-semibold">{round.winner || 'Unknown'}</p>
                        <p className="text-sm text-[var(--success)] font-bold">
                          Won {formatUSD(safeNumber(round.winnerPayout, 1000000))}
                        </p>
                      </div>
                    )}
                    
                    {canClaimRefund && (
                      <button
                        onClick={() => handleClaimRefund(round.id)}
                        className="w-full mt-3 py-3 rounded-xl font-semibold bg-[var(--warning)] text-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Claim Refund ({formatOG(safeNumber(userContribution?.ogAmount, 0))} 0G)
                      </button>
                    )}
                    
                    {hasRefunded && (
                      <div className="mt-3 p-3 rounded-xl bg-[var(--success)]/10 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                          <p className="text-sm font-semibold text-[var(--success)]">
                            Refund Claimed ({formatOG(safeNumber(userContribution?.ogAmount, 0))} 0G)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {round.status === 'FAILED' && !hasUserContributed(round) && walletAddress && (
                      <p className="text-xs text-[var(--muted)] mt-3 text-center">
                        You did not participate in this round
                      </p>
                    )}
                    
                    {!walletAddress && round.status === 'FAILED' && (
                      <p className="text-xs text-[var(--muted)] mt-3 text-center">
                        Connect wallet to claim refund
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
