import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatUSD, formatOG } from '../utils/format';
import { Target, TrendingUp, TrendingDown, Coins, RefreshCw, Activity, AlertTriangle } from 'lucide-react';

export default function PotDisplay() {
  const { 
    currentRound, 
    ogPrice, 
    priceChange, 
    priceHistory,
    isPriceLoading,
    lastPriceUpdate,
    updatePriceFromOracle 
  } = useGameStore();
  
  const { potUSDValue, potOGAmount, target, status, roundNumber } = currentRound;
  
  // Update price from oracle every 5 seconds
  useEffect(() => {
    updatePriceFromOracle();
    const interval = setInterval(updatePriceFromOracle, 5000);
    return () => clearInterval(interval);
  }, [updatePriceFromOracle]);
  
  const distanceToWin = target - potUSDValue;
  const progress = (potUSDValue / target) * 100;
  
  const formatted = formatUSD(potUSDValue);
  const parts = formatted.split('.');
  const dollars = parts[0];
  const cents = parts[1] || '00';
  
  const isPositiveChange = priceChange >= 0;
  
  // Calculate mini chart for price sparkline
  const maxPrice = Math.max(...priceHistory.map(p => p.price), ogPrice);
  const minPrice = Math.min(...priceHistory.map(p => p.price), ogPrice);
  const priceRange = maxPrice - minPrice || 0.01;
  
  const statusConfig = {
    ACTIVE: { 
      color: 'var(--success)', 
      bg: 'rgba(22, 163, 74, 0.1)', 
      label: 'ACTIVE',
      pulse: true 
    },
    WON: { 
      color: 'var(--gold)', 
      bg: 'rgba(245, 158, 11, 0.1)', 
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
      
      {/* Critical Price Warning Banner */}
      {status === 'ACTIVE' && (
        <div className="w-full max-w-sm mb-4 p-3 rounded-xl bg-[var(--warning)]/10 border-2 border-[var(--warning)]/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--warning)]">Watch the 0G Price!</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                The pot value changes with price. Time your deposit to hit exactly $1M!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Oracle Price Display - Prominent */}
      <div className="w-full max-w-sm mb-4">
        <div className="glass rounded-2xl p-4 border-2 border-[var(--accent)]/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isPriceLoading ? 'animate-pulse text-[var(--muted)]' : 'text-[var(--success)]'}`} />
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                0G Oracle Price
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold">
              <RefreshCw className="w-3 h-3" />
              <span>LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">${ogPrice.toFixed(4)}</span>
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isPositiveChange 
                    ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                    : 'bg-[var(--error)]/10 text-[var(--error)]'
                }`}>
                  {isPositiveChange ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%</span>
                </div>
              </div>
              {lastPriceUpdate && (
                <p className="text-xs text-[var(--muted)] mt-1">
                  Updated {Math.floor((Date.now() - lastPriceUpdate) / 1000)}s ago
                </p>
              )}
            </div>
            
            {/* Mini sparkline */}
            {priceHistory.length > 1 && (
              <div className="w-24 h-10">
                <svg viewBox="0 0 80 32" className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke={isPositiveChange ? 'var(--success)' : 'var(--error)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={priceHistory.slice(-20).map((p, i) => {
                      const x = (i / 19) * 80;
                      const y = 32 - ((p.price - minPrice) / priceRange) * 28 - 2;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </svg>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)]">
              <span className="font-semibold text-[var(--text)]">Key Insight:</span> 1 0G = ${ogPrice.toFixed(4)}. 
              To add $100, you need {(100 / ogPrice).toFixed(2)} 0G.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-3">
          Current Pot (USD)
        </p>
        
        <div className="animate-glow rounded-3xl px-6 py-4 bg-[var(--surface)] border border-[var(--border)]">
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
        
        <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        {status === 'ACTIVE' && (
          <div className="flex items-center justify-between mt-2 text-xs text-[var(--muted)]">
            <span className="font-medium">{progress.toFixed(2)}%</span>
            <span>{formatUSD(Math.abs(distanceToWin))} {distanceToWin >= 0 ? 'to win' : 'over'}</span>
          </div>
        )}
      </div>
      
      {status === 'ACTIVE' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-light)] rounded-full border border-[var(--border)]">
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
