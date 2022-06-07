const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs")
const { keccak256 } = ethers.utils

// Some part of this contract is already tested by the
// NightCard tester. This tries to test to all specific API
// of merkle.

describe("Merkle minting contract", function () {
  let MerkleMinter;
  let merkleMinterContract;
  let owner;
  let whiteListed1;
  let whiteListed2;
  let notWhiteListed;

  beforeEach(async function () {
    // Setup some wallet
    [owner, whiteListed1, whiteListed2, notWhiteListed] = await ethers.getSigners();

    // Create the Merkle contract
    MerkleMinter = await ethers.getContractFactory("MerkleMintAuthorizer", owner);

    // Create the whitelist and the merkel tree
    const whilelisted = [ whiteListed1, whiteListed2 ];
    const whilelistedHash = whilelisted.map(whiteListed1 => keccak256(whiteListed1.address));
    tree = new MerkleTree(whilelistedHash, keccak256, { sort: true });
    merkleRoot = tree.getHexRoot();

    // Deploy
    merkleMinterContract = await MerkleMinter.deploy(
      owner.address,
      "MerkleMinterAuthorizer test",
      100, // Total mint
      5,   // User Max Mint
      merkleRoot,
      10,  // User mint price
      0,   // Start time
      32503683600); // End time: 1/1/3000
  });

  describe("Check root system", function () {
    it("Merkle is enable", async function () {
      expect(await merkleMinterContract.getProofRequired()).to.true;
    });

    it("Pass auth for whiteListed", async function () {
      const merkleProof = tree.getHexProof(keccak256(whiteListed1.address))
      await expect(
        merkleMinterContract.authorizeMint(
          whiteListed1.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.not.be.reverted;
    });

    it("Proof can be reused until max mint per user", async function () {
      const merkleProof = tree.getHexProof(keccak256(whiteListed1.address))
      for (let i = 0; i < 5; i++) {
        await expect(
          merkleMinterContract.authorizeMint(
            whiteListed1.address,
            10, // 1 mint at cost 10
            1,  // minting 1
            merkleProof
          )
        ).to.not.be.reverted;
      }
      await expect(
        merkleMinterContract.authorizeMint(
          whiteListed1.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.be.revertedWith('Trying to mint more than allowed');
    });

    it("Fail auth if not whiteListed", async function () {
      const merkleProof = tree.getHexProof(keccak256(notWhiteListed.address))
      await expect(
        merkleMinterContract.authorizeMint(
          notWhiteListed.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.be.revertedWith('Merkle proof failed');
    });

    it("Fail auth with owner", async function () {
      const merkleProof = tree.getHexProof(keccak256(owner.address))
      await expect(
        merkleMinterContract.authorizeMint(
          owner.address,
          10, // 1 mint at cost 10
          1,  // minting 1
          merkleProof
        )
      ).to.be.revertedWith('Merkle proof failed');
    });
  });
})
