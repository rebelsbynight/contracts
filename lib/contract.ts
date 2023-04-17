import { Contract, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";

import { env } from "./env";
import { getWallet } from "./wallet";

export function getNightCardContractAddress() {
  const ethNetwork = env("ETH_NETWORK");

  if (ethNetwork === "mainnet") {
    return env("MAINNET_DEPLOYED_NIGHTCARD_CONTRACT");
  } else if (ethNetwork === "rinkeby") {
    return env("RINKEBY_DEPLOYED_NIGHTCARD_CONTRACT");
  } else {
    throw `Unrecognized network ${ethNetwork}`;
  }
}

export function getNightCardContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getContractAt(hre, "NightCard", getNightCardContractAddress(), getWallet());
}

export function getRebelsContractAddress() {
  const ethNetwork = env("ETH_NETWORK");

  if (ethNetwork === "mainnet") {
    return env("MAINNET_DEPLOYED_REBELS_CONTRACT");
  } else if (ethNetwork === "rinkeby") {
    return env("RINKEBY_DEPLOYED_REBELS_CONTRACT");
  } else {
    throw `Unrecognized network ${ethNetwork}`;
  }
}

export function getRebelsContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getContractAt(hre, "Rebels", getRebelsContractAddress(), getWallet());
}

export function getHonoraryContractAddress() {
  const ethNetwork = env("ETH_NETWORK");

  if (ethNetwork === "mainnet") {
    return env("MAINNET_DEPLOYED_HONORARY_CONTRACT");
  } else if (ethNetwork === "rinkeby") {
    return env("RINKEBY_DEPLOYED_HONORARY_CONTRACT");
  } else {
    throw `Unrecognized network ${ethNetwork}`;
  }
}

export function getHonoraryContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getContractAt(hre, "HonoraryRebels", getHonoraryContractAddress(), getWallet());
}

export function getMintContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getNightCardContract(hre)
    .then((contract: Contract) => {
      return contract.mintAuthorizerAddress();
    })
    .then((addr) => {
      return getContractAt(hre, "BaseMinter", addr, getWallet());
    });
}
