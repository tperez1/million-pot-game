import { X, Trophy, ExternalLink } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';

export function WinnerHistory() {
  const { showHistory, setShowHistory } = useGameStore();
  const { winnerHistory } = useGame();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!showHistory) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setShowHistory(false)}
    >
      <div 
        className="w-full max-w-lg bg-[var(--bg)] rounded-t-3xl max-h-[80vh] overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-display font-semibold text-lg">Winner History</h3>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Winner List */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {winnerHistory.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No winners yet</p>
              <p className="text-sm">Be the first to hit the $1M target!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winnerHistory.map((winner, index) => (
                <div
                  key={`${winner.address}-${winner.timestamp}`}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-black font-bold text-sm">#{winner.milestone}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{formatAddress(winner.address)}</p>
                      <p className="text-xs text-[var(--muted)]">{formatDate(winner.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold gradient-text">
                        ${parseFloat(winner.prize).toLocaleString()}
                      </p>
                      <a
                        href="#"
                        className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 justify-end"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => setShowHistory(false)}
            className="w-full py-3 rounded-xl glass hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
