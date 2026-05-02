import { useCallback, useEffect, useRef } from 'react';
import { useGameStore, MillyMood } from '../store/gameStore';
import { useGame } from './useGame';

// Knowledge base for Milly
const KNOWLEDGE = {
  project: {
    name: 'Million Pot Game',
    builder: 'Thiego Perez',
    event: 'hackathon',
    stack: '0G Labs with iterative AI prompting'
  },
  
  game: {
    concept: 'A precision-based Web3 game where players try to make a crypto pot reach exactly $1,000,000.',
    target: '$1,000,000',
    winCondition: 'pot reaches exactly $1,000,000',
    failCondition: 'pot goes above $1,000,000'
  },
  
  rounds: {
    description: 'Each round is independent. When one fails, a new round starts automatically.',
    refundLogic: 'Players can claim refunds from failed rounds while new rounds are active.'
  },
  
  milly: {
    role: 'AI Game Master who explains the game, answers questions, and gives live commentary.',
    purpose: 'To help players understand the mechanics without giving financial advice.'
  }
};

// Response templates organized by intent
const RESPONSES = {
  // Project origin questions
  builder: [
    "Million Pot Game was created by Thiego Perez during the hackathon. 🎮",
    "Thiego Perez built this during the hackathon using 0G Labs and AI prompting.",
    "This project was made by Thiego Perez at the hackathon. Pretty cool, right?"
  ],
  
  howBuilt: [
    "Thiego built this step by step using AI prompting with 0G Labs. It started as a simple jackpot idea and evolved into a precision game with refunds and multiple rounds.",
    "This project was built iteratively during the hackathon. Each AI prompt added features: first the pot, then refunds, then rounds, and finally me, Milly!",
    "Using 0G Labs and AI prompting, Thiego turned a simple Web3 idea into a full game with refund logic, multiple rounds, and an AI assistant."
  ],
  
  why0G: [
    "0G Labs provides fast, low-cost transactions perfect for a game like this. Plus, building on 0G during the hackathon gave access to great tooling.",
    "0G Labs was chosen for its performance and hackathon support. The chain handles game logic smoothly!",
    "0G Labs offers the speed and cost efficiency needed for a real-time game with refunds and multiple rounds."
  ],
  
  // Game mechanics
  explain: [
    "🎯 Here's how it works:\n\n1. Connect your wallet\n2. Add crypto to the pot\n3. Goal: hit exactly $1,000,000\n4. Exact hit = WIN!\n5. Go over = round fails\n\nFailed rounds? Claim your refund.",
    "Players add crypto to push the pot toward exactly $1,000,000. Hit it exactly and you win! Go over? The round fails, but you can claim a refund.",
    "Think of it like a precision game. The pot needs to land exactly on $1,000,000. If it crosses above, the round fails and refunds unlock."
  ],
  
  win: [
    "To win, your deposit must make the pot hit exactly $1,000,000. Not $999,999, not $1,000,001 — exactly one million! 🎯",
    "Be the last depositor when the pot reaches precisely $1,000,000 USD value. It's all about timing and precision!",
    "Win by making the pot land on exactly $1M. Go over and the round fails instead."
  ],
  
  fail: [
    "If the pot goes above $1,000,000, the round fails. Don't worry — you can claim a refund from that round anytime.",
    "Going over $1M means the round fails. But players can claim refunds from failed rounds while new rounds run.",
    "Cross above $1,000,000 = failed round. The good news? Refunds are available for all deposits in that round."
  ],
  
  refund: [
    "When a round fails, your deposits stay tracked. Scroll to 'Previous Rounds' and click 'Claim Refund' to get your crypto back.",
    "Failed rounds allow refunds! Just find the round in your history and claim what you deposited.",
    "You can't lose your deposit in failed rounds — just claim your refund from the Previous Rounds section."
  ],
  
  rounds: [
    "Each round is separate. When one fails, a new round starts automatically. You can claim refunds from old rounds while playing new ones.",
    "Rounds are independent. Round 1 fails? Round 2 starts. Refunds from Round 1? Still claimable.",
    "Multiple rounds can exist: one active, others failed. Play the active one, claim refunds from the failed ones."
  ],
  
  // Risk and safety
  risk: [
    "This is a game prototype. In failed rounds, you can claim refunds. But remember: Milly doesn't give financial advice! 🎮",
    "The game logic protects players with refunds on failed rounds. This is entertainment, not investment. Play responsibly!",
    "Milly's job is to explain mechanics, not give financial advice. The refund system helps, but always play within your limits."
  ],
  
  safe: [
    "Is it safe? The refund logic protects your deposits in failed rounds. But this is a prototype game — never deposit more than you're okay with losing.",
    "The smart contract logic allows refunds for failed rounds. That said, Milly can't promise anything — this is a game, not financial advice!",
    "Safety-wise: failed rounds = refunds available. But this is experimental tech. Play for fun, not profit expectations."
  ],
  
  // Milly identity
  whoIsMilly: [
    "I'm Milly! 🤖 Your AI Game Master. I explain the game, answer questions, and give live commentary. But I never give financial advice!",
    "Milly here! Created during the hackathon to help players understand the game. Think of me as your game guide.",
    "I'm Milly, the AI Game Master of Million Pot Game. I'm here to help you navigate the game — no financial advice, just game mechanics!"
  ],
  
  whyMilly: [
    "Thiego built me to make the game easier to understand. I explain rules, track rounds, and keep things fun!",
    "I exist to help players. The game has moving parts — refunds, rounds, precision targets — and I make it all clearer.",
    "An AI Game Master makes the experience smoother. I'm like a helpful NPC who actually knows what's happening! 🎮"
  ],
  
  // Different / unique
  different: [
    "Most crypto games are about luck. This one's about precision. Hit exactly $1M or fail — no randomness, just timing.",
    "What's different? Exact target, refund protection, multiple rounds, and an AI assistant (me!). Most jackpots don't have any of that.",
    "Precision + refunds + rounds + AI. Not your typical 'deposit and pray' game. Here, skill and timing actually matter."
  ],
  
  // Default / fallback
  default: [
    "Hmm, I'm not sure I understood that. Try asking about the rules, how to win, refunds, or who built this game!",
    "Interesting question! I focus on game mechanics, rounds, refunds, and project info. What would you like to know?",
    "Milly's still learning! Ask me about the game rules, winning conditions, refunds, or how this project was built."
  ],
  
  // Short responses for quick questions
  short: {
    name: "Million Pot Game! 🎯",
    target: "The target is exactly $1,000,000 USD.",
    win: "Hit exactly $1,000,000 and you win!",
    fail: "Go above $1M and the round fails.",
    refund: "Failed rounds let you claim refunds.",
    builder: "Built by Thiego Perez at the hackathon.",
    tech: "Built on 0G Labs with AI prompting."
  }
};

