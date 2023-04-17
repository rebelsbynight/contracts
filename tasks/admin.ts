import { Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { env } from "../lib/env";
import {
  getNightCardContract,
  getNightCardContractAddress,
  getRebelsContract,
  getRebelsContractAddress
} from "../lib/contract";

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

task("set-contract-uri", "Set the NFT collection's contract metadata URI")
  .addParam("uri", "Contract metadata URI", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return getRebelsContract(hre)
      .then((contract: Contract) => {
        console.log(`Setting contract metadata URI to '${taskArgs.uri}'`);
        return contract.setContractURI(taskArgs.uri, {
          gasLimit: 500_000,
          type: 1,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("set-renderer-address", "Set the NFT collection's rendering contract address")
  .addParam("address", "Rendering contract address", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    return getRebelsContract(hre)
      .then((contract: Contract) => {
        console.log(`Setting renderer address to '${taskArgs.address}'`);
        return contract.setRendererAddress(taskArgs.address, {
          gasLimit: 500_000,
          type: 1,
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
          type: 1,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });

task("link-reveal-contract", "Set the NFT collection's reveal contract address")
  .addParam("direction", "Type of contract to deploy", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    let ret;

    if (taskArgs.direction === "ncToRbl") {
      const ncContract = await getNightCardContract(hre);
      const rblContractAddr = getRebelsContractAddress();
      console.log(`Setting reveal contract address to '${rblContractAddr}'`);
      ret = ncContract.setRevealContractAddress(rblContractAddr, {
        gasLimit: 500_000,
        type: 1,
      });
    } else if (taskArgs.direction === "rblToNc") {
      const rblContract = await getRebelsContract(hre);
      const ncContractAddr = getNightCardContractAddress();
      console.log(`Setting minter address to '${ncContractAddr}'`);
      ret = rblContract.setMinterAddress(ncContractAddr, {
        gasLimit: 500_000,
        type: 1,
      });
    } else {
      console.log(`Invalid direction '${taskArgs.direction}'`);
    }

    return ret.then((tr: TransactionResponse) => {
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
          type: 1,
        });
      })
      .then((tr: TransactionResponse) => {
        console.log(`TX hash: ${tr.hash}`);
      });
  });
