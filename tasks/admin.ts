import { Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { env } from "../lib/env";
import { getNightCardContract, getRebelsContract } from "../lib/contract";

task("set-provenance-hash", "Set the NFT collection's provenance hash")
  .addParam("provenanceHash", "Provenance hash", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return getRebelsContract(hre)
      .then((contract: Contract) => {
        console.log(`Setting provenance hash to '${taskArgs.provenanceHash}'`);
        return contract.setProvenanceHash(taskArgs.provenanceHash, {
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("set-renderer-address", "Set the NFT collection's rendering contract address")
  .addParam("address", "Rendering contract address", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return getNightCardContract(hre)
      .then((contract: Contract) => {
        console.log(`Setting renderer address to '${taskArgs.address}'`);
        return contract.setRendererAddress(taskArgs.address, {
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("set-mint-authorizer-address", "Set the NFT collection's mint authorizer contract address")
  .addParam("address", "Mint authorizer contract address", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return getNightCardContract(hre)
      .then((contract: Contract) => {
        console.log(`Setting mint authorizer address to '${taskArgs.address}'`);
        return contract.setMintAuthorizerAddress(taskArgs.address, {
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("link-reveal-contracts", "Set the NFT collection's reveal contract address")
  .setAction(async (taskArgs, hre) => {
    await getNightCardContract(hre)
      .then((contract: Contract) => {
        const rblContract = env("DEPLOYED_REBELS_CONTRACT");
        console.log(`Setting reveal contract address to '${rblContract}'`);
        return contract.setRevealContractAddress(rblContract, {
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });

    return getRebelsContract(hre)
      .then((contract: Contract) => {
        const ncContract = env("DEPLOYED_NIGHTCARD_CONTRACT");
        console.log(`Setting minter address to '${ncContract}'`);
        return contract.setMinterAddress(ncContract, {
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });


task("withdraw-funds", "Withdraw funds from the minting contract")
  .setAction(async (taskArgs, hre) => {
    return getNightCardContract(hre)
      .then((contract: Contract) => {
        console.log(`Withdrawing funds from minting contract`);
        return contract.withdraw({
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });
