import { task, types } from "hardhat/config";
import { Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import { env } from "../lib/env";
import { getWallet } from "../lib/wallet";

task("deploy-contract", "Deploy main Rebels contract")
  .addParam("contractType", "Type of contract to deploy", undefined, types.string)
  .addParam("name", "Collection name", undefined, types.string)
  .addParam("symbol", "Collection symbol", undefined, types.string)
  .addParam("maxSupply", "Maximum collection size", -1, types.int)
  .setAction(async (taskArgs, hre) => {
    return hre.ethers
      .getContractFactory(taskArgs.contractType, getWallet())
      .then((contractFactory) => {
        if (taskArgs.contractType === "HonoraryRebels") {
          return contractFactory.deploy(
            taskArgs.name, taskArgs.symbol,
            {type: 1})
        } else {
          return contractFactory.deploy(
            taskArgs.name, taskArgs.symbol, taskArgs.maxSupply,
            {type: 1})
        }})
      .then((contract: Contract) => {
        console.log(`TX hash: ${contract.deployTransaction.hash}`);
        console.log(`Contract address: ${contract.address}`);
      });
  });

task("deploy-baseuri-renderer", "Deploy basic baseURI-style renderer")
  .addParam("baseUri", "Base URI of token metadata", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return hre.ethers
      .getContractFactory("BaseURIRenderer", getWallet())
      .then((contractFactory) => contractFactory.deploy(
        taskArgs.baseUri, {type: 1}))
      .then((contract: Contract) => {
        console.log(`TX hash: ${contract.deployTransaction.hash}`);
        console.log(`Contract address: ${contract.address}`);
      });
  });

task("deploy-fixed-renderer", "Deploy fixed renderer")
  .addParam("uri", "Unique URI token metadata", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return hre.ethers
      .getContractFactory("FixedURIRenderer", getWallet())
      .then((contractFactory) => contractFactory.deploy(
        taskArgs.uri, {type: 1}))
      .then((contract: Contract) => {
        console.log(`TX hash: ${contract.deployTransaction.hash}`);
        console.log(`Contract address: ${contract.address}`);
      });
  });
