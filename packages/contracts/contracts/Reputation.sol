// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ISoulboundLike {
    function owner() external view returns (address);
}

contract Reputation is Ownable {
    // total reputation by address
    mapping(address => uint256) public scoreOf;

    // track contributors for simple leaderboard
    address[] public contributors;
    mapping(address => bool) private seen;

    address public minter; // soulbound contract allowed to record

    event ScoreUpdated(address indexed user, uint256 newScore, uint256 delta);
    event MinterUpdated(address indexed minter);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setMinter(address m) external onlyOwner {
        minter = m;
        emit MinterUpdated(m);
    }

    function recordContribution(address user, uint256 reputation) external {
        require(msg.sender == owner() || msg.sender == minter, "Not authorized");
        if (!seen[user]) {
            seen[user] = true;
            contributors.push(user);
        }
        scoreOf[user] += reputation;
        emit ScoreUpdated(user, scoreOf[user], reputation);
    }

    function getScore(address user) external view returns (uint256) {
        return scoreOf[user];
    }

    function topContributors(uint256 limit) external view returns (address[] memory addrs, uint256[] memory scores) {
        uint256 n = contributors.length;
        if (limit > n) limit = n;

        // naive O(n^2) partial selection for simplicity onchain; for UI use offchain sorting
        address[] memory tempAddrs = new address[](n);
        uint256[] memory tempScores = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            tempAddrs[i] = contributors[i];
            tempScores[i] = scoreOf[contributors[i]];
        }
        for (uint256 i = 0; i < limit; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < n; j++) {
                if (tempScores[j] > tempScores[maxIdx]) maxIdx = j;
            }
            (tempAddrs[i], tempAddrs[maxIdx]) = (tempAddrs[maxIdx], tempAddrs[i]);
            (tempScores[i], tempScores[maxIdx]) = (tempScores[maxIdx], tempScores[i]);
        }
        addrs = new address[](limit);
        scores = new uint256[](limit);
        for (uint256 k = 0; k < limit; k++) {
            addrs[k] = tempAddrs[k];
            scores[k] = tempScores[k];
        }
    }
}


