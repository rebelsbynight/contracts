import { Contract, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";

import { env } from "./env";
import { getWallet } from "./wallet";

export function getNightCardContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getContractAt(hre, "NightCard", env("DEPLOYED_NIGHTCARD_CONTRACT"), getWallet());
}

export function getRebelsContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getContractAt(hre, "Rebels", env("DEPLOYED_REBELS_CONTRACT"), getWallet());
}

export function getMintContract(
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  return getNightCardContract(hre)
    .then((contract: Contract) => {
      return contract.mintAuthorizerAddress();
    })
    .then((addr) => {
      return getContractAt(hre, "DutchMintAuthorizer", addr, getWallet());
    });
}
