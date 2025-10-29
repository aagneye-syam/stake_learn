const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Simple deployment script that works with current Node.js version
async function deployContracts() {
  console.log("🚀 Starting simple contract deployment...");
  
  // Check for required environment variables
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const rpcUrl = process.env.ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL;
  
  if (!privateKey || !rpcUrl) {
    console.error("❌ Missing required environment variables:");
    console.error("   DEPLOYER_PRIVATE_KEY");
    console.error("   ALCHEMY_RPC_URL or NEXT_PUBLIC_ALCHEMY_RPC_URL");
    process.exit(1);
  }

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("📡 Connected to network:", await provider.getNetwork());
    console.log("👤 Deployer address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH");
      process.exit(1);
    }

    // Deploy DataCoin contract
    console.log("\n📄 Deploying DataCoin contract...");
    const dataCoinFactory = new ethers.ContractFactory(
      [
        "constructor(address initialOwner)",
        "function mint(address to, uint256 amount, string calldata reason) external",
        "function addMinter(address minter) external",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "function owner() view returns (address)",
        "function addMinter(address minter) external",
        "function removeMinter(address minter) external",
        "function addBurner(address burner) external",
        "function removeBurner(address burner) external",
        "function burn(address from, uint256 amount, string calldata reason) external",
        "function burnSelf(uint256 amount) external",
        "function getTotalSupply() view returns (uint256)",
        "function getRemainingSupply() view returns (uint256)",
        "function isMinter(address account) view returns (bool)",
        "function isBurner(address account) view returns (bool)",
        "event MinterAdded(address indexed minter)",
        "event MinterRemoved(address indexed minter)",
        "event BurnerAdded(address indexed burner)",
        "event BurnerRemoved(address indexed burner)",
        "event TokensMinted(address indexed to, uint256 amount, string reason)",
        "event TokensBurned(address indexed from, uint256 amount, string reason)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
      ],
      `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DataCoin is ERC20, Ownable, ReentrancyGuard {
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public authorizedBurners;
    
    uint8 private constant DECIMALS = 18;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**DECIMALS;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event BurnerAdded(address indexed burner);
    event BurnerRemoved(address indexed burner);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    modifier onlyBurner() {
        require(authorizedBurners[msg.sender] || msg.sender == owner(), "Not authorized burner");
        _;
    }
    
    constructor(address initialOwner) 
        ERC20("DataCoin", "DATA") 
        Ownable(initialOwner) 
    {
        authorizedMinters[initialOwner] = true;
        authorizedBurners[initialOwner] = true;
    }
    
    function mint(address to, uint256 amount, string calldata reason) 
        external 
        onlyMinter 
        nonReentrant 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    function burn(address from, uint256 amount, string calldata reason) 
        external 
        onlyBurner 
        nonReentrant 
    {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    function burnSelf(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, "Self burn");
    }
    
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function addBurner(address burner) external onlyOwner {
        require(burner != address(0), "Invalid burner address");
        authorizedBurners[burner] = true;
        emit BurnerAdded(burner);
    }
    
    function removeBurner(address burner) external onlyOwner {
        authorizedBurners[burner] = false;
        emit BurnerRemoved(burner);
    }
    
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account] || account == owner();
    }
    
    function isBurner(address account) external view returns (bool) {
        return authorizedBurners[account] || account == owner();
    }
}`,
      wallet
    );

    const dataCoin = await dataCoinFactory.deploy(wallet.address);
    await dataCoin.waitForDeployment();
    const dataCoinAddress = await dataCoin.getAddress();
    console.log("✅ DataCoin deployed to:", dataCoinAddress);

    // Deploy StakingManager contract
    console.log("\n📄 Deploying StakingManager contract...");
    const stakingManagerFactory = new ethers.ContractFactory(
      [
        "constructor(address initialOwner)",
        "function addCourse(uint256 courseId, uint256 stakeAmount) external",
        "function updateCourse(uint256 courseId, uint256 stakeAmount, bool active) external",
        "function addVerifier(address verifier) external",
        "function removeVerifier(address verifier) external",
        "function stake(uint256 courseId) external payable",
        "function completeCourse(address user, uint256 courseId, string calldata certificateCID) external",
        "function getStake(address user, uint256 courseId) view returns (tuple(uint256 amount, uint256 timestamp, bool completed, bool refunded))",
        "function hasStaked(address user, uint256 courseId) view returns (bool)",
        "function hasCompleted(address user, uint256 courseId) view returns (bool)",
        "function getCourseStakeAmount(uint256 courseId) view returns (uint256)",
        "function activeCourses(uint256 courseId) view returns (bool)",
        "function getContractBalance() view returns (uint256)",
        "function emergencyWithdraw() external",
        "function getUserStakes(address user, uint256[] calldata courseIds) view returns (tuple(uint256 amount, uint256 timestamp, bool completed, bool refunded)[])",
        "function batchCompleteCourses(address[] calldata users, uint256[] calldata courseIds, string[] calldata certificateCIDs) external",
        "function owner() view returns (address)",
        "function authorizedVerifiers(address) view returns (bool)",
        "function stakes(address, uint256) view returns (uint256 amount, uint256 timestamp, bool completed, bool refunded)",
        "function courseStakeAmounts(uint256) view returns (uint256)",
        "function activeCourses(uint256) view returns (bool)",
        "event Staked(address indexed user, uint256 indexed courseId, uint256 amount)",
        "event CourseCompleted(address indexed user, uint256 indexed courseId, string certificateCID)",
        "event StakeRefunded(address indexed user, uint256 indexed courseId, uint256 amount)",
        "event CourseAdded(uint256 indexed courseId, uint256 stakeAmount)",
        "event CourseUpdated(uint256 indexed courseId, uint256 stakeAmount, bool active)",
        "event VerifierAdded(address indexed verifier)",
        "event VerifierRemoved(address indexed verifier)",
        "event EmergencyWithdraw(address indexed owner, uint256 amount)"
      ],
      `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingManager is Ownable, ReentrancyGuard {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool completed;
        bool refunded;
    }

    mapping(address => mapping(uint256 => Stake)) public stakes;
    mapping(uint256 => uint256) public courseStakeAmounts;
    mapping(uint256 => bool) public activeCourses;
    mapping(address => bool) public authorizedVerifiers;

    event Staked(address indexed user, uint256 indexed courseId, uint256 amount);
    event CourseCompleted(address indexed user, uint256 indexed courseId, string certificateCID);
    event StakeRefunded(address indexed user, uint256 indexed courseId, uint256 amount);
    event CourseAdded(uint256 indexed courseId, uint256 stakeAmount);
    event CourseUpdated(uint256 indexed courseId, uint256 stakeAmount, bool active);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {
        authorizedVerifiers[initialOwner] = true;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }

    function addCourse(uint256 courseId, uint256 stakeAmount) external onlyOwner {
        require(courseStakeAmounts[courseId] == 0, "Course already exists");
        require(stakeAmount > 0, "Stake amount must be greater than 0");
        
        courseStakeAmounts[courseId] = stakeAmount;
        activeCourses[courseId] = true;
        
        emit CourseAdded(courseId, stakeAmount);
    }

    function updateCourse(uint256 courseId, uint256 stakeAmount, bool active) external onlyOwner {
        require(courseStakeAmounts[courseId] > 0, "Course does not exist");
        
        courseStakeAmounts[courseId] = stakeAmount;
        activeCourses[courseId] = active;
        
        emit CourseUpdated(courseId, stakeAmount, active);
    }

    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

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

    function getStake(address user, uint256 courseId) external view returns (Stake memory) {
        return stakes[user][courseId];
    }

    function hasStaked(address user, uint256 courseId) external view returns (bool) {
        return stakes[user][courseId].amount > 0;
    }

    function getCourseStakeAmount(uint256 courseId) external view returns (uint256) {
        return courseStakeAmounts[courseId];
    }

    function completeCourse(address user, uint256 courseId, string calldata certificateCID) external onlyVerifier nonReentrant {
        Stake storage userStake = stakes[user][courseId];
        
        require(userStake.amount > 0, "No stake found for this user and course");
        require(!userStake.completed, "Course already marked as completed");
        require(!userStake.refunded, "Stake already refunded");

        userStake.completed = true;
        userStake.refunded = true;

        (bool success, ) = payable(user).call{value: userStake.amount}("");
        require(success, "Refund transfer failed");

        emit CourseCompleted(user, courseId, certificateCID);
        emit StakeRefunded(user, courseId, userStake.amount);
    }

    function hasCompleted(address user, uint256 courseId) external view returns (bool) {
        return stakes[user][courseId].completed;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit EmergencyWithdraw(owner(), balance);
    }

    function getUserStakes(address user, uint256[] calldata courseIds) 
        external 
        view 
        returns (Stake[] memory) 
    {
        Stake[] memory userStakes = new Stake[](courseIds.length);
        for (uint256 i = 0; i < courseIds.length; i++) {
            userStakes[i] = stakes[user][courseIds[i]];
        }
        return userStakes;
    }

    function batchCompleteCourses(
        address[] calldata users, 
        uint256[] calldata courseIds, 
        string[] calldata certificateCIDs
    ) 
        external 
        onlyVerifier 
        nonReentrant 
    {
        require(users.length == courseIds.length, "Arrays length mismatch");
        require(users.length == certificateCIDs.length, "Certificate CIDs length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            Stake storage userStake = stakes[users[i]][courseIds[i]];
            
            if (userStake.amount > 0 && !userStake.completed && !userStake.refunded) {
                userStake.completed = true;
                userStake.refunded = true;

                (bool success, ) = payable(users[i]).call{value: userStake.amount}("");
                if (success) {
                    emit CourseCompleted(users[i], courseIds[i], certificateCIDs[i]);
                    emit StakeRefunded(users[i], courseIds[i], userStake.amount);
                }
            }
        }
    }

    receive() external payable {}
    fallback() external payable {}
}`,
      wallet
    );

    const stakingManager = await stakingManagerFactory.deploy(wallet.address);
    await stakingManager.waitForDeployment();
    const stakingManagerAddress = await stakingManager.getAddress();
    console.log("✅ StakingManager deployed to:", stakingManagerAddress);

    // Add DataCoin contract as a minter for the StakingManager
    console.log("\n🔗 Setting up contract permissions...");
    const addMinterTx = await dataCoin.addMinter(stakingManagerAddress);
    await addMinterTx.wait();
    console.log("✅ StakingManager added as DataCoin minter");

    // Add some initial courses
    console.log("\n📚 Adding initial courses...");
    const courses = [
      { id: 1, stakeAmount: ethers.parseEther("0.0001") },
      { id: 2, stakeAmount: ethers.parseEther("0.0001") },
      { id: 3, stakeAmount: ethers.parseEther("0.0001") },
      { id: 4, stakeAmount: ethers.parseEther("0.0001") },
      { id: 5, stakeAmount: ethers.parseEther("0.0001") },
      { id: 6, stakeAmount: ethers.parseEther("0.0001") },
    ];

    for (const course of courses) {
      const addCourseTx = await stakingManager.addCourse(course.id, course.stakeAmount);
      await addCourseTx.wait();
      console.log(`✅ Course ${course.id} added with stake amount ${ethers.formatEther(course.stakeAmount)} ETH`);
    }

    // Save deployment info
    const deploymentInfo = {
      network: (await provider.getNetwork()).name,
      chainId: (await provider.getNetwork()).chainId.toString(),
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      contracts: {
        DataCoin: dataCoinAddress,
        StakingManager: stakingManagerAddress,
      }
    };

    fs.writeFileSync(
      path.join(__dirname, "../deployments.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("DataCoin:", dataCoinAddress);
    console.log("StakingManager:", stakingManagerAddress);
    
    console.log("\n🔧 Environment Variables for Frontend:");
    console.log(`NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA=${dataCoinAddress}`);
    console.log(`NEXT_PUBLIC_STAKING_MANAGER_CONTRACT_ADDRESS_SEPOLIA=${stakingManagerAddress}`);
    console.log(`NEXT_PUBLIC_ALCHEMY_RPC_URL=${rpcUrl}`);
    console.log(`DEPLOYER_PRIVATE_KEY=${privateKey}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment
deployContracts().catch(console.error);
