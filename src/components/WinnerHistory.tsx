import { useGameStore } from '../store/gameStore';
import { formatUSD, formatTimeAgo } from '../utils/format';
import { Trophy } from 'lucide-react';

export default function WinnerHistory() {
  const { winners } = useGameStore();
  
  if (winners.length === 0) return null;
  
  return (
    <div className="px-4 pb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-[var(--gold)]" />
        <h3 className="text-sm font-bold">Winner Hall of Fame</h3>
      </div>
      
      <div className="space-y-2">
        {winners.map((winner, index) => (
          <div 
            key={winner.id}
            className="glass rounded-2xl p-4 hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">{winner.address}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatTimeAgo(winner.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--success)]">{formatUSD(1000000)}</p>
                <p className="text-xs text-[var(--muted)]">
                  Milestone #{(winner.milestone / 1000000).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}