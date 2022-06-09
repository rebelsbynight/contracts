const { expect } = require("chai");
const { parseEther } = require('ethers/lib/utils');
const { waffle } = require("hardhat");

describe("Minting contract", function () {
  let NightCard;
  let nightCardContract;
  let BaseMinter;
  let baseMinterContract;
  let owner;
  let user1;
  let user2;
  let addrs;

  beforeEach(async function () {
    // Setup some wallet
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Create the NightCard contract
    NightCard = await ethers.getContractFactory("NightCard", owner);
    nightCardContract = await NightCard.deploy("NightCard", "Winner", 1000);
  });

  describe("Check default value at deployement", function () {
    it("Should be set to the right owner", async function () {
      expect(await nightCardContract.owner()).to.equal(owner.address);
    });

    it("Total supply at 0", async function () {
      expect(await nightCardContract.totalSupply()).to.equal(0);
    });

    it("Max supply at 1000", async function () {
      expect(await nightCardContract.maxSupply()).to.equal(1000);
    });

    it("Refuse withdraw to non-owner", async function () {
      await expect(
        nightCardContract.connect(user1).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Refuse to set auth addr to non-owner", async function () {
      await expect(
        nightCardContract.connect(user1).setMintAuthorizerAddress(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Fail to mint because the auth addr is unset", async function () {
      await expect(
        nightCardContract.mint(1, [])
      ).to.be.revertedWith("Mint authorizer address unset");
    });
  });

  describe("Basic Minting", function () {
    const mintName = "TestMinter";
    const noCheckMerkelRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const totalMintLimit = 100;
    const userMintPrice = ethers.BigNumber.from('500000000000000000'); // aka 0.5 ETH
    const userMintLimit = 3;

    beforeEach(async function () {
      BaseMinter = await ethers.getContractFactory("MerkleMintAuthorizer", owner);
      baseMinterContract = await BaseMinter.deploy(nightCardContract.address,
                                                   mintName,
                                                   totalMintLimit,
                                                   userMintLimit,
                                                   noCheckMerkelRoot,
                                                   userMintPrice,
                                                   0,
                                                   32503683600); // 1/1/3000
    });

    it("Verify that merkle is disable", async function () {
      expect(await baseMinterContract.getProofRequired()).to.false;
    });

    it("Setting the mint auth system", async function () {
      expect(await nightCardContract.setMintAuthorizerAddress(baseMinterContract.address));
      expect(await nightCardContract.mintAuthorizerAddress()).to.equal(baseMinterContract.address);
    });

    it("Trying to mint without enough funds", async function () {
      expect(await nightCardContract.setMintAuthorizerAddress(baseMinterContract.address));
      // TODO: The error msg shoud be changed to "Insufficient fund"
      await expect(nightCardContract.mint(1, [])).to.be.revertedWith("Insufficient payment");
    });

    it("Mint multiple NFT", async function () {
      expect(await nightCardContract.setMintAuthorizerAddress(baseMinterContract.address));

      // Mint 1 NFT
      expect(await nightCardContract.connect(user1).mint(1, [], {value: parseEther('0.5').toString()}));
      expect(await nightCardContract.balanceOf(user1.address)).to.equal(1);
      expect(await waffle.provider.getBalance(nightCardContract.address)).to.equal(parseEther('0.5').toString());

      // Mint 3 NFT at once
      expect(await nightCardContract.connect(user2).mint(3, [], {value: parseEther('1.5').toString()}));
      expect(await nightCardContract.balanceOf(user2.address)).to.equal(3);
      expect(await waffle.provider.getBalance(nightCardContract.address)).to.equal(parseEther('2').toString());

      // Make sure the basic report works
      expect(await nightCardContract.totalSupply()).to.equal(4);

      // Make sure we can withdraw all the ETH used to mint
      await expect( () =>
        nightCardContract.connect(owner).withdraw()
      ).to.changeEtherBalances(
        [owner, nightCardContract],
        [parseEther('2.0').toString(), parseEther('-2.0').toString()]
      );
      expect(await waffle.provider.getBalance(nightCardContract.address)).to.equal(parseEther('0').toString());

    });
  });

  describe("Free minting", function () {
    const mintName = "TestMinter";
    const noCheckMerkelRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const totalMintLimit = 4;
    const userMintPrice = 0;
    const userMintLimit = 3;

    beforeEach(async function () {
      BaseMinter = await ethers.getContractFactory("MerkleMintAuthorizer", owner);
      baseMinterContract = await BaseMinter.deploy(nightCardContract.address,
                                                   mintName,
                                                   totalMintLimit,
                                                   userMintLimit,
                                                   noCheckMerkelRoot,
                                                   userMintPrice,
                                                   0,
                                                   32503683600); // 1/1/3000
    });

    it("Minting for free", async function () {
      expect(await nightCardContract.setMintAuthorizerAddress(baseMinterContract.address));
      expect(await nightCardContract.connect(user1).mint(1, []));

      // Make sure user1 got the mint it was supposes to get.
      expect(await nightCardContract.balanceOf(user1.address)).to.equal(1);
    });

    it("Checking the limit per user", async function () {
      expect(await nightCardContract.setMintAuthorizerAddress(baseMinterContract.address));
      expect(await nightCardContract.connect(user1).mint(userMintLimit, []));

      // Make sure user1 got the mint it was supposes to get.
      expect(await nightCardContract.balanceOf(user1.address)).to.equal(userMintLimit);

      // Request one more
      await expect(
        nightCardContract.connect(user1).mint(1, [])
      ).to.be.revertedWith("Trying to mint more than allowed");

      // Make sure user1 was not granted any more.
      expect(await nightCardContract.balanceOf(user1.address)).to.equal(userMintLimit);
    });

    it("Checking the total max limit", async function () {
      expect(await nightCardContract.setMintAuthorizerAddress(baseMinterContract.address));
      const user1Wanted = userMintLimit;
      const user2Wanted = totalMintLimit - userMintLimit;
      expect(await nightCardContract.connect(user1).mint(user1Wanted, []));
      expect(await nightCardContract.connect(user2).mint(user2Wanted, []));

      // Make sure user{1,2} got the mint it was supposes to get.
      expect(await nightCardContract.balanceOf(user1.address)).to.equal(user1Wanted);
      expect(await nightCardContract.balanceOf(user2.address)).to.equal(user2Wanted);

      // Request one more and make sure we refuse.
      await expect(
        nightCardContract.connect(user2).mint(1, [])
      ).to.be.revertedWith("Trying to mint more than total allowed");

      // Make sure user2 was not granted any more.
      expect(await nightCardContract.balanceOf(user2.address)).to.equal(user2Wanted);
    });
  });
});
