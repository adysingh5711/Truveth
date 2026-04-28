import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

export default {
solidity: {
  version: "0.8.34",
  settings: {
    evmVersion: "paris",  // Safe for Polygon Amoy
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
},
  defaultNetwork: "polygon_amoy",

  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    polygon_amoy: {
      type: "http",
      url: process.env.POLYGON_AMOY_RPC_URL,
      accounts: [process.env.POLYGON_AMOY_PRIVATE_KEY],
      chainId: 80002, // Amoy testnet chain ID
    },
  },

  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY ?? "",
    },
  },

  sourcify: {
    enabled: false,
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  mocha: {
    timeout: 40000,
  },
};