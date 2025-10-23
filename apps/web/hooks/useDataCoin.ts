import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { DataCoinABI } from '@/abis/DataCoinABI';
import { CONTRACTS } from '@/config/contracts';

/**
 * Hook to interact with DataCoin contract
 */
export function useDataCoin() {
  const contractAddress = process.env.NEXT_PUBLIC_DATACOIN_ADDRESS as `0x${string}`;

  // Read contract state
  const { data: totalSupply } = useReadContract({
    address: contractAddress,
    abi: DataCoinABI,
    functionName: 'totalSupply',
  });

  const { data: name } = useReadContract({
    address: contractAddress,
    abi: DataCoinABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: contractAddress,
    abi: DataCoinABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: contractAddress,
    abi: DataCoinABI,
    functionName: 'decimals',
  });

  // Write functions
  const { 
    data: hash, 
    writeContract, 
    isPending,
    error: writeError 
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintTokens = async (to: `0x${string}`, amount: string) => {
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('DataCoin contract not configured');
    }

    writeContract({
      address: contractAddress,
      abi: DataCoinABI,
      functionName: 'mint',
      args: [to, parseEther(amount)],
    });
  };

  return {
    totalSupply,
    name,
    symbol,
    decimals,
    mintTokens,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error: writeError,
  };
}

/**
 * Hook to check user's DataCoin balance
 */
export function useDataCoinBalance(userAddress: `0x${string}` | undefined) {
  const contractAddress = process.env.NEXT_PUBLIC_DATACOIN_ADDRESS as `0x${string}`;

  const { data: balance, refetch } = useReadContract({
    address: contractAddress,
    abi: DataCoinABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    balance,
    refetch,
  };
}
