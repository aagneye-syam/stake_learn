import { ethers } from "hardhat";

/**
 * Script to complete a course for a user and refund their stake
 * Usage: npx hardhat run scripts/complete-course.ts --network sepolia
 */

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require("fs");
  const path = require("path");
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  
  if (!fs.existsSync(deploymentsPath)) {
    console.error("❌ deployments.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  const stakingManagerAddress = deployments.contracts.StakingManager;

  console.log("\n🎓 Course Completion Script");
  console.log("============================");
  console.log("Signer:", signer.address);
  console.log("StakingManager:", stakingManagerAddress);

  // Get user input
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userAddress = await new Promise<string>((resolve) => {
    readline.question("\nEnter student address (0x...): ", resolve);
  });

  const courseId = await new Promise<string>((resolve) => {
    readline.question("Enter course ID: ", resolve);
  });

  readline.close();

  // Connect to contract
  const StakingManager = await ethers.getContractFactory("StakingManager");
  const stakingManager = StakingManager.attach(stakingManagerAddress);

  console.log("\n📋 Checking stake status...");
  
  // Check if user has staked
  const hasStaked = await stakingManager.hasStaked(userAddress, courseId);
  if (!hasStaked) {
    console.error("❌ User has not staked for this course");
    process.exit(1);
  }

  // Get stake info
  const stakeInfo = await stakingManager.getStake(userAddress, courseId);
  console.log("\n💰 Stake Info:");
  console.log("  Amount:", ethers.formatEther(stakeInfo.amount), "ETH");
  console.log("  Staked at:", new Date(Number(stakeInfo.timestamp) * 1000).toLocaleString());
  console.log("  Completed:", stakeInfo.completed);
  console.log("  Refunded:", stakeInfo.refunded);

  if (stakeInfo.completed) {
    console.log("\n✅ Course already completed!");
    process.exit(0);
  }

  // Confirm action
  const confirmReadline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise<string>((resolve) => {
    confirmReadline.question(
      `\n⚠️  Complete course ${courseId} for ${userAddress}? (yes/no): `,
      resolve
    );
  });

  confirmReadline.close();

  if (confirm.toLowerCase() !== "yes") {
    console.log("\n❌ Cancelled");
    process.exit(0);
  }

  console.log("\n🔄 Marking course as complete...");
  
  try {
    const tx = await stakingManager.completeCourse(userAddress, courseId);
    console.log("Transaction submitted:", tx.hash);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log("\n✅ Course completed successfully!");
    console.log("🎉 Stake refunded to user!");
    console.log("\nTransaction:");
    console.log("  Hash:", receipt.hash);
    console.log("  Block:", receipt.blockNumber);
    console.log("  Gas used:", receipt.gasUsed.toString());
    console.log("\nView on Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${receipt.hash}`);

    // Verify refund
    const finalStake = await stakingManager.getStake(userAddress, courseId);
    console.log("\n📊 Final Status:");
    console.log("  Completed:", finalStake.completed);
    console.log("  Refunded:", finalStake.refunded);

  } catch (error: any) {
    console.error("\n❌ Error completing course:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
