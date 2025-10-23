import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { StakingManagerABI } from '@/abis/StakingManagerABI';
import { CONTRACTS } from '@/config/contracts';

/**
 * Hook to interact with StakingManager contract
 */
export function useStaking(courseId: number) {
  const contractAddress = CONTRACTS.STAKING_MANAGER as `0x${string}`;

  // Read contract state
  const { data: stakeAmount } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'getCourseStakeAmount',
    args: [BigInt(courseId)],
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
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const stakeForCourse = async () => {
    if (!stakeAmount) {
      throw new Error('Stake amount not available');
    }

    writeContract({
      address: contractAddress,
      abi: StakingManagerABI,
      functionName: 'stake',
      args: [BigInt(courseId)],
      value: stakeAmount,
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

  const { data: stakeInfo, refetch } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'getStake',
    args: userAddress ? [userAddress, BigInt(courseId)] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: hasStaked } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'hasStaked',
    args: userAddress ? [userAddress, BigInt(courseId)] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: hasCompleted } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'hasCompleted',
    args: userAddress ? [userAddress, BigInt(courseId)] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    stakeInfo,
    hasStaked,
    hasCompleted,
    refetch,
  };
}
