import { createWalletClient, createPublicClient, custom, http, parseEther } from "viem";
import { base } from "viem/chains";

export const GAME_FEE = parseEther("0.0001");
export const TREASURY_ADDRESS = "0x66911f0d4C73A9189Ed29ecAFC1514236F51dD45" as `0x${string}`;

// Base mainnet chain params for wallet_addEthereumChain
const BASE_CHAIN_PARAMS = {
  chainId: "0x2105",
  chainName: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

function getEthereum() {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) return null;
  return eth as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

export function hasWallet(): boolean {
  return !!getEthereum();
}

export async function connectWallet(): Promise<string> {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet found. Install MetaMask or Rabby.");

  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts.length) throw new Error("No accounts returned.");

  // Switch to Base, or add it if not present
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });
  } catch (switchErr: unknown) {
    const err = switchErr as { code?: number };
    if (err.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [BASE_CHAIN_PARAMS],
      });
    } else {
      throw switchErr;
    }
  }

  return accounts[0];
}

export async function getConnectedAccount(): Promise<string | null> {
  const eth = getEthereum();
  if (!eth) return null;
  try {
    const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function payToPlay(fromAddress: string): Promise<string> {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet found.");

  const walletClient = createWalletClient({
    account: fromAddress as `0x${string}`,
    chain: base,
    transport: custom(eth),
  });

  const hash = await walletClient.sendTransaction({
    to: TREASURY_ADDRESS,
    value: GAME_FEE,
  });

  const publicClient = createPublicClient({ chain: base, transport: http() });
  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}
