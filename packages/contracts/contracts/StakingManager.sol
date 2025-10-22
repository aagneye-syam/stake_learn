// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakingManager
 * @dev Main contract for managing course stakes and completions
 */
contract StakingManager is Ownable, ReentrancyGuard {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool completed;
        bool refunded;
    }

    // User address => Course ID => Stake details
    mapping(address => mapping(uint256 => Stake)) public stakes;
    
    // Course ID => Required stake amount
    mapping(uint256 => uint256) public courseStakeAmounts;
    
    // Course ID => Active status
    mapping(uint256 => bool) public activeCourses;
    
    // Authorized addresses that can mark courses as complete
    mapping(address => bool) public authorizedVerifiers;

    event Staked(address indexed user, uint256 indexed courseId, uint256 amount);
    event CourseCompleted(address indexed user, uint256 indexed courseId);
    event StakeRefunded(address indexed user, uint256 indexed courseId, uint256 amount);
    event CourseAdded(uint256 indexed courseId, uint256 stakeAmount);
    event CourseUpdated(uint256 indexed courseId, uint256 stakeAmount, bool active);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    constructor(address initialOwner) Ownable(initialOwner) {
        authorizedVerifiers[initialOwner] = true;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }

    /**
     * @dev Add a new course with stake amount
     */
    function addCourse(uint256 courseId, uint256 stakeAmount) external onlyOwner {
        require(courseStakeAmounts[courseId] == 0, "Course already exists");
        require(stakeAmount > 0, "Stake amount must be greater than 0");
        
        courseStakeAmounts[courseId] = stakeAmount;
        activeCourses[courseId] = true;
        
        emit CourseAdded(courseId, stakeAmount);
    }

    /**
     * @dev Update course stake amount and active status
     */
    function updateCourse(uint256 courseId, uint256 stakeAmount, bool active) external onlyOwner {
        require(courseStakeAmounts[courseId] > 0, "Course does not exist");
        
        courseStakeAmounts[courseId] = stakeAmount;
        activeCourses[courseId] = active;
        
        emit CourseUpdated(courseId, stakeAmount, active);
    }

    /**
     * @dev Add authorized verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    /**
     * @dev Remove authorized verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    /**
     * @dev Stake ETH for a course
     */
    function stake(uint256 courseId) external payable nonReentrant {
        require(activeCourses[courseId], "Course is not active");
        require(courseStakeAmounts[courseId] > 0, "Course does not exist");
        require(msg.value == courseStakeAmounts[courseId], "Incorrect stake amount");
        require(stakes[msg.sender][courseId].amount == 0, "Already staked for this course");

        stakes[msg.sender][courseId] = Stake({
            amount: msg.value,
            timestamp: block.timestamp,
            completed: false,
            refunded: false
        });

        emit Staked(msg.sender, courseId, msg.value);
    }

    /**
     * @dev Get stake details for a user and course
     */
    function getStake(address user, uint256 courseId) external view returns (Stake memory) {
        return stakes[user][courseId];
    }

    /**
     * @dev Check if user has staked for a course
     */
    function hasStaked(address user, uint256 courseId) external view returns (bool) {
        return stakes[user][courseId].amount > 0;
    }

    /**
     * @dev Get course stake amount
     */
    function getCourseStakeAmount(uint256 courseId) external view returns (uint256) {
        return courseStakeAmounts[courseId];
    }

    /**
     * @dev Mark course as completed and refund stake to user
     * @param user Address of the user who completed the course
     * @param courseId ID of the completed course
     */
    function completeCourse(address user, uint256 courseId) external onlyVerifier nonReentrant {
        Stake storage userStake = stakes[user][courseId];
        
        require(userStake.amount > 0, "No stake found for this user and course");
        require(!userStake.completed, "Course already marked as completed");
        require(!userStake.refunded, "Stake already refunded");

        userStake.completed = true;
        userStake.refunded = true;

        // Refund the stake to the user
        (bool success, ) = payable(user).call{value: userStake.amount}("");
        require(success, "Refund transfer failed");

        emit CourseCompleted(user, courseId);
        emit StakeRefunded(user, courseId, userStake.amount);
    }

    /**
     * @dev Check if user has completed a course
     */
    function hasCompleted(address user, uint256 courseId) external view returns (bool) {
        return stakes[user][courseId].completed;
    }

    /**
     * @dev Get total contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Emergency withdraw - only owner can withdraw
     * Should only be used in emergency situations
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
