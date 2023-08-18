const { expect } = require("chai");
const { ethers } = require("hardhat");

let Rebels, rebels;
let CustomizationRenderer, customizationRenderer;
let owner, addr1, addr2;

beforeEach(async () => {
  Rebels = await ethers.getContractFactory("Rebels");
  rebels = await Rebels.deploy("Rebels", "RBL", 13370);
  await rebels.deployed();

  CustomizationRenderer = await ethers.getContractFactory("CustomizationSelectorURIRenderer");
  customizationRenderer = await CustomizationRenderer.deploy("https://api.example.com/rebels/normal/", "https://api.example.com/rebels/night/", "https://api.example.com/rebels/ultra/", rebels.address);
  await customizationRenderer.deployed();

  [owner, addr1, addr2] = await ethers.getSigners();
});

describe("CustomizationSelectorURIRenderer Unit Tests", () => {
  it("Should set the correct base URIs and NFT address", async () => {
    expect(await customizationRenderer.normalModeBaseURI()).to.equal("https://api.example.com/rebels/normal/");
    expect(await customizationRenderer.nightModeBaseURI()).to.equal("https://api.example.com/rebels/night/");
    expect(await customizationRenderer.ultraModeBaseURI()).to.equal("https://api.example.com/rebels/ultra/");
    expect(await customizationRenderer.rebelsNFT()).to.equal(rebels.address);
  });

  it("Should revert if non-owner attempts to update night mode", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);
    await expect(customizationRenderer.connect(addr1).setNightMode(1)).to.be.revertedWith("NotTokenOwner");
  });

  it("Should set night mode correctly for token owner", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);

    await customizationRenderer.connect(owner).setNightMode(1);
    expect(await customizationRenderer.getNightMode(1)).to.be.true;

    await customizationRenderer.connect(owner).unsetNightMode(1);
    expect(await customizationRenderer.getNightMode(1)).to.be.false;
  });

  it("Should revert if trying to set night mode for nonexistent token", async () => {
    await expect(customizationRenderer.connect(owner).setNightMode(9999)).to.be.revertedWith("ERC721: invalid token ID");
  });

  it("Should revert if non-owner attempts to update ultra mode", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);
    await expect(customizationRenderer.connect(addr1).setUltraMode(1)).to.be.revertedWith("NotTokenOwner");
  });

  it("Should set ultra mode correctly for token owner", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);

    await customizationRenderer.connect(owner).setUltraMode(1);
    expect(await customizationRenderer.getUltraMode(1)).to.be.true;

    await customizationRenderer.connect(owner).unsetUltraMode(1);
    expect(await customizationRenderer.getUltraMode(1)).to.be.false;
  });

  it("Should revert if trying to set ultra mode for nonexistent token", async () => {
    await expect(customizationRenderer.connect(owner).setUltraMode(9999)).to.be.revertedWith("ERC721: invalid token ID");
  });

  it("Should set ultra mode correctly and disable previously enabled night mode for token owner", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);

    await customizationRenderer.connect(owner).setNightMode(1);
    expect(await customizationRenderer.getNightMode(1)).to.be.true;
    expect(await customizationRenderer.getUltraMode(1)).to.be.false;

    await customizationRenderer.connect(owner).setUltraMode(1);
    expect(await customizationRenderer.getUltraMode(1)).to.be.true;
    expect(await customizationRenderer.getNightMode(1)).to.be.false;

    await customizationRenderer.connect(owner).setNightMode(1);
    expect(await customizationRenderer.getNightMode(1)).to.be.true;
    expect(await customizationRenderer.getUltraMode(1)).to.be.false;
  });

  it("Should return a different token URI for each mode", async () => {
    await rebels.connect(owner).setMinterAddress(owner.address);
    await rebels.connect(owner).mint(owner.address, [1]);

    expect((await customizationRenderer.tokenURI(1)).includes('night')).to.be.false;
    expect((await customizationRenderer.tokenURI(1)).includes('ultra')).to.be.false;

    await customizationRenderer.connect(owner).setNightMode(1);
    expect((await customizationRenderer.tokenURI(1)).includes('night')).to.be.true;
    expect((await customizationRenderer.tokenURI(1)).includes('ultra')).to.be.false;


    await customizationRenderer.connect(owner).setUltraMode(1);
    expect((await customizationRenderer.tokenURI(1)).includes('night')).to.be.false;
    expect((await customizationRenderer.tokenURI(1)).includes('ultra')).to.be.true;
  });
});
