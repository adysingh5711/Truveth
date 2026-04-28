import { BrowserProvider, JsonRpcSigner, Eip1193Provider } from "ethers";

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