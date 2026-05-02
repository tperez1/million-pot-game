import { create } from 'zustand';
import { safeNumber } from '../utils/format';

interface Contribution {
  id: string;
  address: string;
  ogAmount: number;
  usdValueAtDeposit: number;
  timestamp: Date;
  refunded: boolean;
}

export interface Round {
  id: string;
  roundNumber: number;
  potOGAmount: number;
  potUSDValue: number;
  target: number;
  status: 'ACTIVE' | 'WON' | 'FAILED';
  winner: string | null;
  winnerPayout: number;
  contributions: Contribution[];
  createdAt: Date;
  endedAt: Date | null;
}

interface AIEvent {
  id: string;
  type: 'market_pump' | 'volatility_spike' | 'whale_activity' | 'price_alert' | 'milestone_close';
  message: string;
  timestamp: Date;
}

interface GameState {
  ogPrice: number;
  priceChange: number;
  priceHistory: { price: number; timestamp: number }[];
  isPriceLoading: boolean;
  lastPriceUpdate: number | null;
  currentRound: Round;
  roundHistory: Round[];
  isConnected: boolean;
  walletAddress: string | null;
  walletType: 'metamask' | 'rabby' | null;
  showWalletModal: boolean;
  showAddMoneyModal: boolean;
  addMoneyStep: 'input' | 'confirm' | 'processing' | 'success' | 'won' | 'failed';
  contributionAmount: string;
  
  aiCommentary: string;
  aiRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  aiEvent: AIEvent | null;
  
  updatePriceFromOracle: () => void;
  updateAICommentary: () => void;
  generateAIEvent: () => void;
  connectWallet: (type: 'metamask' | 'rabby') => void;
  disconnectWallet: () => void;
  setShowWalletModal: (show: boolean) => void;
  setShowAddMoneyModal: (show: boolean) => void;
  setAddMoneyStep: (step: 'input' | 'confirm' | 'processing' | 'success' | 'won' | 'failed') => void;
  setContributionAmount: (amount: string) => void;
  addContribution: (ogAmount: number) => void;
  claimRefund: (roundId: string) => void;
  startNewRound: () => void;
  resetModals: () => void;
}

const TARGET = 1000000;

const createNewRound = (roundNumber: number): Round => ({
  id: `round-${Date.now()}`,
  roundNumber: safeNumber(roundNumber, 1),
  potOGAmount: 0,
  potUSDValue: 0,
  target: TARGET,
  status: 'ACTIVE',
  winner: null,
  winnerPayout: 0,
  contributions: [],
  createdAt: new Date(),
  endedAt: null,
});

