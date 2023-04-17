import { task, types } from "hardhat/config";
import { Contract } from "ethers";
import fs from "fs";

import { getWallet } from "../lib/wallet";
import { getNightCardContractAddress } from "../lib/contract";

function minterTask(name: string, description: string) {
  return task(name, description)
    .addParam("mintName", "Name of the mint phase", undefined, types.string)
    .addParam("totalMintLimit", "Total number of mints available for this phase", undefined, types.int)
    .addParam("startTime", "Start time of the dutch auction", undefined, types.string)
    .addParam("endTime", "End time of the dutch auction", undefined, types.string);
}

function convertTimes(startTime: string, endTime: string) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    return [startDate.getTime() / 1000, endDate.getTime() / 1000];
}

minterTask("deploy-block-minter", "Deploy block minter")
  .addParam("minterAddress", "Address allowed to mint the block", undefined, types.string)
  .addParam("userMintPrice", "Unit price of each NFT", undefined, types.int)
  .setAction(async (taskArgs, hre) => {
    const [startTimestamp, endTimestamp] =
        convertTimes(taskArgs.startTime, taskArgs.endTime);
    return hre.ethers
      .getContractFactory("BlockMintAuthorizer", getWallet())
      .then((contractFactory) => contractFactory.deploy(
        getNightCardContractAddress(),
        taskArgs.mintName,
        taskArgs.totalMintLimit,
        taskArgs.minterAddress,
        taskArgs.userMintPrice,
        startTimestamp,
        endTimestamp,
        {type: 1}))
      .then((result) => {
        console.log(`Contract address: ${result.address}`);
      });
  });

minterTask("deploy-multi-minter", "Deploy multi-merkle-proof minter")
  .addParam("mintInfoFile", "File containing the complete MintInfo array in JSON format", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const [startTimestamp, endTimestamp] =
        convertTimes(taskArgs.startTime, taskArgs.endTime);
    const mintInfo = JSON.parse(fs.readFileSync(taskArgs.mintInfoFile, "utf8"));
    return hre.ethers
      .getContractFactory("MultiMintAuthorizer", getWallet())
      .then((contractFactory) => contractFactory.deploy(
        getNightCardContractAddress(),
        taskArgs.mintName,
        taskArgs.totalMintLimit,
        startTimestamp,
        endTimestamp,
        mintInfo,
        {type: 1}))
      .then((result) => {
        console.log(`Contract address: ${result.address}`);
      });
  });

minterTask("deploy-merkle-minter", "Deploy merkle proof minter")
  .addParam("userMintLimit", "Maximum number of NFTs per minter", undefined, types.int)
  .addParam("merkleRoot", "Root hash of the merkle tree", undefined, types.string)
  .addParam("userMintPrice", "Unit price of each NFT")
  .setAction(async (taskArgs, hre) => {
    const [startTimestamp, endTimestamp] =
        convertTimes(taskArgs.startTime, taskArgs.endTime);
    return hre.ethers
      .getContractFactory("MerkleMintAuthorizer", getWallet())
      .then((contractFactory) => contractFactory.deploy(
        getNightCardContractAddress(),
        taskArgs.mintName,
        taskArgs.totalMintLimit,
        taskArgs.userMintLimit,
        taskArgs.merkleRoot,
        taskArgs.userMintPrice,
        startTimestamp,
        endTimestamp,
        {type: 1}))
      .then((result) => {
        console.log(`Contract address: ${result.address}`);
      });
  });

minterTask("deploy-dutch-minter", "Deploy public dutch auction minter")
  .addParam("userMintLimit", "Maximum number of NFTs per minter", undefined, types.int)
  .addParam("startPrice", "Start price of the dutch auction", undefined, types.string)
  .addParam("endPrice", "End price of the dutch auction", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const [startTimestamp, endTimestamp] =
        convertTimes(taskArgs.startTime, taskArgs.endTime);
    return hre.ethers
      .getContractFactory("DutchMintAuthorizer", getWallet())
      .then((contractFactory) => contractFactory.deploy(
        getNightCardContractAddress(),
        taskArgs.mintName,
        taskArgs.totalMintLimit,
        taskArgs.userMintLimit,
        taskArgs.startPrice,
        taskArgs.endPrice,
        startTimestamp,
        endTimestamp,
        {type: 1}))
      .then((result) => {
        console.log(`Contract address: ${result.address}`);
      });
  });
