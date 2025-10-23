import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying course stake amounts...");

  // Get the deployed contract address
  const stakingManagerAddress = "0x9Eda33d2aa6F2f65Cb7710EA55b5458F98cB88c4";
  const StakingManager = await ethers.getContractFactory("StakingManager");
  const stakingManager = StakingManager.attach(stakingManagerAddress);

  const defaultStakeAmount = process.env.DEFAULT_STAKE_AMOUNT || "0.0001";
  const stakeAmountWei = ethers.parseEther(defaultStakeAmount);

  console.log(`\n📋 Checking courses with stake amount: ${defaultStakeAmount} ETH`);

  for (let courseId = 1; courseId <= 6; courseId++) {
    try {
      const stakeAmount = await stakingManager.getCourseStakeAmount(courseId);
      const isActive = await stakingManager.activeCourses(courseId);
      
      console.log(`Course ${courseId}:`);
      console.log(`  - Stake Amount: ${ethers.formatEther(stakeAmount)} ETH`);
      console.log(`  - Active: ${isActive}`);
      
      // If stake amount is 0, add the course
      if (stakeAmount === 0n) {
        console.log(`  - ⚠️  Course ${courseId} not found, adding...`);
        const tx = await stakingManager.addCourse(courseId, stakeAmountWei);
        await tx.wait();
        console.log(`  - ✅ Course ${courseId} added with stake amount: ${defaultStakeAmount} ETH`);
      } else {
        console.log(`  - ✅ Course ${courseId} already configured`);
      }
    } catch (error) {
      console.log(`  - ❌ Error checking course ${courseId}:`, error);
    }
  }

  console.log("\n✅ Course verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
