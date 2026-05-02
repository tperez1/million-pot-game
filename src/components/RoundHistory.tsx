import { useGameStore, Round } from '../store/gameStore';
import { formatUSD, formatOG, formatTimeAgo, safeNumber } from '../utils/format';
import { Trophy, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function RoundHistory() {
  const { roundHistory } = useGameStore();
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  
  if (roundHistory.length === 0) return null;
  
  const toggleExpand = (roundId: string) => {
    setExpandedRound(expandedRound === roundId ? null : roundId);
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
          const safePotUSD = safeNumber(round.potUSDValue, 0);
          const safePotOG = safeNumber(round.potOGAmount, 0);
          const safeTarget = safeNumber(round.target, 1000000);
          const safeRoundNumber = safeNumber(round.roundNumber, 0);
          const overflowAmount = safePotUSD - safeTarget;
          const totalRefunded = round.contributions.reduce((sum, c) => sum + safeNumber(c.ogAmount, 0), 0);
          
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
                      <>
                        <div className="mb-3">
                          <p className="text-xs text-[var(--muted)] mb-1">Overflow Amount</p>
                          <p className="font-bold text-[var(--error)]">
                            {formatUSD(Math.max(0, overflowAmount))} over target
                          </p>
                        </div>
                        
                        {/* Auto-refund status */}
                        <div className="p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                            <span className="font-semibold text-[var(--success)] text-sm">
                              All Players Refunded
                            </span>
                          </div>
                          <p className="text-xs text-[var(--muted)]">
                            {formatOG(totalRefunded)} 0G returned to {round.contributions.length} player{round.contributions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </>
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
                    
                    {round.contributions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-[var(--muted)] mb-2">Contributions</p>
                        <div className="space-y-1.5">
                          {round.contributions.map((contrib) => (
                            <div key={contrib.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-[var(--bg)]">
                              <span className="font-mono">{contrib.address}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{formatOG(safeNumber(contrib.ogAmount, 0))} 0G</span>
                                {contrib.refunded && (
                                  <span className="text-[var(--success)]">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