// Intent detection keywords
const INTENTS = {
  builder: ['who made', 'who built', 'who created', 'creator', 'author', 'made this', 'built this', 'created this', 'thiego', 'perez'],
  howBuilt: ['how was', 'how did', 'how built', 'how made', 'built with', 'made with', 'tech stack', 'technology', 'how it work', 'ai prompting', 'iterative'],
  why0G: ['why 0g', 'why this chain', 'why 0g labs', 'why blockchain', 'why the', 'chose 0g', 'using 0g'],
  explain: ['how does', 'how do', 'explain', 'how it works', 'how this works', 'rules', 'how to play', 'what is', 'tell me about'],
  win: ['how to win', 'how win', 'win condition', 'how do i win', 'what wins', 'winning', 'how can i win'],
  fail: ['what happens if', 'what if', 'goes over', 'above', 'passes', 'crosses', 'exceeds', 'fails', 'fail', 'over 1m', 'above 1m', 'too much'],
  refund: ['refund', 'get money back', 'money back', 'claim', 'get my', 'return', 'reimburse'],
  rounds: ['round', 'rounds', 'new round', 'multiple', 'previous', 'next round'],
  risk: ['risk', 'lose', 'losing', 'dangerous', 'safe to', 'can i lose', 'will i lose', 'lose money'],
  safe: ['is it safe', 'safe', 'secure', 'trust', 'legit', 'scam', 'honest'],
  whoIsMilly: ['who are you', 'who is milly', 'what are you', 'milly', 'your name', 'what is milly', 'are you ai', 'are you a bot'],
  whyMilly: ['why you', 'why milly', 'why an ai', 'why game master', 'purpose', 'why exist'],
  different: ['different', 'unique', 'special', 'why this', 'compared to', 'better than', 'unlike'],
  short: ['target', 'goal', 'aim', 'name', 'called']
};

// Detect intent from user message
function detectIntent(message: string): string {
  const lower = message.toLowerCase().trim();
  
  // Check for very short messages
  if (lower.split(' ').length <= 2) {
    for (const keyword of INTENTS.short) {
      if (lower.includes(keyword)) {
        return 'short';
      }
    }
  }
  
  // Check each intent category
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (intent === 'short') continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return intent;
      }
    }
  }
  
  // Check for specific number patterns
  if (lower.includes('1m') || lower.includes('1 million') || lower.includes('million')) {
    if (lower.includes('over') || lower.includes('above') || lower.includes('cross')) {
      return 'fail';
    }
    return 'win';
  }
  
  return 'default';
}

