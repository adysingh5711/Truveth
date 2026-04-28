import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { readFileSync } from "fs";
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

const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  account,
});

console.log("Deploy tx hash:", hash);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log("Contract deployed at:", receipt.contractAddress);
console.log("Polygonscan:", `https://amoy.polygonscan.com/address/${receipt.contractAddress}`);