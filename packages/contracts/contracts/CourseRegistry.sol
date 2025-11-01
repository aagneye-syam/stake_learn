// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CourseRegistry
 * @dev Manages course information and required stake amounts
 */
contract CourseRegistry is Ownable {
    struct Course {
        string name;
        uint256 stakeAmount;
        bool active;
        uint256 totalStakers;
        uint256 totalCompleted;
    }

    mapping(uint256 => Course) public courses;
    uint256 public courseCount;

    event CourseCreated(uint256 indexed courseId, string name, uint256 stakeAmount);
    event CourseUpdated(uint256 indexed courseId, string name, uint256 stakeAmount, bool active);
    event CourseDeactivated(uint256 indexed courseId);

    constructor(address initialOwner) Ownable(initialOwner) {
        courseCount = 0; // Start from 0, first course will be ID 1
    }

    function createCourse(string memory name, uint256 stakeAmount) external onlyOwner returns (uint256) {
        courseCount++; // Auto-increment to get next positive integer ID
        uint256 newCourseId = courseCount;
        
        courses[newCourseId] = Course({
            name: name,
            stakeAmount: stakeAmount,
            active: true,
            totalStakers: 0,
            totalCompleted: 0
        });
        
        emit CourseCreated(newCourseId, name, stakeAmount);
        return newCourseId;
    }

    function updateCourse(uint256 courseId, string memory name, uint256 stakeAmount, bool active) external onlyOwner {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        Course storage course = courses[courseId];
        course.name = name;
        course.stakeAmount = stakeAmount;
        course.active = active;
        emit CourseUpdated(courseId, name, stakeAmount, active);
    }

    function deactivateCourse(uint256 courseId) external onlyOwner {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        courses[courseId].active = false;
        emit CourseDeactivated(courseId);
    }

    function getCourse(uint256 courseId) external view returns (Course memory) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        return courses[courseId];
    }

    function incrementStakers(uint256 courseId) external {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        courses[courseId].totalStakers++;
    }

    function incrementCompleted(uint256 courseId) external {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        courses[courseId].totalCompleted++;
    }
}
