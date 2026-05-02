import { useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useGameStore, Round } from '../store/gameStore';
import { JACKPOT_ABI, JACKPOT_ADDRESS } from '../lib/contract';
import { useWallet } from './useWallet';

const MOCK_WINNERS = [
  { address: '0x1a2b3c4d5e6f789012345678901234567890abcd', prize: '1000000', milestone: 3, timestamp: Date.now() - 86400000 },
  { address: '0x2b3c4d5e6f789012345678901234567890abcdef', prize: '1000000', milestone: 2, timestamp: Date.now() - 172800000 },
  { address: '0x3c4d5e6f789012345678901234567890abcdef01', prize: '1000000', milestone: 1, timestamp: Date.now() - 259200000 },
];

const TARGET_AMOUNT = 1000000;

// Mock previous rounds for demo
const MOCK_PREVIOUS_ROUNDS: Round[] = [
  {
    id: 1,
    status: 'failed',
    potUsdValue: '1050250.00',
    potBalance: '987654.32',
    winner: null,
    winnerAmount: '0',
    lastContributor: '0xFailedRound1234567890123456789012',
    lastContributionAmount: '50.0',
    contributorCount: 892,
    createdAt: Date.now() - 3600000,
    endedAt: Date.now() - 1800000,
    userDeposits: '3.5',
    hasClaimedRefund: false
  },
  {
    id: 2,
    status: 'won',
    potUsdValue: '1000000.00',
    potBalance: '950000.00',
    winner: '0xWinnerAddress123456789012345678901234',
    winnerAmount: '1000000',
    lastContributor: '0xWinnerAddress123456789012345678901234',
    lastContributionAmount: '12.5',
    contributorCount: 1247,
    createdAt: Date.now() - 7200000,
    endedAt: Date.now() - 5400000,
    userDeposits: '0',
    hasClaimedRefund: false
  }
];

