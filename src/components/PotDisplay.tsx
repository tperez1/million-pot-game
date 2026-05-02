import { TrendingUp, TrendingDown, Target, Users, AlertTriangle, CheckCircle, XCircle, RefreshCw, Info } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  },
  won: {
    label: 'Won!',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30'
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30'
  }
};

const TARGET_AMOUNT = 1000000;

export function PotDisplay() {
  const { contributorCount } = useGameStore();
  const { usdValue, currentRoundId, currentRound, distanceToMilestone } = useGame();

  const formatUsd = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(3)}M`;
    }
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  if (!currentRound) return null;

  const statusConfig = STATUS_CONFIG[currentRound.status];
  const progressPercent = Math.min(100, Math.max(0, 
    ((TARGET_AMOUNT - parseFloat(distanceToMilestone)) / TARGET_AMOUNT) * 100
  ));
  const isNearTarget = parseFloat(distanceToMilestone) < 100000;
  const isOverTarget = parseFloat(usdValue) > TARGET_AMOUNT;

  return (
    <div className="animate-fade-in-up space-y-3">
      {/* Price Fluctuation Warning */}
      <div className="glass rounded-xl p-3 border border-violet-500/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-violet-400 font-medium">Live Market Price</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Pot value fluctuates with 0G token USD price. Market moves can push the pot closer to—or away from—the $1M target without any deposits.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Pot Card */}
      <div className={`relative rounded-3xl p-6 text-center ${
        currentRound.status === 'failed' 
          ? 'ring-2 ring-red-500/50' 
          : isNearTarget && currentRound.status === 'active'
          ? 'animate-pulse-glow' 
          : 'glass'
      }`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 rounded-3xl pointer-events-none ${
          currentRound.status === 'failed' 
            ? 'bg-gradient-to-b from-red-500/10 via-transparent to-transparent' 
            : 'bg-gradient-to-b from-amber-500/10 via-transparent to-transparent'
        }`} />
        
        {/* Round Number */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-medium">
            Round #{currentRoundId}
          </span>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border}`}>
            <span className={statusConfig.color}>{statusConfig.icon}</span>
            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
          
          {currentRound.status === 'active' && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)]">
              <Target className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm text-[var(--accent)] font-medium">Target: $1M</span>
            </div>
          )}
        </div>

        {/* Current USD Value */}
        <div className="relative">
          <p className="text-sm text-[var(--muted)] mb-1">Current Pot Value</p>
          <div className={`font-display font-bold text-5xl sm:text-6xl tracking-tight animate-count-up ${
            currentRound.status === 'failed' 
              ? 'text-red-400' 
              : currentRound.status === 'won'
              ? 'gradient-text'
              : 'text-[var(--text)]'
          }`}>
            {formatUsd(usdValue)}
          </div>
          
          {currentRound.status === 'active' && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {!isOverTarget ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">
                    {progressPercent.toFixed(1)}% to target
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500 font-medium">Over target!</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Failed Round Warning */}
        {currentRound.status === 'failed' && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2">
              <RefreshCw className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-violet-400">New Round Started</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Round #{currentRoundId - 1} failed. A new round has begun. Claim refunds below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Won Round Message */}
        {currentRound.status === 'won' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-amber-400">Winner!</p>
                <p className="text-xs text-amber-400/80 mt-1">
                  Round #{currentRoundId} reached exactly $1,000,000!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress to Target (Active only) */}
        {currentRound.status === 'active' && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--muted)]">Target: $1,000,000</span>
              <span className="font-mono text-[var(--accent)]">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--surface)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isOverTarget ? 'bg-red-500' : 'progress-bar'
                }`}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Distance to Target (Active only) */}
        {currentRound.status === 'active' && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--surface)]">
            <p className="text-xs text-[var(--muted)]">Distance to Target</p>
            <p className="font-mono text-xl font-semibold text-[var(--text)]">
              ${parseFloat(distanceToMilestone).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        )}

        {/* Players Count */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[var(--muted)]">
          <Users className="w-4 h-4" />
          <span className="text-sm">{contributorCount.toLocaleString()} players this round</span>
        </div>
      </div>
    </div>
  );
}
