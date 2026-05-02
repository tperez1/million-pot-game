import { useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useGameStore } from '../store/gameStore';
import { CHAIN_CONFIG } from '../lib/contract';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isRabby?: boolean;
    };
  }
}

export function useWallet() {
  const {
    address, isConnecting, chainId, balance,
    setAddress, setConnecting, setChainId, setBalance
  } = useGameStore();

  const detectWallet = useCallback(() => {
    if (typeof window.ethereum === 'undefined') {
      return null;
    }
    
    // Prefer Rabby if available, otherwise MetaMask
    if (window.ethereum.isRabby) {
      return 'Rabby';
    }
    if (window.ethereum.isMetaMask) {
      return 'MetaMask';
    }
    return 'Unknown';
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or Rabby wallet to continue');
      return;
    }

    try {
      setConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        
        // Get chain ID
        const chainIdHex = await window.ethereum.request({ 
          method: 'eth_chainId' 
        }) as string;
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        
        // Get balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, [setAddress, setChainId, setBalance, setConnecting]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalance('0');
  }, [setAddress, setChainId, setBalance]);

  const switchToOGChain = useCallback(async (targetChainId: number = 16602) => {
    if (!window.ethereum) return;
    
    const config = CHAIN_CONFIG[targetChainId];
    if (!config) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }]
      });
    } catch (switchError) {
      // Chain not added yet
      if ((switchError as { code?: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config]
          });
        } catch (addError) {
          console.error('Failed to add chain:', addError);
        }
      }
    }
  }, []);

  const updateBalance = useCallback(async () => {
    if (!window.ethereum || !address) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  }, [address, setBalance]);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accountsArray[0]);
        updateBalance();
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const newChainId = parseInt(chainIdHex as string, 16);
      setChainId(newChainId);
      updateBalance();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [setAddress, setChainId, disconnectWallet, updateBalance]);

  const isCorrectChain = chainId === 16602 || chainId === 16661;

  return {
    address,
    isConnecting,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    switchToOGChain,
    updateBalance,
    detectWallet,
    isCorrectChain
  };
}
