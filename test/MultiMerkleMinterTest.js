const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs")
const { keccak256 } = ethers.utils

// Some part of this contract is already tested by the
// NightCard tester. This tries to test to all specific API
// of merkle.

describe("Multi minting contract", function () {
  let MultiMintAuthorizer;
  let merkleMinterContract;
  let owner;
  let whiteListed1;
  let whiteListed2;
  let whiteListed3;
  let whiteListed4;
  let notWhiteListed;

  beforeEach(async function () {
    // Setup some wallet
    [owner, whiteListed1, whiteListed2, whiteListed3, whiteListed4, notWhiteListed] = await ethers.getSigners();

    // Create the Merkle contract
    MultiMintAuthorizer = await ethers.getContractFactory("MultiMintAuthorizer", owner);

    // Create the whitelist and the merkel tree
    const WLGroup1 = [ whiteListed1, whiteListed2 ];
    const WLGroup2 = [ whiteListed3, whiteListed4 ];
    const WLHash1 = WLGroup1.map(w => keccak256(w.address));
    const WLHash2 = WLGroup2.map(w => keccak256(w.address));
    tree1 = new MerkleTree(WLHash1, keccak256, { sort: true });
    tree2 = new MerkleTree(WLHash2, keccak256, { sort: true });

    mintInfo = [
      {
        merkleRoot: tree1.getHexRoot(),
        mintPrice: 100,
        mintLimit: 5
      },
      {
        merkleRoot: tree2.getHexRoot(),
        mintPrice: 200,
        mintLimit: 3
      }
    ];

    // Deploy
    multiMinterContract = await MultiMintAuthorizer.deploy(
      owner.address,
      "MultiMintAuthorizer test",
      100, // Total mint
      0,   // Start time
      32503683600, // End time: 1/1/3000
      mintInfo);
  });

  describe("Check per-user values", function () {
    it("Gives correct prices", async function () {
      const merkleProof1 = tree1.getHexProof(keccak256(whiteListed1.address));
      const merkleProof3 = tree2.getHexProof(keccak256(whiteListed3.address));
      await expect(
        await multiMinterContract.getUserMintPrice(whiteListed1.address, merkleProof1)
      ).to.equal(100);

      await expect(
        await multiMinterContract.getUserMintPrice(whiteListed3.address, merkleProof3)
      ).to.equal(200);
    });

    it("Gives correct mint limits", async function () {
      const merkleProof2 = tree1.getHexProof(keccak256(whiteListed2.address));
      const merkleProof4 = tree2.getHexProof(keccak256(whiteListed4.address));
      await expect(
        await multiMinterContract.getUserMintLimit(whiteListed2.address, merkleProof2)
      ).to.equal(5);

      await expect(
        await multiMinterContract.getUserMintLimit(whiteListed4.address, merkleProof4)
      ).to.equal(3);
    });

    // Can't test failing `getUserMintPrice()` and `getUserMintLimit()` right
    // now because of a bug in hardhat/ethers.
    // Discussion here: https://github.com/ethers-io/ethers.js/discussions/2849
    /*
    it("Rejects unknown users", async function () {
      await expect(
        await multiMinterContract.getUserMintPrice(notWhiteListed.address, [])
      ).to.be.revertedWith("sender not allowed to participate");

      await expect(
        await multiMinterContract.getUserMintLimit(notWhiteListed.address, [])
      ).to.be.revertedWith("sender not allowed to participate");
    });
    */
  });

  describe("Check root system", function () {
    it("Proof is required", async function () {
      expect(await multiMinterContract.getProofRequired()).to.true;
    });

    it("Pass auth for first WL group", async function () {
      const merkleProof = tree1.getHexProof(keccak256(whiteListed1.address));
      await expect(
        multiMinterContract.authorizeMint(
          whiteListed1.address,
          100, // 1 mint at cost 100
          1,  // minting 1
          merkleProof
        )
      ).to.not.be.reverted;
    });

    it("Pass auth for second WL group", async function () {
      const merkleProof = tree2.getHexProof(keccak256(whiteListed4.address));
      await expect(
        multiMinterContract.authorizeMint(
          whiteListed4.address,
          600, // 3 mints at cost 200
          3,  // minting 1
          merkleProof
        )
      ).to.not.be.reverted;
    });

    it("Proof can be reused until max mint per user", async function () {
      const merkleProof = tree1.getHexProof(keccak256(whiteListed1.address));
      for (let i = 0; i < 5; i++) {
        await expect(
          multiMinterContract.authorizeMint(
            whiteListed1.address,
            100, // 1 mint at cost 100
            1,  // minting 1
            merkleProof
          )
        ).to.not.be.reverted;
      }
      await expect(
        multiMinterContract.authorizeMint(
          whiteListed1.address,
          100, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.be.revertedWith('Trying to mint more than allowed');
    });

    it("Fail auth if not whiteListed", async function () {
      const merkleProof = tree1.getHexProof(keccak256(notWhiteListed.address));
      await expect(
        multiMinterContract.authorizeMint(
          notWhiteListed.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.be.revertedWith('sender not allowed to participate');
    });

    it("Fail auth with owner", async function () {
      const merkleProof = tree1.getHexProof(keccak256(owner.address));
      await expect(
        multiMinterContract.authorizeMint(
          owner.address,
          100, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.be.revertedWith('sender not allowed to participate');
    });
  });
})
