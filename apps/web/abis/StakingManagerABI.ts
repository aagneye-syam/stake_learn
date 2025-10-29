/**
 * StakingManager Contract ABI
 * Simplified ABI for frontend integration
 */

export const StakingManagerABI = [
  // Read functions
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "courseId", type: "uint256" }
    ],
    name: "getStake",
    outputs: [
      {
        components: [
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "completed", type: "bool" },
          { name: "refunded", type: "bool" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "courseId", type: "uint256" }
    ],
    name: "hasStaked",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "courseId", type: "uint256" }
    ],
    name: "hasCompleted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "courseId", type: "uint256" }],
    name: "getCourseStakeAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "courseId", type: "uint256" }],
    name: "activeCourses",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  // Write functions
  {
    inputs: [{ name: "courseId", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "courseId", type: "uint256" },
      { name: "certificateCID", type: "string" }
    ],
    name: "completeCourse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Course Management Functions
  {
    inputs: [
      { name: "courseId", type: "uint256" },
      { name: "stakeAmount", type: "uint256" }
    ],
    name: "addCourse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "courseId", type: "uint256" },
      { name: "stakeAmount", type: "uint256" },
      { name: "active", type: "bool" }
    ],
    name: "updateCourse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "verifier", type: "address" }],
    name: "addVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "verifier", type: "address" }],
    name: "removeVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "courseId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "Staked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "courseId", type: "uint256" }
    ],
    name: "CourseCompleted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "courseId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "StakeRefunded",
    type: "event"
  }
] as const;

export type StakeInfo = {
  amount: bigint;
  timestamp: bigint;
  completed: boolean;
  refunded: boolean;
};
