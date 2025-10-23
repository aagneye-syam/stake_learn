import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { StakingManagerABI } from '@/abis/StakingManagerABI';
import { CONTRACTS } from '@/config/contracts';
import { sepolia } from 'wagmi/chains';

/**
 * Hook to interact with StakingManager contract
 */
export function useStaking(courseId: number) {
  const contractAddress = CONTRACTS.STAKING_MANAGER as `0x${string}`;
  const { address: account } = useAccount();

  // Read contract state
  const { data: stakeAmount, error: stakeAmountError } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'getCourseStakeAmount',
    args: [BigInt(courseId)],
  });

  // Debug logging
  console.log('useStaking debug:', {
    courseId,
    contractAddress,
    stakeAmount,
    stakeAmountError
  });

  const { data: isActive } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'activeCourses',
    args: [BigInt(courseId)],
  });

  // Write functions
  const { 
    data: hash, 
    writeContract, 
    isPending,
    error: writeError 
    // @ts-ignore
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const stakeForCourse = async () => {
    if (!account) {
      throw new Error('No account connected');
    }

    // Contract requires exact stake amount - use contract amount or fail
    if (!stakeAmount) {
      throw new Error('Stake amount not available from contract. Please try again.');
    }
    
    console.log('Staking with contract amount:', {
      courseId,
      contractStakeAmount: stakeAmount,
      stakeAmountETH: Number(stakeAmount) / 1e18
    });

    return writeContract({
      address: contractAddress,
      abi: StakingManagerABI,
      functionName: 'stake',
      args: [BigInt(courseId)],
      value: stakeAmount,
      account: account,
      chain: sepolia,
    });
  };

  return {
    stakeAmount,
    isActive,
    stakeForCourse,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error: writeError,
  };
}

/**
 * Hook to check user's stake status
 */
export function useUserStake(userAddress: `0x${string}` | undefined, courseId: number) {
  const contractAddress = CONTRACTS.STAKING_MANAGER as `0x${string}`;

  // Only provide args if userAddress is present.
  const enabled = !!userAddress;

  const { data: stakeInfo, refetch } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'getStake',
    args: enabled ? [userAddress, BigInt(courseId)] : undefined,
    query: {
      enabled,
    },
  });

  const { data: hasStaked } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'hasStaked',
    args: enabled ? [userAddress, BigInt(courseId)] : undefined,
    query: {
      enabled,
    },
  });

  const { data: hasCompleted } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'hasCompleted',
    args: enabled ? [userAddress, BigInt(courseId)] : undefined,
    query: {
      enabled,
    },
  });

  return {
    stakeInfo,
    hasStaked,
    hasCompleted,
    refetch,
  };
}
