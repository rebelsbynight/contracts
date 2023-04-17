const { expect } = require("chai");
const { ethers } = require("hardhat");

let Rebels, rebels;
let NightModeSelectorURIRenderer, nightModeSelectorURIRenderer;
let owner, addr1, addr2;

beforeEach(async () => {
  Rebels = await ethers.getContractFactory("Rebels");
  rebels = await Rebels.deploy("Rebels", "RBL", 13370);
  await rebels.deployed();

  NightModeSelectorURIRenderer = await ethers.getContractFactory("NightModeSelectorURIRenderer");
  nightModeSelectorURIRenderer = await NightModeSelectorURIRenderer.deploy("https://api.example.com/rebels/", rebels.address);
  await nightModeSelectorURIRenderer.deployed();

  [owner, addr1, addr2] = await ethers.getSigners();
});

describe("NightModeSelectorURIRenderer Unit Tests", () => {
  it("Should set the correct base URI and NFT address", async () => {
    expect(await nightModeSelectorURIRenderer.baseURI()).to.equal("https://api.example.com/rebels/");
    expect(await nightModeSelectorURIRenderer.rebelsNFT()).to.equal(rebels.address);
  });

  it("Should revert if non-owner attempts to update night mode", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);
    await expect(nightModeSelectorURIRenderer.connect(addr1).setNightMode(1, true)).to.be.revertedWith("Not token owner");
  });

  it("Should set night mode correctly for token owner", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);

    await nightModeSelectorURIRenderer.connect(owner).setNightMode(1, true);
    expect(await nightModeSelectorURIRenderer.getNightMode(1)).to.be.true;

    await nightModeSelectorURIRenderer.connect(owner).setNightMode(1, false);
    expect(await nightModeSelectorURIRenderer.getNightMode(1)).to.be.false;
  });

  it("Should revert if trying to set night mode for nonexistent token", async () => {
    await expect(nightModeSelectorURIRenderer.connect(owner).setNightMode(9999, true)).to.be.revertedWith("ERC721: invalid token ID");
  });
});
