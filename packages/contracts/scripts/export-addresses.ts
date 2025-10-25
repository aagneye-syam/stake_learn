import * as fs from "fs";
import * as path from "path";

/**
 * Export deployment addresses for use in frontend
 */
function exportDeployments() {
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  
  if (!fs.existsSync(deploymentsPath)) {
    console.error("❌ deployments.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  
  const exportContent = `// Auto-generated from deployments.json
// Last updated: ${deployments.timestamp}

export const CONTRACTS = {
  DATACOIN: "${deployments.contracts.DataCoin}",
  SOULBOUND: "${deployments.contracts.Soulbound}",
  REPUTATION: "${deployments.contracts.Reputation}",
  STAKING_MANAGER: "${deployments.contracts.StakingManager}",
} as const;

export const NETWORK = "${deployments.network}";
export const DEPLOYER = "${deployments.deployer}";
`;

  const outputPath = path.join(__dirname, "../exported-addresses.ts");
  fs.writeFileSync(outputPath, exportContent);
  
  console.log("✅ Contract addresses exported to exported-addresses.ts");
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("DataCoin:", deployments.contracts.DataCoin);
  console.log("Soulbound:", deployments.contracts.Soulbound);
  console.log("Reputation:", deployments.contracts.Reputation);
  console.log("StakingManager:", deployments.contracts.StakingManager);
}

exportDeployments();
