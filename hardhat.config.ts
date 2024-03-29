require('dotenv').config();

require("@nomiclabs/hardhat-etherscan");
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
module.exports = {
  solidity: "0.8.4",
  networks: {
    mainnet: {
    url: "https://mainnet.infura.io/v3/18ea48985537440891ba50c52e7254c3",
    allowUnlimitedContractSize: true
    }
  },
  etherscan: {
    apiKey: "G3ZTD3FTKF4HPUDYN6FYIC8H19YEAY1EYI"
  }
};

export default config;
