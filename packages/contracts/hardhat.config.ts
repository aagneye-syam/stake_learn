import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig();

// RPC URLs
const SEPOLIA_RPC_URL = process.env.ALCHEMY_RPC_URL || process.env.SEPOLIA_RPC_URL || "";
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const WORLDCHAIN_RPC_URL = process.env.WORLDCHAIN_RPC_URL || "https://worldchain-testnet.g.alchemy.com/v2/";
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/";
const BSC_RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org";
const BSC_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
const FILECOIN_RPC_URL = process.env.FILECOIN_RPC_URL || "https://api.node.glif.io/rpc/v1";
const FILECOIN_CALIBRATION_RPC_URL = process.env.FILECOIN_CALIBRATION_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1";
const YELLOW_RPC_URL = process.env.YELLOW_RPC_URL || "https://rpc.yellow.org";
const ZERO_G_RPC_URL = process.env.ZERO_G_RPC_URL || "https://rpc.0g.ai";
const AVALANCHE_RPC_URL = process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc";
const AVALANCHE_FUJI_RPC_URL = process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Ethereum Networks
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || "",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 1,
    },
    // Base Networks
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: BASE_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 8453,
    },
    // Arbitrum Networks
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 421614,
    },
    // Worldchain Networks
    worldchain: {
      url: WORLDCHAIN_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 480,
    },
    // Polygon Networks
    polygonMumbai: {
      url: POLYGON_MUMBAI_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 80001,
    },
    // Arbitrum Mainnet
    arbitrum: {
      url: ARBITRUM_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 42161,
    },
    // Binance Smart Chain
    bsc: {
      url: BSC_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 56,
    },
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 97,
    },
    // Filecoin Networks
    filecoin: {
      url: FILECOIN_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 314,
    },
    filecoinCalibration: {
      url: FILECOIN_CALIBRATION_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 314159,
    },
    // Yellow Network
    yellow: {
      url: YELLOW_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 23011913,
    },
    // 0G Network
    zeroG: {
      url: ZERO_G_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 2043,
    },
    // Avalanche Networks
    avalanche: {
      url: AVALANCHE_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 43114,
    },
    avalancheFuji: {
      url: AVALANCHE_FUJI_RPC_URL,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 43113,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      arbitrum: process.env.ARBISCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      avalancheFuji: process.env.SNOWTRACE_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io"
        }
      },
      {
        network: "worldchain",
        chainId: 480,
        urls: {
          apiURL: "https://worldchain-testnet.blockscout.com/api",
          browserURL: "https://worldchain-testnet.blockscout.com"
        }
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com"
        }
      },
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com"
        }
      },
      {
        network: "filecoin",
        chainId: 314,
        urls: {
          apiURL: "https://api.filscan.io/api",
          browserURL: "https://filscan.io"
        }
      },
      {
        network: "filecoinCalibration",
        chainId: 314159,
        urls: {
          apiURL: "https://api.calibration.filscan.io/api",
          browserURL: "https://calibration.filscan.io"
        }
      },
      {
        network: "yellow",
        chainId: 23011913,
        urls: {
          apiURL: "https://api.explorer.yellow.org/api",
          browserURL: "https://explorer.yellow.org"
        }
      },
      {
        network: "zeroG",
        chainId: 2043,
        urls: {
          apiURL: "https://api.explorer.0g.ai/api",
          browserURL: "https://explorer.0g.ai"
        }
      },
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL: "https://api.snowtrace.io/api",
          browserURL: "https://snowtrace.io"
        }
      },
      {
        network: "avalancheFuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api.testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io"
        }
      }
    ]
  },
};

export default config;

