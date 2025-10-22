// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IStakingManager
 * @dev Interface for the StakingManager contract
 */
interface IStakingManager {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool completed;
        bool refunded;
    }

    event Staked(address indexed user, uint256 indexed courseId, uint256 amount);
    event CourseCompleted(address indexed user, uint256 indexed courseId);
    event StakeRefunded(address indexed user, uint256 indexed courseId, uint256 amount);
    
    function stake(uint256 courseId) external payable;
    function completeCourse(address user, uint256 courseId) external;
    function getStake(address user, uint256 courseId) external view returns (Stake memory);
}
