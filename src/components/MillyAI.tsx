import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatUSD, safeNumber } from '../utils/format';
import { Send, AlertCircle, CheckCircle, Zap } from 'lucide-react';

type Mood = 'calm' | 'close' | 'danger';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const moodConfig: Record<Mood, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  calm: { color: 'var(--success)', bg: 'rgba(22, 163, 74, 0.1)', icon: CheckCircle, label: 'Calm' },
  close: { color: 'var(--warning)', bg: 'rgba(217, 119, 6, 0.1)', icon: Zap, label: 'Close' },
  danger: { color: 'var(--error)', bg: 'rgba(220, 38, 38, 0.1)', icon: AlertCircle, label: 'Danger' },
};

// Response arrays for variety
const winResponses = [
  "You win by hitting exactly $1,000,000. Not a penny more, not a penny less! 🎯",
  "The goal is precision. Exactly one million — that's your target! 💰",
  "Hit the target perfectly and $1,000,000 is yours. Precision is everything!",
  "Make the pot land exactly on $1M USD. That's the winning move! 🏆",
];

const loseResponses = [
  "If the pot goes over $1,000,000, the round fails. Game over, but refunds available!",
  "Overflow = failed round. But hey, you can claim your 0G back in Round History!",
  "Too much in the pot and it fails. The good news? Refunds are always available. 🔄",
  "Exceeding the target ends the round. No winner, but everyone gets refunded!",
];

const refundResponses = [
  "Failed rounds let you claim your 0G back! Check Round History for the refund button. 🛡️",
  "When a round fails, your tokens aren't lost — claim them back from history!",
  "Refunds are always available for failed rounds. Your 0G stays safe!",
];

const creatorResponses = [
  "Thiego Perez built this game during a hackathon using 0G Labs AI tools. Pretty cool, right? 🧑‍💻",
  "This was created by Thiego Perez at a hackathon! He used 0G Labs to build it. 🤖",
  "A hackathon project by Thiego Perez, powered by 0G Labs AI tools!",
];

const howWorksResponses = [
  "Deposit 0G tokens to grow the pot. Hit exactly $1M to win. Go over? Round fails! 🎮",
  "Simple concept: add 0G, try to hit $1,000,000 exactly. Volatility makes it tricky!",
  "The game is all about timing. Deposit 0G, watch the price, aim for precision!",
];

const whatIsThisResponses = [
  "This is Million Dollar — a game where precision wins $1,000,000! 🎯",
  "A pot-building game. Hit exactly $1M USD to win big!",
  "The ultimate precision game. Deposit 0G, hit $1M exactly, win $1M!",
];

const depositResponses = [
  "Your deposit adds 0G to the pot at the current oracle price. Timing matters! ⏱️",
  "When you deposit, your 0G gets converted to USD value. The pot grows from there!",
  "Adding 0G increases the pot. The USD value depends on the live oracle price!",
];

const shouldIResponses = [
  "I can't tell you what to do, but I can say: watch the 0G price closely! 👀",
  "No financial advice here, but understanding the oracle timing helps!",
  "I'm not a financial advisor, but I'd say: only play what you can afford!",
];

const dangerResponses = [
  "Careful now… this is where things get risky! 😬",
  "We're in the danger zone! One wrong move and the round fails!",
  "Precision is everything here. The margin for error is tiny!",
  "Danger territory! A small deposit could win — or fail the round!",
];

const closeResponses = [
  "We're getting close! Exciting times! 🎲",
  "Almost there! The tension is building!",
  "Closing in on the target. Every deposit counts now!",
  "The pot is getting warm. Who's gonna make the move?",
];

const farResponses = [
  "Plenty of room to work with. The game is wide open!",
  "Early days! Lots of space before we hit the danger zone.",
  "Safe territory. The target is still far away!",
];

const greetings = [
  "Hey there! I'm Milly, your game guide. Ask me anything! 😊",
  "Hi! Milly here. Ready to help you understand the game!",
  "Welcome! Got questions? I've got answers! 🎮",
  "Hey! Milly at your service. What do you want to know?",
];

