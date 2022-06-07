const { MerkleTree } = require("merkletreejs")
const { expect } = require("chai");
const { keccak256 } = ethers.utils
const { parseEther } = require('ethers/lib/utils');
const { waffle } = require("hardhat");

describe("Mint and reveal", function () {
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;
  let addrs;
  let users;

  let NightCard;
  let nightCardContract;

  let Rebels;
  let rebelsContract;

  let MerkleMinter;
  let merkleMinterContract;
  let merkleTree;
  let merkleRoot;

  let proof1;
  let proof2;
  let proof3;

  beforeEach(async function () {
    // Setup some wallet
    [owner, user1, user2, user3, user4, ...addrs] = await ethers.getSigners();
    users = [user1, user2, user3];

    NightCard = await ethers.getContractFactory("NightCard", owner);
    nightCardContract = await NightCard.deploy("NightCard", "NC", 30);

    Rebels = await ethers.getContractFactory("Rebels", owner);
    rebelsContract = await Rebels.deploy("Rebels", "RBLS", 30);

    const wl = [ user1, user2, user3 ];
    const wlHash = wl.map(u => keccak256(u.address));
    merkleTree = new MerkleTree(wlHash, keccak256, { sort: true });
    merkleRoot = merkleTree.getHexRoot();

    proof1 = merkleTree.getHexProof(keccak256(user1.address));
    proof2 = merkleTree.getHexProof(keccak256(user2.address));
    proof3 = merkleTree.getHexProof(keccak256(user3.address));

    MerkleMinter = await ethers.getContractFactory("MerkleMintAuthorizer", owner);
    merkleMinterContract = await MerkleMinter.deploy(
      nightCardContract.address,
      "Mint & Reveal test",
      30,                             // Total mint limit
      10,                             // User mint limit
      merkleRoot,
      parseEther('0.01').toString(),  // User mint price
      0,                              // Start time
      32503683600);                   // End time (01/01/3000)

    nightCardContract.setMintAuthorizerAddress(merkleMinterContract.address);
    nightCardContract.setRevealContractAddress(rebelsContract.address);
    rebelsContract.setMinterAddress(nightCardContract.address);
  });

  describe("Basic mint and reveal", function () {
    it("Balances and ownership", async function () {
      await expect(
        nightCardContract.connect(user1).mint(5, proof1, {value: parseEther('0.05').toString()})
      ).to.not.be.reverted;

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(5);

      // IDs for NightCard start at 1
      for (let i = 1; i <= 5; ++i) {
        expect(await nightCardContract.ownerOf(i)).to.equal(user1.address);
      }

      await expect(
        nightCardContract.connect(user1).reveal([3, 5])
      ).to.not.be.reverted;

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(3);
      expect(await rebelsContract.balanceOf(user1.address)).to.equal(2);

      await expect(
        nightCardContract.connect(user1).reveal([4, 1, 2])
      ).to.not.be.reverted;

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(0);
      expect(await rebelsContract.balanceOf(user1.address)).to.equal(5);
    });
  });

  describe("Mixed mint and reveal", function () {
    it("All tokens can be minted", async function () {
      await expect(
        nightCardContract.connect(user1).mint(5, proof1, {value: parseEther('0.05').toString()})
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user2).mint(5, proof2, {value: parseEther('0.05').toString()})
      ).to.not.be.reverted;

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(5);
      expect(await nightCardContract.balanceOf(user2.address)).to.equal(5);

      await expect(
        nightCardContract.connect(user1).reveal([1, 2, 3])
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user2).reveal([6, 7, 8])
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user3).mint(10, proof3, {value: parseEther('0.1').toString()})
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user1).mint(5, proof1, {value: parseEther('0.05').toString()})
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user2).mint(5, proof2, {value: parseEther('0.05').toString()})
      ).to.not.be.reverted;

      expect(await nightCardContract.totalSupply()).to.equal(30 - (2 * 3));

      await expect(
        nightCardContract.connect(user3).reveal([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
      ).to.not.be.reverted;

      expect(await nightCardContract.totalSupply()).to.equal(30 - (2 * 3) - 10);
      expect(await rebelsContract.totalSupply()).to.equal((2 * 3) + 10);

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(7);
      expect(await nightCardContract.balanceOf(user2.address)).to.equal(7);
      expect(await nightCardContract.balanceOf(user3.address)).to.equal(0);

      await expect(
        nightCardContract.connect(user1).reveal([21, 22, 23, 24, 25, 4, 5])
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user2).reveal([26, 27, 28, 29, 30, 9, 10])
      ).to.not.be.reverted;

      expect(await nightCardContract.totalSupply()).to.equal(0);
      expect(await rebelsContract.totalSupply()).to.equal(30);

      for (const i in users) {
        expect(await nightCardContract.balanceOf(users[i].address)).to.equal(0);
        expect(await rebelsContract.balanceOf(users[i].address)).to.equal(10);
      }
    });
  });

  describe("Edge cases", function () {
    beforeEach(async function () {
      await expect(
        nightCardContract.connect(user1).mint(5, proof1, {value: parseEther('0.05').toString()})
      ).to.not.be.reverted;
    });

    it("Reveal the same NFT twice", async function () {
      await expect(
        nightCardContract.connect(user1).reveal([1, 2, 3])
      ).to.not.be.reverted;

      await expect(
        nightCardContract.connect(user1).reveal([4, 3, 5])
      ).to.be.revertedWith("OwnerQueryForNonexistentToken");
    });

    it("Behaves correctly with empty reveal", async function () {
      await expect(
        nightCardContract.connect(user1).reveal([1, 2, 3])
      ).to.not.be.reverted;

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(2);
      expect(await rebelsContract.balanceOf(user1.address)).to.equal(3);

      await expect(
        nightCardContract.connect(user1).reveal([])
      ).to.not.be.reverted;

      expect(await nightCardContract.balanceOf(user1.address)).to.equal(2);
      expect(await rebelsContract.balanceOf(user1.address)).to.equal(3);
    });
  });
});
