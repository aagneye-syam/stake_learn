import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Adding Courses to StakingManager...");
  
  // Contract address from deployments.json
  const stakingManagerAddress = "0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D";
  
  // Connect to contract
  const StakingManager = await ethers.getContractFactory("StakingManager");
  const stakingManager = StakingManager.attach(stakingManagerAddress);
  
  console.log("📋 Contract Address:", stakingManagerAddress);
  
  // Add courses with 0.0001 ETH stake amount
  const stakeAmount = ethers.parseEther("0.0001");
  
  console.log("\n📚 Adding Courses:");
  for (let courseId = 1; courseId <= 6; courseId++) {
    try {
      console.log(`Adding Course ${courseId}...`);
      const tx = await stakingManager.addCourse(courseId, stakeAmount);
      await tx.wait();
      console.log(`✅ Course ${courseId} added with stake amount: 0.0001 ETH`);
    } catch (error: any) {
      if (error.message.includes("Course already exists")) {
        console.log(`⚠️  Course ${courseId} already exists`);
      } else {
        console.error(`❌ Error adding course ${courseId}:`, error.message);
      }
    }
  }
  
  // Verify courses were added
  console.log("\n🔍 Verifying Courses:");
  for (let courseId = 1; courseId <= 6; courseId++) {
    try {
      const stakeAmount = await stakingManager.getCourseStakeAmount(courseId);
      const isActive = await stakingManager.activeCourses(courseId);
      
      console.log(`Course ${courseId}:`);
      console.log(`  - Stake Amount: ${ethers.formatEther(stakeAmount)} ETH`);
      console.log(`  - Active: ${isActive}`);
    } catch (error) {
      console.log(`  - ❌ Error checking course ${courseId}:`, error.message);
    }
  }
  
  console.log("\n✅ Course setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
