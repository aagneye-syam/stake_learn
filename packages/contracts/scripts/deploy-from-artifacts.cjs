const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Deployment script using existing compiled artifacts
async function deployContracts() {
  console.log("🚀 Starting contract deployment from artifacts...");
  
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

    // Load DataCoin artifact
    console.log("\n📄 Loading DataCoin artifact...");
    const dataCoinArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/DataCoin.sol/DataCoin.json"), 
      "utf8"
    ));
    
    // Deploy DataCoin contract
    console.log("📄 Deploying DataCoin contract...");
    const dataCoinFactory = new ethers.ContractFactory(
      dataCoinArtifact.abi,
      dataCoinArtifact.bytecode,
      wallet
    );

    const dataCoin = await dataCoinFactory.deploy(wallet.address);
    await dataCoin.waitForDeployment();
    const dataCoinAddress = await dataCoin.getAddress();
    console.log("✅ DataCoin deployed to:", dataCoinAddress);

    // Load StakingManager artifact
    console.log("\n📄 Loading StakingManager artifact...");
    const stakingManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/StakingManager.sol/StakingManager.json"), 
      "utf8"
    ));
    
    // Deploy StakingManager contract
    console.log("📄 Deploying StakingManager contract...");
    const stakingManagerFactory = new ethers.ContractFactory(
      stakingManagerArtifact.abi,
      stakingManagerArtifact.bytecode,
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

    // Create a simple .env file for the frontend
    const envContent = `# Contract Addresses
NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA=${dataCoinAddress}
NEXT_PUBLIC_STAKING_MANAGER_CONTRACT_ADDRESS_SEPOLIA=${stakingManagerAddress}
NEXT_PUBLIC_ALCHEMY_RPC_URL=${rpcUrl}
DEPLOYER_PRIVATE_KEY=${privateKey}
`;

    fs.writeFileSync(
      path.join(__dirname, "../../../apps/web/.env.local"),
      envContent
    );
    
    console.log("\n📝 Created .env.local file in apps/web/ with contract addresses");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment
deployContracts().catch(console.error);
