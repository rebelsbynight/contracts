require('dotenv').config();

import("@nomiclabs/hardhat-ethers");
import("@nomiclabs/hardhat-waffle");
import("hardhat-gas-reporter");
import("./tasks/minter-deployment");
import("./tasks/deployment");
import("./tasks/admin");
import("./tasks/user");

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
};

export default config;
