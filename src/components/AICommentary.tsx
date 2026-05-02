import { useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, DollarSign, Zap, Target, Eye } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const riskConfig = {
  LOW: { color: 'var(--success)', bg: 'rgba(22, 163, 74, 0.1)', label: 'LOW' },
  MEDIUM: { color: 'var(--warning)', bg: 'rgba(217, 119, 6, 0.1)', label: 'MEDIUM' },
  HIGH: { color: 'var(--error)', bg: 'rgba(220, 38, 38, 0.1)', label: 'HIGH' },
};

const eventIcons = {
  market_pump: TrendingUp,
  volatility_spike: Zap,
  whale_activity: DollarSign,
  price_alert: Activity,
  milestone_close: Target,
};

const eventColors = {
  market_pump: 'var(--success)',
  volatility_spike: 'var(--warning)',
  whale_activity: 'var(--accent)',
  price_alert: 'var(--muted)',
  milestone_close: 'var(--error)',
};

export default function AICommentary() {
  const { 
    aiCommentary, 
    aiRiskLevel, 
    aiEvent, 
    currentRound,
    updateAICommentary 
  } = useGameStore();
  
  const { status } = currentRound;
  
  useEffect(() => {
    updateAICommentary();
  }, [status]);
  
  const risk = riskConfig[aiRiskLevel];
  
  return (
    <div className="px-4 pb-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
      {/* Lady Milly Event Banner */}
      {aiEvent && (
        <div 
          className="mb-3 p-3 rounded-xl animate-fade-in-up flex items-center gap-3"
          style={{ 
            backgroundColor: `${eventColors[aiEvent.type]}15`,
            borderLeft: `4px solid ${eventColors[aiEvent.type]}`,
          }}
        >
          {(() => {
            const IconComponent = eventIcons[aiEvent.type];
            return <IconComponent className="w-5 h-5" style={{ color: eventColors[aiEvent.type] }} />;
          })()}
          <span className="text-sm font-semibold" style={{ color: eventColors[aiEvent.type] }}>
            {aiEvent.message}
          </span>
        </div>
      )}
      
      {/* Lady Milly Card */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Lady Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="18" fill="#5D4037"/>
                  <ellipse cx="20" cy="22" rx="11" ry="12" fill="#FFCCBC"/>
                  <ellipse cx="9" cy="22" rx="4" ry="9" fill="#5D4037"/>
                  <ellipse cx="31" cy="22" rx="4" ry="9" fill="#5D4037"/>
                  <path d="M8 16 Q12 8 20 8 Q28 8 32 16 Q30 12 20 14 Q10 12 8 16" fill="#5D4037"/>
                  <ellipse cx="15" cy="21" rx="2" ry="2.5" fill="#3E2723"/>
                  <ellipse cx="25" cy="21" rx="2" ry="2.5" fill="#3E2723"/>
                  <circle cx="15.5" cy="20.5" r="0.8" fill="white"/>
                  <circle cx="25.5" cy="20.5" r="0.8" fill="white"/>
                  <path d="M12 17.5 Q15 16 18 18" stroke="#5D4037" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <path d="M22 18 Q25 16 28 17.5" stroke="#5D4037" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <path d="M20 23.5 Q19 25 20 26" stroke="#D7A98E" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <path d="M14 29 Q20 33 26 29" stroke="#E57373" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="12" cy="26" r="2.5" fill="#F8BBD9" opacity="0.5"/>
                  <circle cx="28" cy="26" r="2.5" fill="#F8BBD9" opacity="0.5"/>
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                Lady Milly is watching…
              </span>
            </div>
          </div>
          
          {/* Risk Level Indicator */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: risk.bg }}
          >
            {aiRiskLevel === 'HIGH' && (
              <AlertTriangle className="w-3 h-3" style={{ color: risk.color }} />
            )}
            <span 
              className="text-xs font-bold"
              style={{ color: risk.color }}
            >
              {risk.label} RISK
            </span>
          </div>
        </div>
        
        {/* Lady Milly's Message */}
        <div className="pl-1">
          <p className="text-sm font-medium italic text-[var(--text)]">
            "{aiCommentary}"
          </p>
        </div>
        
        {/* Status Bar */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Lady Milly</span>
          <span>Updates live</span>
        </div>
      </div>
    </div>
  );
}