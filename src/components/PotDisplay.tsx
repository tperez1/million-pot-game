import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatUSD, formatOG } from '../utils/format';
import { Target, Coins } from 'lucide-react';

export default function PotDisplay() {
  const { 
    currentRound, 
    updatePriceFromOracle 
  } = useGameStore();
  
  const { potUSDValue, potOGAmount, target, status, roundNumber } = currentRound;
  
  useEffect(() => {
    updatePriceFromOracle();
    const interval = setInterval(updatePriceFromOracle, 5000);
    return () => clearInterval(interval);
  }, [updatePriceFromOracle]);
  
  const distanceToTarget = target - potUSDValue;
  const progress = (potUSDValue / target) * 100;
  
  const formatted = formatUSD(potUSDValue);
  const parts = formatted.split('.');
  const dollars = parts[0];
  const cents = parts[1] || '00';
  
  const statusConfig = {
    ACTIVE: { 
      color: 'var(--success)', 
      bg: 'rgba(22, 163, 74, 0.1)', 
      label: 'ACTIVE',
      pulse: true 
    },
    WON: { 
      color: 'var(--gold)', 
      bg: 'rgba(245, 158, 11, 0.15)', 
      label: 'WON',
      pulse: false 
    },
    FAILED: { 
      color: 'var(--error)', 
      bg: 'rgba(220, 38, 38, 0.1)', 
      label: 'FAILED',
      pulse: false 
    },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="flex flex-col items-center py-6 px-4 animate-fade-in-up">
      <div className="w-full max-w-sm mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              Round #{roundNumber}
            </span>
          </div>
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ 
              backgroundColor: config.bg, 
              color: config.color 
            }}
          >
            {config.pulse && (
              <span 
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: config.color }}
              />
            )}
            {config.label}
          </div>
        </div>
      </div>
      
      <div className="text-center mb-4 gold-glow-bg">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-3">
          Current Pot
        </p>
        
        <div className="animate-glow rounded-3xl px-6 py-4 bg-[var(--surface)] border border-[var(--border)] gold-card">
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
              {dollars}
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-[var(--muted)]">
              .{cents}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Coins className="w-4 h-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)] font-medium">
              {formatOG(potOGAmount)} 0G
            </span>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-sm mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[var(--muted)] font-medium">Target</span>
          </div>
          <span className="font-bold text-sm">
            {formatUSD(target)}
          </span>
        </div>
        
        <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(90deg, #1A1A1A 0%, #3A3A3A 100%)',
              boxShadow: '0 0 10px rgba(255, 200, 0, 0.2)'
            }}
          >
            <div 
              className="absolute inset-0 shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 200, 0, 0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        </div>
        
        {status === 'ACTIVE' && (
          <div className="flex items-center justify-between mt-2 text-xs text-[var(--muted)]">
            <span className="font-medium">{progress.toFixed(2)}%</span>
            <span>{formatUSD(Math.abs(distanceToTarget))} {distanceToTarget >= 0 ? 'to win' : 'over'}</span>
          </div>
        )}
      </div>
      
      {status === 'ACTIVE' && (
        <div 
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border"
          style={{ 
            backgroundColor: 'rgba(255, 200, 0, 0.06)',
            borderColor: 'rgba(255, 200, 0, 0.15)'
          }}
        >
          <span className="text-sm font-semibold">
            Hit exactly {formatUSD(target)} to win $1,000,000!
          </span>
        </div>
      )}
      
      {status === 'WON' && (
        <div className="text-center">
          <p className="text-sm text-[var(--muted)]">
            Winner: <span className="font-mono font-bold text-[var(--text)]">{currentRound.winner}</span>
          </p>
        </div>
      )}
    </div>
  );
}