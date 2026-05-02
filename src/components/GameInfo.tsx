import { Info, History, Shield, Clock, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function GameInfo() {
  const { setShowHistory } = useGameStore();

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h3 className="font-display font-semibold text-lg mb-3">How It Works</h3>
      
      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium">The Goal</p>
            <p className="text-xs text-[var(--muted)]">
              Add crypto to push the pot to <strong>exactly</strong> $1,000,000. Hit the target precisely and win $1,000,000!
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium">Price Fluctuation</p>
            <p className="text-xs text-[var(--muted)]">
              The pot's USD value changes with the 0G token market price. Price swings can move the pot closer to or further from the target!
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Refund Protection</p>
            <p className="text-xs text-[var(--muted)]">
              If the pot goes <strong>above</strong> $1,000,000, the round fails. You can claim a full refund of your deposits from that round anytime!
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium">Multiple Rounds</p>
            <p className="text-xs text-[var(--muted)]">
              When a round fails, a new one starts automatically. You can claim refunds from previous rounds while playing new ones.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowHistory(true)}
        className="w-full mt-3 py-3 rounded-xl glass hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <History className="w-4 h-4" />
        View Winner History
      </button>
    </div>
  );
}
