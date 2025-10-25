import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const verifier = process.env.AI_VERIFIER_ADDRESS || deployer.address;

  // Deploy Soulbound
  console.log("\n📝 Deploying Soulbound...");
  const Soulbound = await ethers.getContractFactory("Soulbound");
  const soulbound = await Soulbound.deploy(deployer.address, verifier);
  await soulbound.waitForDeployment();
  const soulboundAddress = await soulbound.getAddress();
  console.log("✅ Soulbound deployed to:", soulboundAddress);

  // Deploy Reputation
  console.log("\n📝 Deploying Reputation...");
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("✅ Reputation deployed to:", reputationAddress);

  // Set Reputation minter
  console.log("\n🔧 Setting Reputation minter...");
  const tx = await reputation.setMinter(soulboundAddress);
  await tx.wait();
  console.log("✅ Reputation minter set to Soulbound");

  // Deploy DataCoin
  console.log("\n📝 Deploying DataCoin...");
  const DataCoin = await ethers.getContractFactory("DataCoin");
  const dataCoin = await DataCoin.deploy(deployer.address);
  await dataCoin.waitForDeployment();
  const dataCoinAddress = await dataCoin.getAddress();
  console.log("✅ DataCoin deployed to:", dataCoinAddress);

  // Deploy StakingManager
  console.log("\n📝 Deploying StakingManager...");
  const StakingManager = await ethers.getContractFactory("StakingManager");
  const stakingManager = await StakingManager.deploy(deployer.address);
  await stakingManager.waitForDeployment();
  const stakingManagerAddress = await stakingManager.getAddress();
  console.log("✅ StakingManager deployed to:", stakingManagerAddress);

  // Add sample courses with configurable stake amounts
  console.log("\n🔧 Adding sample courses...");
  const defaultStakeAmount = process.env.DEFAULT_STAKE_AMOUNT || "0.0001"; // Default to 0.0001 ETH for testing
  const stakeAmountWei = ethers.parseEther(defaultStakeAmount);
  
  // Add all 6 courses with the same configurable stake amount
  for (let i = 1; i <= 6; i++) {
    const courseTx = await stakingManager.addCourse(i, stakeAmountWei);
    await courseTx.wait();
    console.log(`✅ Course ${i} added with stake amount: ${defaultStakeAmount} ETH`);
  }

  // Save deployment addresses
  const deployments = {
    network: "sepolia",
    deployer: deployer.address,
    contracts: {
      Soulbound: soulboundAddress,
      Reputation: reputationAddress,
      DataCoin: dataCoinAddress,
      StakingManager: stakingManagerAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("\n💾 Deployment addresses saved to deployments.json");

  console.log("\n✅ All contracts deployed successfully!");
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("Soulbound:", soulboundAddress);
  console.log("Reputation:", reputationAddress);
  console.log("DataCoin:", dataCoinAddress);
  console.log("StakingManager:", stakingManagerAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


