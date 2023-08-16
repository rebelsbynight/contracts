const { expect } = require("chai");

describe("Block minting contract", function () {
  let BlockMinter;
  let blockMinterContract;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // Setup some wallet
    [owner, user1, user2, ...addr] = await ethers.getSigners();

    BlockMinter = await ethers.getContractFactory("BlockMintAuthorizer", owner);

    // Deploy
    blockMinterContract = await BlockMinter.deploy(
      owner.address,
      "BlockMintAuthorizer test",
      100,            // Total mint
      user1.address,  // Block minter address
      10,             // Mint price
      0,              // Start time
      32503683600);   // End time: 1/1/3000
  });

  describe("Check basic values", function () {
    it("Does not require proofs", async function () {
      expect(await blockMinterContract.getProofRequired()).to.false;
    });

    it("Pass auth for whiteListed", async function () {
      await expect(
        blockMinterContract.authorizeMint(
          user1.address,
          1000, // 100 mint at cost 10
          100,  // minting 100
          []
        )
      ).to.not.be.reverted;

      await expect(
        blockMinterContract.authorizeMint(
          user1.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          []
        )
      ).to.be.revertedWith("Trying to mint more than total allowed");
    });

    it("Fail auth if not authorized", async function () {
      await expect(
        blockMinterContract.authorizeMint(
          user2.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          []
        )
      ).to.be.revertedWith('Unauthorized minter');
    });
  });
})
