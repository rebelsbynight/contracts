const { expect } = require("chai");
const { parseEther } = require('ethers/lib/utils');
const { waffle } = require("hardhat");

describe("Minting contract", function () {
  let Rebels;
  let rebelsContract;
  let owner;
  let user1;
  let user2;
  let addrs;

  beforeEach(async function () {
    // Setup some wallet
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Create the NightCard contract
    Rebels = await ethers.getContractFactory("Rebels", owner);
    rebelsContract = await Rebels.deploy("Rebels", "RBL", 1000);
  });

  describe("Check default value at deployement", function () {
    it("Should be set to the right owner", async function () {
      expect(await rebelsContract.owner()).to.equal(owner.address);
    });

    it("Total supply at 0", async function () {
      expect(await rebelsContract.totalSupply()).to.equal(0);
    });

    it("Max supply at 1000", async function () {
      expect(await rebelsContract.maxSupply()).to.equal(1000);
    });

    it("Refuse to set delegate addresses to non-owner", async function () {
      await expect(
        rebelsContract.connect(user1).setRendererAddress(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        rebelsContract.connect(user2).setMinterAddress(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        rebelsContract.connect(user1).setContractURI("https://foobar.com/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Fail to mint because the auth addr is unset", async function () {
      await expect(
        rebelsContract.mint(user1.address, [42])
      ).to.be.revertedWith("Minting from invalid address");
    });
  });
});
