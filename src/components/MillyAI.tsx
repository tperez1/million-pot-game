import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatUSD } from '../utils/format';
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

export default function MillyAI() {
  const { currentRound, ogPrice, priceChange } = useGameStore();
  const { potUSDValue, target, status, roundNumber } = currentRound;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const distanceToTarget = target - potUSDValue;
  const progressPercent = (potUSDValue / target) * 100;
  
  const getMood = (): Mood => {
    if (distanceToTarget < 10000) return 'danger';
    if (distanceToTarget < 50000) return 'close';
    return 'calm';
  };
  
  const mood = status !== 'ACTIVE' ? 'calm' : getMood();
  const moodInfo = moodConfig[mood];
  const MoodIcon = moodInfo.icon;
  
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = generateGreeting();
      setMessages([{
        id: 'greeting',
        text: greeting,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, []);
  
  function generateGreeting(): string {
    const greetings = [
      `Hey there! I'm Milly, your game guide. The pot is at ${formatUSD(potUSDValue)} — we're ${progressPercent.toFixed(1)}% of the way to $1M! Ask me anything about the game.`,
      `Welcome! I'm Milly. We've got ${formatUSD(potUSDValue)} in the pot right now. That's ${progressPercent.toFixed(1)}% progress. Feeling lucky?`,
      `Hi! Milly here. Current pot: ${formatUSD(potUSDValue)}. Distance to win: ${formatUSD(distanceToTarget)}. I'm here to help!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  function generateResponse(question: string): string {
    const q = question.toLowerCase();
    
    if (q.includes('explain') || q.includes('how does') || q.includes('how it work')) {
      return "Simple! Deposit 0G tokens to add to the pot. If your deposit makes the pot hit EXACTLY $1,000,000, you win $1M! But go over, and the round fails. 🎯";
    }
    
    if (q.includes('how to win') || q.includes('how do i win') || q.includes('win')) {
      return "To win, your deposit needs to make the pot land exactly on $1,000,000 USD. Watch the 0G price — timing is everything! 💰";
    }
    
    if (q.includes('how close') || q.includes('close are we') || q.includes('distance')) {
      const dist = formatUSD(Math.abs(distanceToTarget));
      if (distanceToTarget < 10000) {
        return `So close! Only ${dist} to go! But be careful — overshooting fails the round. Watch that 0G price! 😬`;
      }
      if (distanceToTarget < 50000) {
        return `We're getting there! ${dist} away. The 0G price volatility makes every deposit exciting! 🎲`;
      }
      return `Currently ${dist} from the target. We're at ${progressPercent.toFixed(1)}% progress. Plenty of room! 📈`;
    }
    
    if (q.includes('deposit now') || q.includes('happens if i deposit') || q.includes('what if i add')) {
      if (status !== 'ACTIVE') {
        return `Round #${roundNumber} is ${status}. Check the status to see what happened!`;
      }
      if (distanceToTarget < 10000) {
        return `Careful! We're super close. A deposit now could win $1M or fail the round. The 0G price will determine your fate! ⚡`;
      }
      return `Right now, a deposit would add to the pot. We need ${formatUSD(distanceToTarget)} to hit $1M. Watch the 0G price for best timing!`;
    }
    
    if (q.includes('exceed') || q.includes('overflow') || q.includes('over') || q.includes('goes above')) {
      return "If the pot exceeds $1,000,000, the round fails — no winner. But don't worry, everyone can claim refunds for their 0G deposits! 🔄";
    }
    
    if (q.includes('refund') || q.includes('get my') || q.includes('money back')) {
      return "If a round fails, all participants can claim a full refund of their 0G tokens from the Round History. Your tokens are safe! 🛡️";
    }
    
    if (q.includes('history') || q.includes('past') || q.includes('previous')) {
      return "Check the Round History below! You'll see all past rounds, winners, and failed attempts. Failed rounds show refund status too. 📜";
    }
    
    if (q.includes('price') || q.includes('0g') || q.includes('oracle') || q.includes('volatility')) {
      const change = priceChange >= 0 ? 'up' : 'down';
      return `The 0G price is $${ogPrice.toFixed(4)} (${change} ${Math.abs(priceChange).toFixed(2)}%). It updates live every 5 seconds. Pot value changes with it! 📊`;
    }
    
    if (q.includes('who built') || q.includes('who made') || q.includes('creator') || q.includes('who are you')) {
      return "I'm Milly, the Game Master! This game was built by Thiego Perez during a hackathon using AI tools like 0G Labs. Cool, right? 🤖";
    }
    
    if (q.includes('thiego') || q.includes('perez')) {
      return "Thiego Perez is the developer who built this game during a hackathon! He used 0G Labs AI tools to create me and the whole game. 🧑‍💻";
    }
    
    if (q.includes('should i') || q.includes('advice') || q.includes('recommend') || q.includes('profit')) {
      return "I can't give financial advice, but I can say: understand the 0G price, watch the pot closely, and only play what you can afford. Have fun! 🎮";
    }
    
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hey! Great to see you. The pot is at ${formatUSD(potUSDValue)} right now. What would you like to know? 😊`;
    }
    
    if (q.includes('thank') || q.includes('thx')) {
      return "You're welcome! Good luck out there! 🍀";
    }
    
    return "Hmm, I'm not sure about that one. Try asking about the game rules, how to win, refunds, or who built this game! 🤔";
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
      const response