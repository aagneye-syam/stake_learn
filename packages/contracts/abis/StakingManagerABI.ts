// Auto-generated file - do not edit manually
// Run `npm run build` in contracts package to regenerate

export const StakingManagerABI = [
  "constructor(address initialOwner)",
  "function addCourse(uint256 courseId, uint256 stakeAmount)",
  "function updateCourse(uint256 courseId, uint256 stakeAmount, bool active)",
  "function addVerifier(address verifier)",
  "function removeVerifier(address verifier)",
  "function stake(uint256 courseId) payable",
  "function getStake(address user, uint256 courseId) view returns (tuple(uint256 amount, uint256 timestamp, bool completed, bool refunded))",
  "function hasStaked(address user, uint256 courseId) view returns (bool)",
  "function getCourseStakeAmount(uint256 courseId) view returns (uint256)",
  "function completeCourse(address user, uint256 courseId)",
  "function hasCompleted(address user, uint256 courseId) view returns (bool)",
  "function getContractBalance() view returns (uint256)",
  "function emergencyWithdraw()",
  "function getUserStakes(address user, uint256[] courseIds) view returns (tuple(uint256 amount, uint256 timestamp, bool completed, bool refunded)[])",
  "function batchCompleteCourses(address[] users, uint256[] courseIds)",
  "event Staked(address indexed user, uint256 indexed courseId, uint256 amount)",
  "event CourseCompleted(address indexed user, uint256 indexed courseId)",
  "event StakeRefunded(address indexed user, uint256 indexed courseId, uint256 amount)",
  "event CourseAdded(uint256 indexed courseId, uint256 stakeAmount)",
  "event CourseUpdated(uint256 indexed courseId, uint256 stakeAmount, bool active)",
  "event VerifierAdded(address indexed verifier)",
  "event VerifierRemoved(address indexed verifier)",
  "event EmergencyWithdraw(address indexed owner, uint256 amount)"
] as const;

export type StakeInfo = {
  amount: bigint;
  timestamp: bigint;
  completed: boolean;
  refunded: boolean;
};
