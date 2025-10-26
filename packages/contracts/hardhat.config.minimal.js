import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const SEPOLIA_RPC_URL = process.env.ALCHEMY_RPC_URL || process.env.SEPOLIA_RPC_URL || "";
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

export default {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated"
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      type: "http"
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 11155111,
      type: "http"
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
