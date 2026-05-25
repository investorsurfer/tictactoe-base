import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { createPublicClient, createWalletClient, custom, http, parseEther } from "viem";
import { base } from "viem/chains";

export const GAME_FEE = parseEther("0.0001");
export const TREASURY_ADDRESS = "0x66911f0d4C73A9189Ed29ecAFC1514236F51dD45" as `0x${string}`;

let sdk: CoinbaseWalletSDK | null = null;
let provider: ReturnType<CoinbaseWalletSDK["makeWeb3Provider"]> | null = null;

export function getProvider() {
  if (typeof window === "undefined") return null;
  if (!sdk) {
    sdk = new CoinbaseWalletSDK({
      appName: "Tic Tac Toe on Base",
      appLogoUrl: `${window.location.origin}/icon.png`,
    });
  }
  if (!provider) {
    provider = sdk.makeWeb3Provider();
  }
  return provider;
}

export async function connectWallet(): Promise<string> {
  const p = getProvider();
  if (!p) throw new Error("No provider");
  const accounts = await p.request({ method: "eth_requestAccounts" }) as string[];
  await p.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x2105" }], // Base mainnet
  });
  return accounts[0];
}

export async function getConnectedAccount(): Promise<string | null> {
  const p = getProvider();
  if (!p) return null;
  try {
    const accounts = await p.request({ method: "eth_accounts" }) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function payToPlay(fromAddress: string): Promise<string> {
  const p = getProvider();
  if (!p) throw new Error("No provider");

  const walletClient = createWalletClient({
    account: fromAddress as `0x${string}`,
    chain: base,
    transport: custom(p),
  });

  const hash = await walletClient.sendTransaction({
    to: TREASURY_ADDRESS,
    value: GAME_FEE,
  });

  const publicClient = createPublicClient({ chain: base, transport: http() });
  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}
