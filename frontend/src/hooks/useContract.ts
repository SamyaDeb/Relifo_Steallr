'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import {
  buildContractCall,
  signAndSubmitTransaction,
  callContractReadOnly,
  scVal,
  scValToNative,
} from '@/services/soroban';
import * as StellarSdk from '@stellar/stellar-sdk';

export interface ContractCallState {
  isLoading: boolean;
  error: string | null;
  data: unknown;
  txHash: string | null;
}

const initialState: ContractCallState = {
  isLoading: false,
  error: null,
  data: null,
  txHash: null,
};

export function useContract(contractId: string) {
  const [state, setState] = useState<ContractCallState>(initialState);
  const { publicKey, isConnected } = useWallet();

  // Call a contract method that modifies state (requires signing)
  const call = useCallback(
    async (method: string, args: StellarSdk.xdr.ScVal[] = []) => {
      if (!isConnected || !publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!contractId) {
        throw new Error('Contract ID not configured');
      }

      setState({ ...initialState, isLoading: true });

      try {
        // Build the transaction
        const tx = await buildContractCall(contractId, method, args, publicKey);

        // Sign and submit
        const result = await signAndSubmitTransaction(tx, publicKey);

        // Extract return value if present
        let data: unknown = null;
        if (result.returnValue) {
          data = scValToNative(result.returnValue);
        }

        const txHash = 'hash' in result ? (result as { hash: string }).hash : result.txHash;

        setState({
          isLoading: false,
          error: null,
          data,
          txHash,
        });

        return { data, txHash };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Contract call failed';
        setState({
          ...initialState,
          error: errorMessage,
        });
        throw error;
      }
    },
    [contractId, publicKey, isConnected]
  );

  // Call a contract method that only reads state (no signing required)
  const query = useCallback(
    async (method: string, args: StellarSdk.xdr.ScVal[] = []) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!contractId) {
        throw new Error('Contract ID not configured');
      }

      setState({ ...initialState, isLoading: true });

      try {
        const result = await callContractReadOnly(contractId, method, args, publicKey);

        let data: unknown = null;
        if (result) {
          data = scValToNative(result);
        }

        setState({
          isLoading: false,
          error: null,
          data,
          txHash: null,
        });

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Query failed';
        setState({
          ...initialState,
          error: errorMessage,
        });
        throw error;
      }
    },
    [contractId, publicKey]
  );

  // Reset state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    call,
    query,
    reset,
    // Export scVal helpers for building arguments
    scVal,
  };
}

// Specialized hook for ReliefVault contract
export function useVaultContract() {
  const vaultId = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || '';
  return useContract(vaultId);
}

// Specialized hook for NGO Registry contract
export function useNGOContract() {
  const ngoId = process.env.NEXT_PUBLIC_NGO_CONTRACT_ID || '';
  return useContract(ngoId);
}

// Specialized hook for Beneficiary Registry contract
export function useBeneficiaryContract() {
  const beneficiaryId = process.env.NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID || '';
  return useContract(beneficiaryId);
}

// Specialized hook for Merchant Registry contract
export function useMerchantContract() {
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_CONTRACT_ID || '';
  return useContract(merchantId);
}