const fallbackResponses = [
  "Hmm, I'm not sure about that one. Try asking about winning, refunds, or how the game works! 🤔",
  "That's a new one! Ask me about the game rules, winning, or refunds!",
  "Interesting question! I'm best at game questions — try asking about how to play!",
];

const thanksResponses = [
  "You're welcome! Good luck out there! 🍀",
  "Anytime! Go get 'em! 💪",
  "Happy to help! Have fun! 🎉",
];

const priceResponses = [
  "The 0G price updates every 5 seconds from the oracle. Watch it closely! 📊",
  "Live oracle price drives the pot value. Volatility is the name of the game!",
  "Price changes = pot value changes. That's what makes this exciting!",
];

export default function MillyAI() {
  const { currentRound, ogPrice, priceChange } = useGameStore();
  const { potUSDValue, target, status, roundNumber } = currentRound;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const distanceToTarget = target - potUSDValue;
  const progressPercent = (potUSDValue / target) * 100;
  
  const getMood = (): Mood => {
    if (status !== 'ACTIVE') return 'calm';
    if (distanceToTarget < 10000) return 'danger';
    if (distanceToTarget < 50000) return 'close';
    return 'calm';
  };
  
  const mood = getMood();
  const moodInfo = moodConfig[mood];
  const MoodIcon = moodInfo.icon;
  
  const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  useEffect(() => {
    if (messages.length === 0) {
      const stateInfo = getContextState();
      const greeting = `Hey there! I'm Milly. ${stateInfo} What would you like to know?`;
      setMessages([{
        id: 'greeting',
        text: greeting,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, []);
  
  function getContextState(): string {
    if (status === 'WON') {
      return `Round #${roundNumber} was won! Winner took $1,000,000.`;
    }
    if (status === 'FAILED') {
      return `Round #${roundNumber} failed. Refunds available in history.`;
    }
    if (distanceToTarget < 10000) {
      return `We're SO close — only ${formatUSD(distanceToTarget)} to go!`;
    }
    if (distanceToTarget < 50000) {
      return `Getting close! ${formatUSD(distanceToTarget)} from the target.`;
    }
    return `Pot is at ${formatUSD(potUSDValue)}. We're ${progressPercent.toFixed(1)}% of the way!`;
  }
  
  function containsKeywords(text: string, keywords: string[]): boolean {
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  }
  
  function generateResponse(question: string): string {
    const q = question.toLowerCase();
    
    if (containsKeywords(q, ['hello', 'hi', 'hey', 'howdy', 'yo', 'sup'])) {
      return randomPick(greetings);
    }
    
    if (containsKeywords(q, ['thank', 'thx', 'thanks', 'appreciate'])) {
      return randomPick(thanksResponses);
    }
    
    if (containsKeywords(q, ['what is this', 'what is the game', 'how does this work', 'how it work', 'game rules', 'explain the game', 'how do i play'])) {
      return randomPick(howWorksResponses);
    }
    
    if (containsKeywords(q, ['what is', 'what are we', "what's this"])) {
      return randomPick(whatIsThisResponses);
    }
    
    if (containsKeywords(q, ['how to win', 'how do i win', 'how can i win', 'win the game', 'winning', 'goal', 'target', 'objective'])) {
      return randomPick(winResponses);
    }
    
    if (containsKeywords(q, ['fail', 'lose', 'what happens if', 'overflow', 'over the', 'exceed', 'goes above', 'go over', 'what if it', 'too much'])) {
      return randomPick(loseResponses);
    }
    
    if (containsKeywords(q, ['refund', 'money back', 'get back', 'claim', 'get my', 'return', 'reimburse'])) {
      return randomPick(refundResponses);
    }
    
    if (containsKeywords(q, ['who built', 'who made', 'creator', 'developer', 'thiego', 'perez', 'who created', 'who developed'])) {
      return randomPick(creatorResponses);
    }
    
    if (containsKeywords(q, ['should i', 'advice', 'recommend', 'invest', 'profit', 'good idea', 'worth it'])) {
      return randomPick(shouldIResponses);
    }
    
    if (containsKeywords(q, ['deposit', 'add money', 'add funds', 'how to add', 'how deposit', 'what happens if i deposit'])) {
      if (status === 'FAILED') {
        return "This round has failed. Wait for the next round to deposit!";
      }
      if (status === 'WON') {
        return "This round was won! Wait for the next round to play.";
      }
      if (distanceToTarget < 10000) {
        return `${randomPick(depositResponses)} We're super close — ${formatUSD(distanceToTarget)} away. High stakes!`;
      }
      return randomPick(depositResponses);
    }
    
    if (containsKeywords(q, ['price', 'oracle', '0g price', 'cost', 'value', 'volatility'])) {
      const direction = priceChange >= 0 ? 'up' : 'down';
      return `Current 0G price: $${ogPrice.toFixed(4)} (${direction} ${Math.abs(priceChange).toFixed(2)}%). ${randomPick(priceResponses)}`;
    }
    
    if (containsKeywords(q, ['how close', 'close are', 'distance', 'far', 'progress', 'how much more', 'how far', 'remaining'])) {
      if (status === 'WON') {
        return "This round was won! Check Round History for details.";
      }
      if (status === 'FAILED') {
        return "This round failed. Check Round History for refunds.";
      }
      if (distanceToTarget < 10000) {
        return randomPick(dangerResponses);
      }
      if (distanceToTarget < 50000) {
        return `We're ${formatUSD(distanceToTarget)} away. ${randomPick(closeResponses)}`;
      }
      return `Still ${formatUSD(distanceToTarget)} to go. ${randomPick(farResponses)}`;
    }
    
    if (containsKeywords(q, ['status', 'round status', 'what round', 'current round', 'round number'])) {
      if (status === 'WON') {
        return `Round #${roundNumber} was won! Check history for the winner.`;
      }
      if (status === 'FAILED') {
        return `Round #${roundNumber} failed. Refunds available in Round History.`;
      }
      return `Round #${roundNumber} is active! Pot: ${formatUSD(potUSDValue)}. ${formatUSD(distanceToTarget)} to go.`;
    }
    
    if (containsKeywords(q, ['history', 'past round', 'previous', 'earlier', 'won round', 'failed round'])) {
      return "Check below for Round History! You'll see all past rounds, winners, and refund options. 📜";
    }
    
    if (containsKeywords(q, ['who are you', 'what are you', 'your name', 'milly'])) {
      return "I'm Milly, the Game Master! I help players understand the game. Ask me anything! 🤖";
    }
    
    if (containsKeywords(q, ['good luck', 'wish me', 'luck'])) {
      return "Good luck! Precision is key — you've got this! 🍀";
    }
    
    if (containsKeywords(q, ['help', 'what can you', 'questions'])) {
      return "I can answer questions about winning, refunds, game rules, 0G price, or round status. Pick a topic! 💡";
    }
    
    return randomPick(fallbackResponses);
  }
  
  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateResponse(text);
      const millyMsg: Message = {
        id: `milly-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, millyMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };
  
  const handleSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };
  
  const suggestions = [
    "How do I win?",
    "How close are we?",
    "What if I deposit now?",
  ];
  
  return (
    <div className="px-4 pb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <div>
                <h3 className="font-bold">Milly — Game Master</h3>
                <p className="text-xs text-[var(--muted)]">Ask me anything about the game</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: moodInfo.bg }}
            >
              <MoodIcon className="w-4 h-4" style={{ color: moodInfo.color }} />
              <span className="text-xs font-semibold" style={{ color: moodInfo.color }}>
                {moodInfo.label}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 h-48 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.isUser 
                    ? 'bg-[var(--accent)] text-white rounded-br-sm' 
                    : 'bg-[var(--bg)] border border-[var(--border)] rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-2xl bg-[var(--bg)] border border-[var(--border)] rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestion(suggestion)}
                disabled={isTyping}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 pt-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Milly..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}