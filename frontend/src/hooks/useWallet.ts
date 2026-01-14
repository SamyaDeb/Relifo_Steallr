'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  isFreighterInstalled, 
  connectFreighterWallet, 
  getUSDCBalance,
  addUSDCTrustline,
  fundWithFriendbot
} from '@/services/freighter';
import { hasUSDCTrustline, accountExists } from '@/lib/stellar';

export interface WalletState {
  isConnected: boolean;
  isLoading: boolean;
  publicKey: string | null;
  usdcBalance: string;
  xlmBalance: string;
  isFreighterInstalled: boolean;
  hasUSDCTrustline: boolean;
  error: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  isLoading: false,
  publicKey: null,
  usdcBalance: '0',
  xlmBalance: '0',
  isFreighterInstalled: false,
  hasUSDCTrustline: false,
  error: null,
};

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  // Check if Freighter is installed on mount
  useEffect(() => {
    checkFreighter();
    
    // Check for saved connection
    const savedPublicKey = localStorage.getItem('wallet_publicKey');
    if (savedPublicKey) {
      reconnect(savedPublicKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkFreighter = async () => {
    const installed = await isFreighterInstalled();
    setState(prev => ({ ...prev, isFreighterInstalled: installed }));
  };

  const reconnect = async (publicKey: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Verify account still exists
      const exists = await accountExists(publicKey);
      if (!exists) {
        localStorage.removeItem('wallet_publicKey');
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      await refreshBalances(publicKey);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        publicKey,
        isLoading: false,
        error: null,
      }));
    } catch {
      localStorage.removeItem('wallet_publicKey');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const publicKey = await connectFreighterWallet();
      
      // Save to localStorage
      localStorage.setItem('wallet_publicKey', publicKey);

      // Try to check account and balances, but don't fail if account doesn't exist
      // (This allows new unfunded accounts to proceed to registration)
      try {
        await refreshBalances(publicKey);
      } catch (error) {
        console.log('Account not yet funded on testnet, proceeding with connection');
        // Set default values for unfunded account
        setState(prev => ({
          ...prev,
          usdcBalance: '0',
          xlmBalance: '0',
          hasUSDCTrustline: false,
        }));
      }

      setState(prev => ({
        ...prev,
        isConnected: true,
        publicKey,
        isLoading: false,
        error: null,
      }));

      return publicKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('wallet_publicKey');
    setState(initialState);
  }, []);

  const refreshBalances = async (publicKey?: string) => {
    const key = publicKey || state.publicKey;
    if (!key) return;

    try {
      const [usdcBalance, hasTrustline] = await Promise.all([
        getUSDCBalance(key),
        hasUSDCTrustline(key),
      ]);

      setState(prev => ({
        ...prev,
        usdcBalance,
        hasUSDCTrustline: hasTrustline,
      }));
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const setupUSDCTrustline = useCallback(async () => {
    if (!state.publicKey) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await addUSDCTrustline(state.publicKey);
      setState(prev => ({
        ...prev,
        hasUSDCTrustline: true,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add USDC trustline';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.publicKey]);

  const fundAccount = useCallback(async () => {
    if (!state.publicKey) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await fundWithFriendbot(state.publicKey);
      if (!success) {
        throw new Error('Failed to fund account with Friendbot');
      }
      
      await refreshBalances(state.publicKey);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fund account';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.publicKey]);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalances: () => refreshBalances(),
    setupUSDCTrustline,
    fundAccount,
  };
}
