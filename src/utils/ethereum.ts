import { BrowserProvider, JsonRpcSigner, Eip1193Provider } from "ethers";
import { clientConfig } from "@/lib/env.client";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

const getEthereum = () => {
  try {
    return typeof window !== "undefined" ? window.ethereum : undefined;
  } catch {
    return undefined;
  }
};

export const connectWallet = async (): Promise<string | null> => {
  const ethereum = getEthereum();
  if (!ethereum) {
    console.log("Please install MetaMask");
    return null;
  }
  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    }) as string[];
    return accounts[0];
  } catch (err) {
    console.error((err as Error).message);
    throw err;
  }
};

export const getCurrentWalletConnected = async (): Promise<string> => {
  const ethereum = getEthereum();
  if (!ethereum) {
    console.log("Please install MetaMask");
    return "";
  }
  try {
    const accounts = await ethereum.request({
      method: "eth_accounts",
    }) as string[];
    if (accounts.length > 0) return accounts[0];
    return "";
  } catch (err) {
    console.error((err as Error).message);
    return "";
  }
};

const listenerMap = new WeakMap<
  (address: string) => void,
  (...args: unknown[]) => void
>();

export const addWalletListener = (callback: (address: string) => void): void => {
  const ethereum = getEthereum();
  if (!ethereum) {
    callback("");
    console.log("Please install MetaMask");
    return;
  }
  const wrapped = (...args: unknown[]) => {
    callback((args[0] as string[])[0] ?? "");
  };
  listenerMap.set(callback, wrapped);
  ethereum.on("accountsChanged", wrapped);
};

export const removeWalletListener = (callback: (address: string) => void): void => {
  const ethereum = getEthereum();
  const wrapped = listenerMap.get(callback);
  if (wrapped && ethereum) {
    ethereum.removeListener("accountsChanged", wrapped);
    listenerMap.delete(callback);
  }
};

export interface ProviderAndSigner {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
}

export const getProviderAndSigner = async (): Promise<ProviderAndSigner | null> => {
  const ethereum = getEthereum();
  if (!ethereum) return null;
  try {
    const provider = new BrowserProvider(ethereum as Eip1193Provider);
    const signer = await provider.getSigner();
    return { provider, signer };
  } catch (err) {
    console.error("Failed to get provider/signer:", (err as Error).message);
    return null;
  }
};

// ─── 1. Network Guard ────────────────────────────────────────────────────────
// EIP-3326: wallet_switchEthereumChain
// https://eips.ethereum.org/EIPS/eip-3326
export const assertCorrectNetwork = async (): Promise<void> => {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask not installed");

  const targetHex = `0x${clientConfig.NEXT_PUBLIC_CHAIN_ID.toString(16)}`;
  const currentChain = (await ethereum.request({ method: "eth_chainId" })) as string;

  if (currentChain.toLowerCase() === targetHex.toLowerCase()) return;

  // EIP-3326: throws code 4902 if the chain is not in the wallet yet
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }],
    });
  } catch (err: unknown) {
    const switchErr = err as { code?: number };
    // 4902 = chain not added to MetaMask at all
    if (switchErr.code === 4902) {
      throw new Error(
        `Chain ${clientConfig.NEXT_PUBLIC_CHAIN_ID} is not added to MetaMask. ` +
        `Add it manually or call wallet_addEthereumChain first.`
      );
    }
    throw err;
  }
};

// ─── 2. Explorer URL Builder ─────────────────────────────────────────────────
const EXPLORER: Record<number, string> = {
  80002: "https://amoy.polygonscan.com",
  137: "https://polygonscan.com",
};

export const getTxUrl = (txHash: string): string => {
  const base = EXPLORER[clientConfig.NEXT_PUBLIC_CHAIN_ID];
  if (!base) {
    throw new Error(
      `No explorer configured for chain ${clientConfig.NEXT_PUBLIC_CHAIN_ID}. ` +
      `Add it to the EXPLORER map in src/utils/ethereum.ts.`
    );
  }
  return `${base}/tx/${txHash}`;
};

export const getAddressUrl = (address: string): string => {
  const base = EXPLORER[clientConfig.NEXT_PUBLIC_CHAIN_ID];
  if (!base) throw new Error(`No explorer for chain ${clientConfig.NEXT_PUBLIC_CHAIN_ID}`);
  return `${base}/address/${address}`;
};

export const getBlockUrl = (blockNumber: string): string => {
  const base = EXPLORER[clientConfig.NEXT_PUBLIC_CHAIN_ID];
  if (!base) throw new Error(`No explorer for chain ${clientConfig.NEXT_PUBLIC_CHAIN_ID}`);
  return `${base}/block/${blockNumber}`;
};