import { task, types } from "hardhat/config";
import { Contract, constants } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import {
  getNightCardContract,
  getMintContract,
  getHonoraryContract
} from "../lib/contract";

task("mint-nft", "Mint an NFT")
  .addParam("count", "Number of units to mint", undefined, types.int)
  .addParam("value", "Value to attach to the transaction", undefined, types.int)
  .setAction(async (taskArgs, hre) => {
    return getNightCardContract(hre)
      .then((contract: Contract) => {
        const overrides = {
          gasLimit: 500_000,
          value: taskArgs.value,
        };
        console.log(`Minting ${taskArgs.count} NFTs`);
        return contract.mint(taskArgs.count, [], overrides);
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("mint-honorary", "Mint an NFT")
  .addParam("to", "Recipient address of the new NFT")
  .setAction(async (taskArgs, hre) => {
    return getHonoraryContract(hre)
      .then((contract: Contract) => {
        const overrides = {
          gasLimit: 500_000,
          type: 1
        };
        console.log(`Minting new NFT to ${taskArgs.to}`);
        return contract.mint(taskArgs.to, overrides);
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });


task("reveal-nft", "Mint an NFT")
  .addParam("id", "The token ID of the NFT to reveal", undefined, types.int)
  .setAction(async (taskArgs, hre) => {
    return getNightCardContract(hre)
      .then((contract: Contract) => {
        const overrides = {
          gasLimit: 500_000,
          value: taskArgs.value,
        };
        console.log(`Revealing NFT #${taskArgs.id}`);
        return contract.reveal([taskArgs.id], overrides);
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("get-token-uri")
  .addParam("token", "", undefined, types.int)
  .setAction(async (taskArgs, hre) => {
    return getNightCardContract(hre)
      .then((contract: Contract) => {
        return contract.tokenURI(taskArgs.token);
      })
      .then((res: string) => {
        console.log(`Token URI for Rebel ${taskArgs.token}: ${res}`);
      });
  });

task("get-mint-active", "Get the status of the current sale")
  .setAction(async (taskArgs, hre) => {
    return getMintContract(hre)
      .then((mintContract: Contract) => {
        return mintContract.getMintActive();
      })
      .then((res) => {
        console.log(`Mint active: ${res}`);
      });
  });

task("get-mint-price", "Get the unit price of an active sale")
  .setAction(async (taskArgs, hre) => {
    return getMintContract(hre)
      .then((mintContract: Contract) => {
        return mintContract.getUserMintPrice(constants.AddressZero, []);
      })
      .then((res) => {
        console.log(`Mint price: ${res}`);
      });
  });
