import { Clock, Trophy, User } from 'lucide-react';
import { useGame } from '../hooks/useGame';

export function RecentActivity() {
  const { lastContributor, lastContributionAmount, latestWinner, latestWinAmount, latestWinMilestone } = useGame();

  const formatAddress = (addr: string) => {
    if (!addr) return '—';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-display font-semibold text-lg mb-3">Recent Activity</h3>
      
      <div className="space-y-3">
        {/* Last Contributor */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--muted)]">Last Contribution</p>
              <p className="font-mono text-sm truncate">{formatAddress(lastContributor)}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-semibold">{lastContributionAmount} 0G</p>
              <p className="text-xs text-[var(--muted)]">just now</p>
            </div>
          </div>
        </div>

        {/* Latest Winner */}
        {latestWinner && (
          <div className="glass rounded-xl p-4 border border-[var(--accent)]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--accent)]">Latest Winner!</p>
                <p className="font-mono text-sm truncate">{formatAddress(latestWinner)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold gradient-text">${parseFloat(latestWinAmount).toLocaleString()}</p>
                <p className="text-xs text-[var(--muted)]">Milestone #{latestWinMilestone}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
