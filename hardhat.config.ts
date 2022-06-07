import("@nomiclabs/hardhat-ethers");
import("@nomiclabs/hardhat-waffle");
import("hardhat-gas-reporter");
import dotenv from "dotenv";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

//const argv = JSON.parse(env("npm_config_argv"));
//if (argv.original !== ["hardhat", "test"]) {
//  require('dotenv').config();
//}
require('dotenv').config();

import("./tasks/minter-deployment");
import("./tasks/deployment");
import("./tasks/admin");
import("./tasks/user");

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
};

export default config;
