import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import "dotenv/config";

const account = privateKeyToAccount(process.env.POLYGON_AMOY_PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: polygonAmoy,
  transport: http(process.env.POLYGON_AMOY_RPC_URL),
});

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.POLYGON_AMOY_RPC_URL),
});

const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/Main.sol/Certification.json", "utf8")
);

// Deploy
const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  account,
});

console.log("Deploy tx hash:", hash);
console.log("Waiting for confirmation...");

const receipt = await publicClient.waitForTransactionReceipt({ hash });
const contractAddress = receipt.contractAddress;

console.log("Contract deployed at:", contractAddress);
console.log("Polygonscan:", `https://amoy.polygonscan.com/address/${contractAddress}`);

// Auto-extract ABI
const abiPath = "./src/lib/abi/Certification.json";
mkdirSync(dirname(abiPath), { recursive: true });
writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
console.log("ABI synced to:", abiPath);

// Auto-update .env.local with updated contract address
const envPath = "./.env.local";
let envContent = "";

try {
  envContent = readFileSync(envPath, "utf8");
} catch {
  // File doesn't exist yet, start fresh
  envContent = "";
}

const key = "NEXT_PUBLIC_CONTRACT_ADDRESS";
const newLine = `${key}=${contractAddress}`;

if (envContent.includes(key)) {
  // Replace existing value
  envContent = envContent.replace(new RegExp(`^${key}=.*$`, "m"), newLine);
} else {
  // Append new key
  envContent = envContent.trimEnd() + "\n" + newLine + "\n";
}

writeFileSync(envPath, envContent);
console.log(`.env.local updated: ${key}=${contractAddress}`);
