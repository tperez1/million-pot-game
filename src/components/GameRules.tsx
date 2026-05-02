import { useState } from 'react';
import { ChevronDown, HelpCircle, Target, AlertTriangle, RotateCcw, Activity } from 'lucide-react';

export default function GameRules() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const rules = [
    {
      icon: Target,
      title: 'Hit $1M exactly',
      description: 'Win by reaching exactly $1,000,000 — not more.',
      color: 'var(--success)'
    },
    {
      icon: AlertTriangle,
      title: "Don't go over",
      description: 'If it passes $1M, the round fails.',
      color: 'var(--error)'
    },
    {
      icon: RotateCcw,
      title: 'Refund if failed',
      description: "Missed it? Claim your 0G back.",
      color: 'var(--warning)'
    },
    {
      icon: Activity,
      title: 'Price moves constantly',
      description: '0G price changes can shift the pot anytime.',
      color: 'var(--accent)'
    }
  ];
  
  return (
    <div className="px-4 pb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-[var(--accent-light)] transition-all group"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
          <span className="font-semibold">How it works</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in-up">
          {rules.map((rule, index) => (
            <div 
              key={index}
              className="p-3 glass rounded-xl"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${rule.color}15` }}
                >
                  <rule.icon className="w-5 h-5" style={{ color: rule.color }} />
                </div>
                <div>
                  <p className="font-bold text-sm">{rule.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{rule.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