export function useGame() {
  const {
    rounds, currentRoundId,
    totalBalance, usdValue, currentMilestone, nextMilestoneTarget,
    distanceToMilestone, lastContributor, lastContributionAmount,
    latestWinner, latestWinAmount, latestWinMilestone,
    winnerHistory, contributorCount, contributionAmount, isSubmitting,
    setTotalBalance, setUsdValue, setCurrentMilestone,
    setNextMilestoneTarget, setDistanceToMilestone,
    setLastContributor, setLastContributionAmount,
    setLatestWinner, setLatestWinAmount, setLatestWinMilestone,
    setWinnerHistory, setContributorCount, setContributionAmount,
    setSubmitting,
    addRound, updateRound, setCurrentRoundId, claimRoundRefund, addUserDeposit
  } = useGameStore();

  const { address, isCorrectChain, updateBalance } = useWallet();

  // Get current round
  const currentRound = rounds.find(r => r.id === currentRoundId);
  const previousRounds = rounds.filter(r => r.id !== currentRoundId).sort((a, b) => b.id - a.id);

  // Check round status based on USD value
  const checkRoundStatus = useCallback((newUsdValue: number): 'active' | 'won' | 'failed' => {
    if (Math.abs(newUsdValue - TARGET_AMOUNT) < 100) {
      return 'won';
    }
    if (newUsdValue > TARGET_AMOUNT) {
      return 'failed';
    }
    return 'active';
  }, []);

  // Create new round
  const createNewRound = useCallback(() => {
    const newRoundId = currentRoundId + 1;
    const newRound: Round = {
      id: newRoundId,
      status: 'active',
      potUsdValue: '0',
      potBalance: '0',
      winner: null,
      winnerAmount: '0',
      lastContributor: '',
      lastContributionAmount: '0',
      contributorCount: 0,
      createdAt: Date.now(),
      endedAt: null,
      userDeposits: '0',
      hasClaimedRefund: false
    };
    
    addRound(newRound);
    setCurrentRoundId(newRoundId);
    
    // Update convenience values
    setTotalBalance('0');
    setUsdValue('0');
    setDistanceToMilestone('1000000');
    setLastContributor('');
    setLastContributionAmount('0');
    
    return newRoundId;
  }, [currentRoundId, addRound, setCurrentRoundId, setTotalBalance, setUsdValue, setDistanceToMilestone, setLastContributor, setLastContributionAmount]);

  // End current round and start new one
  const endRoundAndStartNew = useCallback((status: 'won' | 'failed', winner?: string) => {
    const now = Date.now();
    
    // Update current round
    updateRound(currentRoundId, {
      status,
      potUsdValue: usdValue,
      potBalance: totalBalance,
      winner: status === 'won' ? winner || lastContributor : null,
      winnerAmount: status === 'won' ? '1000000' : '0',
      endedAt: now
    });
    
    // Create new round
    createNewRound();
  }, [currentRoundId, usdValue, totalBalance, lastContributor, updateRound, createNewRound]);

  // Initialize rounds
  const initializeRounds = useCallback(() => {
    // Add mock previous rounds
    MOCK_PREVIOUS_ROUNDS.forEach(round => {
      addRound(round);
    });
    
    // Create current active round
    const activeRound: Round = {
      id: 3,
      status: 'active',
      potUsdValue: '892451.23',
      potBalance: '847293.18',
      winner: null,
      winnerAmount: '0',
      lastContributor: '0xCurrentContributor12345678901234567',
      lastContributionAmount: '5.0',
      contributorCount: 456,
      createdAt: Date.now(),
      endedAt: null,
      userDeposits: '0',
      hasClaimedRefund: false
    };
    
    addRound(activeRound);
    setCurrentRoundId(3);
    
    // Set convenience values
    setTotalBalance('847293.18');
    setUsdValue('892451.23');
    setDistanceToMilestone('107548.77');
    setLastContributor('0xCurrentContributor12345678901234567');
    setLastContributionAmount('5.0');
    setContributorCount(456);
    setWinnerHistory(MOCK_WINNERS);
  }, [addRound, setCurrentRoundId, setTotalBalance, setUsdValue, setDistanceToMilestone, setLastContributor, setLastContributionAmount, setContributorCount, setWinnerHistory]);

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    if (rounds.length === 0) {
      initializeRounds();
    }
  }, [rounds.length, initializeRounds]);

  // Deposit function
  const deposit = useCallback(async (amount: string) => {
    if (!window.ethereum || !address || !isCorrectChain || !amount) return;
    if (!currentRound || currentRound.status !== 'active') return;

    try {
      setSubmitting(true);
      
      // Simulate deposit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const depositAmount = parseFloat(amount);
      const currentUsd = parseFloat(usdValue);
      const currentBalance = parseFloat(totalBalance);
      
      // Calculate new values
      const usdPerToken = currentUsd > 0 && currentBalance > 0 
        ? currentUsd / currentBalance 
        : 1.053; // Default mock price
      
      const addedUsd = depositAmount * usdPerToken;
      const newBalance = currentBalance + depositAmount;
      const newUsdValue = currentUsd + addedUsd;
      
      // Update convenience values
      setTotalBalance(newBalance.toString());
      setUsdValue(newUsdValue.toFixed(2));
      setLastContributor(address);
      setLastContributionAmount(amount);
      setContributionAmount('');
      
      // Track user deposit in this round
      addUserDeposit(currentRoundId, amount);
      
      // Check round status
      const newStatus = checkRoundStatus(newUsdValue);
      
      if (newStatus === 'won') {
        // Winner!
        setLatestWinner(address);
        setLatestWinAmount('1000000');
        setDistanceToMilestone('0');
        endRoundAndStartNew('won', address);
      } else if (newStatus === 'failed') {
        // Round failed - start new round
        setDistanceToMilestone('0');
        endRoundAndStartNew('failed');
      } else {
        setDistanceToMilestone((TARGET_AMOUNT - newUsdValue).toFixed(2));
      }
      
      updateBalance();
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [
    address, isCorrectChain, currentRound, currentRoundId, totalBalance, usdValue,
    setSubmitting, setTotalBalance, setUsdValue, setLastContributor,
    setLastContributionAmount, setContributionAmount, setLatestWinner,
    setLatestWinAmount, setDistanceToMilestone, updateBalance,
    addUserDeposit, endRoundAndStartNew, checkRoundStatus
  ]);

  // Claim refund for specific round
  const claimRefund = useCallback(async (roundId: number) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round || round.status !== 'failed' || round.hasClaimedRefund) return false;
    if (parseFloat(round.userDeposits) <= 0) return false;

    try {
      setSubmitting(true);
      
      // Simulate refund transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      claimRoundRefund(roundId);
      updateBalance();
      
      return true;
    } catch (error) {
      console.error('Refund claim failed:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [rounds, claimRoundRefund, setSubmitting, updateBalance]);

  // Poll for price updates
  useEffect(() => {
    fetchGameState();
    
    const interval = setInterval(() => {
      const currentUsd = parseFloat(usdValue);
      if (currentUsd > 0 && currentRound?.status === 'active') {
        const change = (Math.random() - 0.5) * 500;
        const newUsd = Math.max(0, currentUsd + change);
        setUsdValue(newUsd.toFixed(2));
        
        const status = checkRoundStatus(newUsd);
        if (status === 'failed') {
          endRoundAndStartNew('failed');
        } else if (status === 'won') {
          endRoundAndStartNew('won');
        } else {
          setDistanceToMilestone(Math.max(0, TARGET_AMOUNT - newUsd).toFixed(2));
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchGameState, usdValue, currentRound?.status, setUsdValue, setDistanceToMilestone, checkRoundStatus, endRoundAndStartNew]);

  return {
    totalBalance,
    usdValue,
    currentMilestone,
    nextMilestoneTarget,
    distanceToMilestone,
    lastContributor,
    lastContributionAmount,
    latestWinner,
    latestWinAmount,
    latestWinMilestone,
    winnerHistory,
    contributorCount,
    contributionAmount,
    isSubmitting,
    
    // Round data
    rounds,
    currentRoundId,
    currentRound,
    previousRounds,
    
    setContributionAmount,
    deposit,
    claimRefund,
    fetchGameState
  };
}
