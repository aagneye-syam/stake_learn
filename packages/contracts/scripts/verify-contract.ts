import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying StakingManager Contract State...");
  
  // Contract address from deployments.json
  const stakingManagerAddress = "0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D";
  
  // Connect to contract
  const StakingManager = await ethers.getContractFactory("StakingManager");
  const stakingManager = StakingManager.attach(stakingManagerAddress);
  
  console.log("📋 Contract Address:", stakingManagerAddress);
  
  // Check if contract is deployed
  try {
    const owner = await stakingManager.owner();
    console.log("✅ Contract Owner:", owner);
  } catch (error) {
    console.error("❌ Contract not found or not deployed");
    return;
  }
  
  // Check courses
  console.log("\n📚 Checking Courses:");
  for (let courseId = 1; courseId <= 6; courseId++) {
    try {
      const stakeAmount = await stakingManager.getCourseStakeAmount(courseId);
      const isActive = await stakingManager.activeCourses(courseId);
      
      console.log(`Course ${courseId}:`);
      console.log(`  - Stake Amount: ${ethers.formatEther(stakeAmount)} ETH`);
      console.log(`  - Active: ${isActive}`);
      
      if (stakeAmount === 0n) {
        console.log(`  - ⚠️  Course ${courseId} not found!`);
      } else {
        console.log(`  - ✅ Course ${courseId} configured`);
      }
    } catch (error) {
      console.log(`  - ❌ Error checking course ${courseId}:`, error.message);
    }
  }
  
  // Check contract balance
  const balance = await stakingManager.getContractBalance();
  console.log(`\n💰 Contract Balance: ${ethers.formatEther(balance)} ETH`);
  
  console.log("\n✅ Contract verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
