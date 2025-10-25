import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  console.log(`Deploying to ${networkName}...`);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy contracts
  console.log("\n1. Deploying DataCoin...");
  const DataCoin = await ethers.getContractFactory("DataCoin");
  const dataCoin = await DataCoin.deploy(deployer.address);
  await dataCoin.waitForDeployment();
  const dataCoinAddress = await dataCoin.getAddress();
  console.log("DataCoin deployed to:", dataCoinAddress);

  console.log("\n2. Deploying StakingManager...");
  const StakingManager = await ethers.getContractFactory("StakingManager");
  const stakingManager = await StakingManager.deploy(deployer.address);
  await stakingManager.waitForDeployment();
  const stakingManagerAddress = await stakingManager.getAddress();
  console.log("StakingManager deployed to:", stakingManagerAddress);

  console.log("\n3. Deploying Soulbound...");
  const Soulbound = await ethers.getContractFactory("Soulbound");
  const soulbound = await Soulbound.deploy(deployer.address, deployer.address);
  await soulbound.waitForDeployment();
  const soulboundAddress = await soulbound.getAddress();
  console.log("Soulbound deployed to:", soulboundAddress);

  console.log("\n4. Deploying Reputation...");
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("Reputation deployed to:", reputationAddress);

  console.log("\n5. Deploying CourseRegistry...");
  const CourseRegistry = await ethers.getContractFactory("CourseRegistry");
  const courseRegistry = await CourseRegistry.deploy(deployer.address);
  await courseRegistry.waitForDeployment();
  const courseRegistryAddress = await courseRegistry.getAddress();
  console.log("CourseRegistry deployed to:", courseRegistryAddress);

  // Get chain ID
  const chainId = await deployer.provider.getNetwork().then(n => n.chainId);
  console.log("Chain ID:", chainId.toString());

  // Create deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: chainId.toString(),
    deployer: deployer.address,
    contracts: {
      DataCoin: dataCoinAddress,
      StakingManager: stakingManagerAddress,
      Soulbound: soulboundAddress,
      Reputation: reputationAddress,
      CourseRegistry: courseRegistryAddress,
    },
    timestamp: new Date().toISOString(),
  };

  // Save deployment info
  const deploymentsPath = join(__dirname, "..", "deployments.json");
  let deployments = {};
  
  try {
    const existingDeployments = require(deploymentsPath);
    deployments = existingDeployments;
  } catch (error) {
    console.log("No existing deployments file found, creating new one");
  }

  deployments[networkName] = deploymentInfo;
  writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`DataCoin: ${dataCoinAddress}`);
  console.log(`StakingManager: ${stakingManagerAddress}`);
  console.log(`Soulbound: ${soulboundAddress}`);
  console.log(`Reputation: ${reputationAddress}`);
  console.log(`CourseRegistry: ${courseRegistryAddress}`);

  // Generate environment variables
  console.log("\n=== Environment Variables ===");
  console.log(`NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${dataCoinAddress}`);
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${stakingManagerAddress}`);
  console.log(`NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${soulboundAddress}`);
  console.log(`NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${reputationAddress}`);
  console.log(`NEXT_PUBLIC_COURSE_REGISTRY_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${courseRegistryAddress}`);

  // Generate .env.local template
  const envTemplate = `# ${networkName.toUpperCase()} Network Configuration
NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${dataCoinAddress}
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${stakingManagerAddress}
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${soulboundAddress}
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${reputationAddress}
NEXT_PUBLIC_COURSE_REGISTRY_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${courseRegistryAddress}
`;

  const envPath = join(__dirname, "..", "..", "..", "apps", "web", `.env.${networkName}`);
  writeFileSync(envPath, envTemplate);
  console.log(`\nEnvironment file saved to: ${envPath}`);

  console.log("\n✅ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
