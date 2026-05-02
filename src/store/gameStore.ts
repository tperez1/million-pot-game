import { create } from 'zustand';

export interface Winner {
  address: string;
  prize: string;
  milestone: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'milly';
  content: string;
  timestamp: number;
}

export interface Round {
  id: number;
  status: 'active' | 'won' | 'failed';
  potUsdValue: string;
  potBalance: string;
  winner: string | null;
  winnerAmount: string;
  lastContributor: string;
  lastContributionAmount: string;
  contributorCount: number;
  createdAt: number;
  endedAt: number | null;
  userDeposits: string;
  hasClaimedRefund: boolean;
}

export type MillyMood = 'calm' | 'close' | 'danger';

export interface GameState {
  address: string | null;
  isConnecting: boolean;
  chainId: number | null;
  balance: string;
  
  rounds: Round[];
  currentRoundId: number;
  
  totalBalance: string;
  usdValue: string;
  currentMilestone: number;
  nextMilestoneTarget: string;
  distanceToMilestone: string;
  lastContributor: string;
  lastContributionAmount: string;
  latestWinner: string;
  latestWinAmount: string;
  latestWinMilestone: number;
  winnerHistory: Winner[];
  contributorCount: number;
  
  contributionAmount: string;
  isSubmitting: boolean;
  showHistory: boolean;
  isDark: boolean;
  
  // Milly state
  millyMessages: ChatMessage[];
  millyInput: string;
  millyMood: MillyMood;
  isMillyLoading: boolean;
  millyCollapsed: boolean;
  millyCompact: boolean;
  millyHasUnread: boolean;
  
  setAddress: (address: string | null) => void;
  setConnecting: (connecting: boolean) => void;
  setChainId: (chainId: number | null) => void;
  setBalance: (balance: string) => void;
  setTotalBalance: (balance: string) => void;
  setUsdValue: (value: string) => void;
  setCurrentMilestone: (milestone: number) => void;
  setNextMilestoneTarget: (target: string) => void;
  setDistanceToMilestone: (distance: string) => void;
  setLastContributor: (contributor: string) => void;
  setLastContributionAmount: (amount: string) => void;
  setLatestWinner: (winner: string) => void;
  setLatestWinAmount: (amount: string) => void;
  setLatestWinMilestone: (milestone: number) => void;
  setWinnerHistory: (history: Winner[]) => void;
  setContributorCount: (count: number) => void;
  setContributionAmount: (amount: string) => void;
  setSubmitting: (submitting: boolean) => void;
  setShowHistory: (show: boolean) => void;
  toggleTheme: () => void;
  
  addRound: (round: Round) => void;
  updateRound: (roundId: number, updates: Partial<Round>) => void;
  setCurrentRoundId: (id: number) => void;
  claimRoundRefund: (roundId: number) => void;
  addUserDeposit: (roundId: number, amount: string) => void;
  
  addMillyMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setMillyInput: (input: string) => void;
  setMillyMood: (mood: MillyMood) => void;
  setMillyLoading: (loading: boolean) => void;
  setMillyCollapsed: (collapsed: boolean) => void;
  setMillyCompact: (compact: boolean) => void;
  setMillyHasUnread: (hasUnread: boolean) => void;
  clearMillyMessages: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useGameStore = create<GameState>((set, get) => ({
  address: null,
  isConnecting: false,
  chainId: null,
  balance: '0',
  
  rounds: [],
  currentRoundId: 1,
  
  totalBalance: '0',
  usdValue: '0',
  currentMilestone: 1,
  nextMilestoneTarget: '1000000',
  distanceToMilestone: '1000000',
  lastContributor: '',
  lastContributionAmount: '0',
  latestWinner: '',
  latestWinAmount: '0',
  latestWinMilestone: 0,
  winnerHistory: [],
  contributorCount: 0,
  
  contributionAmount: '',
  isSubmitting: false,
  showHistory: false,
  isDark: true,
  
  millyMessages: [],
  millyInput: '',
  millyMood: 'calm',
  isMillyLoading: false,
  millyCollapsed: false,
  millyCompact: false,
  millyHasUnread: false,
  
  setAddress: (address) => set({ address }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setChainId: (chainId) => set({ chainId }),
  setBalance: (balance) => set({ balance }),
  setTotalBalance: (totalBalance) => set({ totalBalance }),
  setUsdValue: (usdValue) => set({ usdValue }),
  setCurrentMilestone: (currentMilestone) => set({ currentMilestone }),
  setNextMilestoneTarget: (nextMilestoneTarget) => set({ nextMilestoneTarget }),
  setDistanceToMilestone: (distanceToMilestone) => set({ distanceToMilestone }),
  setLastContributor: (lastContributor) => set({ lastContributor }),
  setLastContributionAmount: (lastContributionAmount) => set({ lastContributionAmount }),
  setLatestWinner: (latestWinner) => set({ latestWinner }),
  setLatestWinAmount: (latestWinAmount) => set({ latestWinAmount }),
  setLatestWinMilestone: (latestWinMilestone) => set({ latestWinMilestone }),
  setWinnerHistory: (winnerHistory) => set({ winnerHistory }),
  setContributorCount: (contributorCount) => set({ contributorCount }),
  setContributionAmount: (contributionAmount) => set({ contributionAmount }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setShowHistory: (showHistory) => set({ showHistory }),
  toggleTheme: () => {
    const newDark = !get().isDark;
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
    set({ isDark: newDark });
  },
  
  addRound: (round) => set((state) => ({
    rounds: [...state.rounds, round]
  })),
  
  updateRound: (roundId, updates) => set((state) => ({
    rounds: state.rounds.map(r => 
      r.id === roundId ? { ...r, ...updates } : r
    )
  })),
  
  setCurrentRoundId: (currentRoundId) => set({ currentRoundId }),
  
  claimRoundRefund: (roundId) => set((state) => ({
    rounds: state.rounds.map(r => 
      r.id === roundId ? { ...r, hasClaimedRefund: true } : r
    )
  })),
  
  addUserDeposit: (roundId, amount) => set((state) => ({
    rounds: state.rounds.map(r => {
      if (r.id === roundId) {
        const currentDeposits = parseFloat(r.userDeposits);
        const newAmount = parseFloat(amount);
        return { ...r, userDeposits: (currentDeposits + newAmount).toString() };
      }
      return r;
    })
  })),
  
  addMillyMessage: (message) => set((state) => ({
    millyMessages: [...state.millyMessages, {
      ...message,
      id: generateId(),
      timestamp: Date.now()
    }],
    millyHasUnread: state.millyCollapsed ? true : state.millyHasUnread
  })),
  setMillyInput: (millyInput) => set({ millyInput }),
  setMillyMood: (millyMood) => set({ millyMood }),
  setMillyLoading: (isMillyLoading) => set({ isMillyLoading }),
  setMillyCollapsed: (millyCollapsed) => set({ millyCollapsed, millyHasUnread: millyCollapsed ? get().millyHasUnread : false }),
  setMillyCompact: (millyCompact) => set({ millyCompact }),
  setMillyHasUnread: (millyHasUnread) => set({ millyHasUnread }),
  clearMillyMessages: () => set({ millyMessages: [] })
}));
