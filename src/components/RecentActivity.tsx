import { useGameStore } from '../store/gameStore';
import { formatUSD, formatOG, formatTimeAgo } from '../utils/format';
import { Activity, ArrowUpRight } from 'lucide-react';

export default function RecentActivity() {
  const { currentRound } = useGameStore();
  const { contributions, roundNumber, status } = currentRound;
  
  const recentContributions = contributions.slice(-5).reverse();
  
  if (status !== 'ACTIVE' || recentContributions.length === 0) return null;
  
  return (
    <div className="px-4 pb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--muted)]" />
          <h3 className="text-sm font-bold text-[var(--muted)]">Round #{roundNumber} Activity</h3>
        </div>
        <span className="text-xs text-[var(--muted)]">
          {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-1">
        {recentContributions.map((contrib) => (
          <div 
            key={contrib.id}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[var(--accent-light)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-[var(--success)]" />
              </div>
              <div>
                <p className="font-mono text-sm font-medium">{contrib.address}</p>
                <p className="text-xs text-[var(--muted)]">{formatTimeAgo(contrib.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{formatOG(contrib.ogAmount)} 0G</p>
              <p className="text-xs text-[var(--muted)]">{formatUSD(contrib.usdValueAtDeposit)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
