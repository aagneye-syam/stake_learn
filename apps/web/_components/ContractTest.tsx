"use client";

import { useReadContract } from 'wagmi';
import { StakingManagerABI } from '@/abis/StakingManagerABI';
import { CONTRACTS } from '@/config/contracts';
import { sepolia } from 'wagmi/chains';

export function ContractTest() {
  const contractAddress = CONTRACTS.STAKING_MANAGER as `0x${string}`;

  const { data: stakeAmount, error: stakeError, isLoading } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'getCourseStakeAmount',
    args: [BigInt(1)],
    query: {
      retry: 1,
      retryDelay: 1000,
    },
  });

  const { data: isActive, error: activeError } = useReadContract({
    address: contractAddress,
    abi: StakingManagerABI,
    functionName: 'activeCourses',
    args: [BigInt(1)],
    query: {
      retry: 1,
      retryDelay: 1000,
    },
  });

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Contract Test</h3>
      <div className="space-y-2 text-sm">
        <div>Contract Address: {contractAddress}</div>
        <div>Chain ID: {sepolia.id}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Stake Amount: {stakeAmount ? (Number(stakeAmount) / 1e18).toString() : 'null'}</div>
        <div>Is Active: {isActive ? 'Yes' : 'No'}</div>
        {stakeError && <div className="text-red-600">Stake Error: {stakeError.message}</div>}
        {activeError && <div className="text-red-600">Active Error: {activeError.message}</div>}
      </div>
    </div>
  );
}
