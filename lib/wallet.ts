import { ethers } from "ethers";
import { env } from "./env";
import { getProvider } from "./provider";
import { LedgerSigner } from "@ethersproject/hardware-wallets";

export function getWallet(): ethers.Signer {
  const ethNetwork = env("ETH_NETWORK");

  if (ethNetwork === "mainnet") {
    return new LedgerSigner(getProvider());
  } else if (ethNetwork === "rinkeby") {
    return new ethers.Wallet(env("RINKEBY_PRIVATE_KEY"), getProvider());
  } else {
    throw `Unrecognized network ${ethNetwork}`;
  }
}