const initialRoundHistory: Round[] = [
  {
    id: 'round-history-1',
    roundNumber: 3,
    potOGAmount: 2500000,
    potUSDValue: 1000000,
    target: TARGET,
    status: 'WON',
    winner: '0x1a2b...9f8e',
    winnerPayout: 1000000,
    contributions: [],
    createdAt: new Date(Date.now() - 86400000 * 2),
    endedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'round-history-2',
    roundNumber: 2,
    potOGAmount: 2200000,
    potUSDValue: 1000050,
    target: TARGET,
    status: 'FAILED',
    winner: null,
    winnerPayout: 0,
    contributions: [
      { id: 'c1', address: '0x3d4e...5f6a', ogAmount: 1000, usdValueAtDeposit: 450, timestamp: new Date(Date.now() - 86400000 * 3), refunded: false },
      { id: 'c2', address: '0x7a8b...9c0d', ogAmount: 500, usdValueAtDeposit: 225, timestamp: new Date(Date.now() - 86400000 * 3), refunded: true },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
    endedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'round-history-3',
    roundNumber: 1,
    potOGAmount: 1800000,
    potUSDValue: 1000000,
    target: TARGET,
    status: 'WON',
    winner: '0x5e6f...1c2d',
    winnerPayout: 1000000,
    contributions: [],
    createdAt: new Date(Date.now() - 86400000 * 10),
    endedAt: new Date(Date.now() - 86400000 * 7),
  },
];

// Lady Milly's commentary
const commentaryLow = [
  "Relax… we're not even close yet.",
  "This is still boring, darling.",
  "Plenty of room… don't get excited.",
  "Oh, the anticipation… or lack thereof.",
  "Patience. The real game hasn't started.",
  "I'm watching, but there's nothing to see yet.",
];

const commentaryMedium = [
  "Now it's getting interesting…",
  "Careful. This is where people lose control.",
  "You're getting closer than you should.",
  "The tension is building… can you feel it?",
  "I'd start paying attention if I were you.",
  "Things are about to get… complicated.",
  "Don't get cocky. We're not there yet.",
];

const commentaryHigh = [
  "Oh… this is dangerous.",
  "One wrong move and it's over.",
  "Don't ruin it now…",
  "I wouldn't touch it if I were you.",
  "This is where heroes become zeros.",
  "So close… but so easy to destroy.",
  "Hold your breath, darling.",
  "The edge of glory… or disaster.",
];

const commentaryWon = [
  "Perfect. Finally someone understood the game.",
  "Now that was elegant.",
  "Impressive… I didn't expect that.",
  "Beautifully done. Someone has taste.",
  "Exquisite timing. Well played.",
];

const commentaryFailed = [
  "Well… that was predictable.",
  "Too greedy. Always the same story.",
  "Claim your refund and try again.",
  "Disappointing… but not surprising.",
  "And there it goes. Such a waste.",
  "I tried to warn you… sort of. Refunds available.",
];

const eventMessages = {
  market_pump: [
    "Oh my… the market is waking up.",
    "Someone's excited today…",
    "Green candles everywhere. How delightful.",
  ],
  volatility_spike: [
    "Things are getting… unstable.",
    "Hold on tight, darling.",
    "The oracle is feeling dramatic today.",
  ],
  whale_activity: [
    "A whale has entered the chat…",
    "Big money is making moves.",
    "Someone's feeling generous today.",
  ],
  price_alert: [
    "Price shift detected. Stay sharp.",
    "The oracle whispers…",
    "Change is coming, darling.",
  ],
  milestone_close: [
    "We're approaching the moment of truth.",
    "Almost there… how thrilling.",
    "The end is near. One way or another.",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const fetchOraclePrice = async (): Promise<{ price: number; change: number }> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const basePrice = 0.45;
  const volatility = (Math.random() - 0.5) * 0.02;
  const newPrice = Math.max(0.01, basePrice + volatility);
  const change = volatility / basePrice * 100;
  
  return { price: newPrice, change };
};

export const useGameStore = create<GameState>((set, get) => ({
  ogPrice: 0.45,
  priceChange: 0,
  priceHistory: [],
  isPriceLoading: true,
  lastPriceUpdate: null,
  currentRound: createNewRound(4),
  roundHistory: initialRoundHistory,
  isConnected: false,
  walletAddress: null,
  walletType: null,
  showWalletModal: false,
  showAddMoneyModal: false,
  addMoneyStep: 'input',
  contributionAmount: '',
  
  aiCommentary: "Welcome, darling. Let's see what you've got.",
  aiRiskLevel: 'LOW',
  aiEvent: null,

  updateAICommentary: () => {
    const state = get();
    const { potUSDValue, target, status } = state.currentRound;
    const distance = target - potUSDValue;
    
    let commentary: string;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    
    if (status === 'WON') {
      commentary = pickRandom(commentaryWon);
      riskLevel = 'LOW';
    } else if (status === 'FAILED') {
      commentary = pickRandom(commentaryFailed);
      riskLevel = 'LOW';
    } else if (distance < 10000) {
      commentary = pickRandom(commentaryHigh);
      riskLevel = 'HIGH';
    } else if (distance < 50000) {
      commentary = pickRandom(commentaryMedium);
      riskLevel = 'MEDIUM';
    } else {
      commentary = pickRandom(commentaryLow);
      riskLevel = 'LOW';
    }
    
    set({ aiCommentary: commentary, aiRiskLevel: riskLevel });
  },

  generateAIEvent: () => {
    const state = get();
    const { potUSDValue, target, status } = state.currentRound;
    const { priceChange } = state;
    const distance = target - potUSDValue;
    
    if (status !== 'ACTIVE') return;
    
    let eventType: keyof typeof eventMessages | null = null;
    
    if (Math.abs(priceChange) > 1.5) {
      eventType = priceChange > 0 ? 'market_pump' : 'volatility_spike';
    }
    
    if (distance < 10000 && Math.random() < 0.3) {
      eventType = 'milestone_close';
    }
    
    if (Math.random() < 0.1) {
      eventType = 'whale_activity';
    }
    
    if (Math.random() < 0.15) {
      eventType = 'price_alert';
    }
    
    if (eventType) {
      const event: AIEvent = {
        id: `event-${Date.now()}`,
        type: eventType,
        message: pickRandom(eventMessages[eventType]),
        timestamp: new Date(),
      };
      
      set({ aiEvent: event });
      
      setTimeout(() => set({ aiEvent: null }), 3000);
    }
  },

  updatePriceFromOracle: async () => {
    try {
      const { price, change } = await fetchOraclePrice();
      const state = get();
      const safeOGAmount = safeNumber(state.currentRound.potOGAmount, 0);
      const newUSDValue = safeOGAmount * price;
      
      const newPriceHistory = [
        { price, timestamp: Date.now() },
        ...state.priceHistory.slice(0, 59),
      ];
      
      set({
        ogPrice: price,
        priceChange: change,
        priceHistory: newPriceHistory,
        isPriceLoading: false,
        lastPriceUpdate: Date.now(),
        currentRound: {
          ...state.currentRound,
          potUSDValue: newUSDValue,
        },
      });
      
      get().updateAICommentary();
      get().generateAIEvent();
      
    } catch (error) {
      console.error('Oracle price update failed:', error);
      set({ isPriceLoading: false });
    }
  },

  connectWallet: (type) => {
    const mockAddress = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const shortAddress = mockAddress.slice(0, 6) + '...' + mockAddress.slice(-4);
    
    set({
      isConnected: true,
      walletAddress: shortAddress,
      walletType: type,
      showWalletModal: false,
    });
  },

  disconnectWallet: () => set({
    isConnected: false,
    walletAddress: null,
    walletType: null,
  }),

  setShowWalletModal: (show) => set({ showWalletModal: show }),
  
  setShowAddMoneyModal: (show) => set({ 
    showAddMoneyModal: show, 
    addMoneyStep: 'input',
    contributionAmount: '',
  }),
  
  setAddMoneyStep: (step) => set({ addMoneyStep: step }),
  
  setContributionAmount: (amount) => set({ contributionAmount: amount }),

  resetModals: () => set({
    showAddMoneyModal: false,
    addMoneyStep: 'input',
    contributionAmount: '',
  }),

  startNewRound: () => {
    const state = get();
    const newRoundNumber = safeNumber(state.currentRound.roundNumber, 0) + 1;
    set({
      currentRound: createNewRound(newRoundNumber),
    });
    get().updateAICommentary();
  },

  addContribution: (ogAmount: number) => {
    const state = get();
    const currentRound = state.currentRound;
    const { ogPrice } = state;
    
    if (currentRound.status !== 'ACTIVE') return;
    
    const safeOGAmount = safeNumber(ogAmount, 0);
    
    set({ addMoneyStep: 'processing' });
    
    setTimeout(() => {
      const usdValueAtDeposit = safeOGAmount * safeNumber(ogPrice, 0.45);
      const currentPotOG = safeNumber(currentRound.potOGAmount, 0);
      
      const newOGAmount = currentPotOG + safeOGAmount;
      const newUSDValue = newOGAmount * safeNumber(ogPrice, 0.45);
      
      const contribution: Contribution = {
        id: `contrib-${Date.now()}`,
        address: state.walletAddress || 'Unknown',
        ogAmount: safeOGAmount,
        usdValueAtDeposit: usdValueAtDeposit,
        timestamp: new Date(),
        refunded: false,
      };
      
      const isExactHit = Math.abs(newUSDValue - TARGET) < 0.01;
      const isOverflow = newUSDValue > TARGET && !isExactHit;
      
      if (isExactHit) {
        const endedRound: Round = {
          ...currentRound,
          potOGAmount: newOGAmount,
          potUSDValue: TARGET,
          status: 'WON',
          winner: state.walletAddress || 'Unknown',
          winnerPayout: 1000000,
          contributions: [...currentRound.contributions, contribution],
          endedAt: new Date(),
        };
        
        set({
          currentRound: createNewRound(safeNumber(currentRound.roundNumber, 0) + 1),
          roundHistory: [endedRound, ...state.roundHistory],
          addMoneyStep: 'won',
          contributionAmount: '',
        });
      } else if (isOverflow) {
        // Do NOT auto-refund - players must claim manually
        const endedRound: Round = {
          ...currentRound,
          potOGAmount: newOGAmount,
          potUSDValue: newUSDValue,
          status: 'FAILED',
          winner: null,
          winnerPayout: 0,
          contributions: [...currentRound.contributions, contribution],
          endedAt: new Date(),
        };
        
        set({
          currentRound: createNewRound(safeNumber(currentRound.roundNumber, 0) + 1),
          roundHistory: [endedRound, ...state.roundHistory],
          addMoneyStep: 'failed',
          contributionAmount: '',
        });
      } else {
        set({
          currentRound: {
            ...currentRound,
            potOGAmount: newOGAmount,
            potUSDValue: newUSDValue,
            contributions: [...currentRound.contributions, contribution],
          },
          addMoneyStep: 'success',
          contributionAmount: '',
        });
      }
      
      get().updateAICommentary();
    }, 2000);
  },

  claimRefund: (roundId: string) => {
    const state = get();
    const round = state.roundHistory.find(r => r.id === roundId);
    
    if (!round || round.status !== 'FAILED') return;
    if (!state.walletAddress) return;
    
    const updatedContributions = round.contributions.map(c => 
      c.address === state.walletAddress ? { ...c, refunded: true } : c
    );
    
    set({
      roundHistory: state.roundHistory.map(r => 
        r.id === roundId ? { ...r, contributions: updatedContributions } : r
      ),
    });
  },
}));