// Get response for intent
function getResponse(intent: string, message: string, context: { distance: number; roundId: number; status: string }): string {
  const lower = message.toLowerCase().trim();
  
  // Handle short messages specifically
  if (intent === 'short') {
    if (lower.includes('target') || lower.includes('goal')) return RESPONSES.short.target;
    if (lower.includes('name') || lower.includes('called')) return RESPONSES.short.name;
    if (lower.includes('win') && lower.length < 10) return RESPONSES.short.win;
    if (lower.includes('fail')) return RESPONSES.short.fail;
    if (lower.includes('refund')) return RESPONSES.short.refund;
    if (lower.includes('built') || lower.includes('made')) return RESPONSES.short.builder;
  }
  
  // Get responses for intent
  const responses = RESPONSES[intent as keyof typeof RESPONSES];
  
  if (Array.isArray(responses)) {
    // Add context for certain intents
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Add round context for relevant questions
    if (['fail', 'refund', 'rounds'].includes(intent)) {
      if (context.status === 'failed') {
        response += ` Right now, Round #${context.roundId - 1} failed and Round #${context.roundId} is active.`;
      }
    }
    
    return response;
  }
  
  return RESPONSES.default[Math.floor(Math.random() * RESPONSES.default.length)];
}

const getMoodFromDistance = (distance: number, status: string): MillyMood => {
  if (status === 'failed') return 'danger';
  if (status === 'won') return 'calm';
  if (distance < 10000) return 'danger';
  if (distance < 50000) return 'close';
  return 'calm';
};

const getMoodMessage = (mood: MillyMood, status: string, roundId: number, distance: number): string => {
  if (status === 'failed') {
    return `❌ Round #${roundId - 1} ended. Round #${roundId} is live. Claim refunds below!`;
  }
  if (status === 'won') {
    return `🎉 Round #${roundId} winner! The pot hit exactly $1,000,000!`;
  }
  
  const formatted = distance >= 1000000 
    ? `$${(distance / 1000000).toFixed(2)}M` 
    : `$${distance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  
  const messages = {
    calm: [
      `Round #${roundId} is steady. ${formatted} to go.`,
      `Calm waters in Round #${roundId}. Target: exactly $1M.`,
      `Round #${roundId} progressing. ${formatted} away from the target.`
    ],
    close: [
      `🔥 Round #${roundId} heating up! ${formatted} to $1M!`,
      `Getting close! ${formatted} left in Round #${roundId}.`,
      `Round #${roundId} intensifying. Don't overshoot!`
    ],
    danger: [
      `⚠️ Round #${roundId} critical! Only ${formatted} away!`,
      `DANGER ZONE! ${formatted} to exactly $1M! Precision time!`,
      `Round #${roundId} edge! One wrong move = failed round!`
    ]
  };
  return messages[mood][Math.floor(Math.random() * messages[mood].length)];
};

export function useMilly() {
  const {
    millyMessages, millyInput, millyMood, isMillyLoading,
    distanceToMilestone, currentRoundId,
    addMillyMessage, setMillyInput, setMillyMood, setMillyLoading
  } = useGameStore();
  
  const { currentRound } = useGame();
  
  const lastMoodRef = useRef<MillyMood>(millyMood);
  
  // Update mood based on distance
  useEffect(() => {
    const distance = parseFloat(distanceToMilestone);
    const status = currentRound?.status || 'active';
    const newMood = getMoodFromDistance(distance, status);
    
    if (newMood !== lastMoodRef.current) {
      setMillyMood(newMood);
      lastMoodRef.current = newMood;
    }
  }, [distanceToMilestone, currentRound?.status, setMillyMood]);
  
  // Generate contextual response
  const generateResponse = useCallback((message: string): string => {
    const intent = detectIntent(message);
    const context = {
      distance: parseFloat(distanceToMilestone),
      roundId: currentRoundId,
      status: currentRound?.status || 'active'
    };
    
    return getResponse(intent, message, context);
  }, [distanceToMilestone, currentRoundId, currentRound?.status]);
  
  // Send message
  const sendMessage = useCallback(async (message?: string) => {
    const text = message || millyInput.trim();
    if (!text || isMillyLoading) return;
    
    addMillyMessage({ role: 'user', content: text });
    setMillyInput('');
    setMillyLoading(true);
    
    // Simulate thinking
    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
    
    const response = generateResponse(text);
    addMillyMessage({ role: 'milly', content: response });
    setMillyLoading(false);
  }, [millyInput, isMillyLoading, addMillyMessage, setMillyInput, setMillyLoading, generateResponse]);
  
  const status = currentRound?.status || 'active';
  const dynamicMessage = getMoodMessage(millyMood, status, currentRoundId, parseFloat(distanceToMilestone));
  
  return {
    messages: millyMessages,
    inputValue: millyInput,
    setInputValue: setMillyInput,
    mood: millyMood,
    dynamicMessage,
    isLoading: isMillyLoading,
    sendMessage
  };
}
