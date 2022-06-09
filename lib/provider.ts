import { ethers } from "ethers";
import { env } from "./env";

export function getProvider(): ethers.providers.Provider {
  const ethNetwork = env("ETH_NETWORK");

  if (ethNetwork === "mainnet") {
    return new ethers.providers.AlchemyProvider(
      "homestead",
      env("MAINNET_ALCHEMY_API_KEY")
    );
  } else if (ethNetwork === "rinkeby") {
    return new ethers.providers.AlchemyProvider(
      "rinkeby",
      env("RINKEBY_ALCHEMY_API_KEY")
    );
  } else {
    throw `Unrecognized network ${ethNetwork}`;
  }
}
