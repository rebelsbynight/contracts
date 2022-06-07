const { expect } = require("chai");

async function getLastBlockTime() {
  return (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
}

function advanceTime(timeInSec) {
  // TODO: could be better but here we advance the time then
  //       we force it so the call to the public view will
  //       use the correct time.
  network.provider.send("evm_increaseTime", [timeInSec])
  ethers.provider.send('evm_mine');
}

describe("Dutch minting contract", function () {
  let DutchMinter;
  let dutchMinterContract;
  let owner;
  let user1;
  let user2;
  let addrs;

  const OneMinutes = 1 * 60;
  const TenMinutes = 10 * 60;

  beforeEach(async function () {
    // Setup some wallet
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Create the Dutch contract
    DutchMinter = await ethers.getContractFactory("DutchMintAuthorizer", owner);

    // Setup the bying windows
    startTime = await getLastBlockTime();

    // Period description
    prePeriodDuration = OneMinutes;
    periodDuration = TenMinutes;
    startOfPeriod = startTime + prePeriodDuration;
    endOfPeriod = startOfPeriod + periodDuration;

    // Deploy
    dutchMinterContract = await DutchMinter.deploy(
      owner.address,
      "DutchMintAuthorizer test",
      100, // Total mint
      5,   // User Max Mint
      20,  // Start price
      10,  // End Price
      startOfPeriod,
      endOfPeriod
    );
  });

  describe("Check prices", function () {
    it("Before period", async function () {
      await advanceTime(1);
      expect(
        await dutchMinterContract.getUserMintPrice(user1.address, [])
      ).to.equal(20);
    });

    it("Mid period", async function () {
      await advanceTime(prePeriodDuration + (periodDuration / 2));
      expect(
        await dutchMinterContract.getUserMintPrice(user1.address, [])
      ).to.equal(15);
    });

    it("After period", async function () {
      await advanceTime(prePeriodDuration + periodDuration);
      expect(
        await dutchMinterContract.getUserMintPrice(user1.address, [])
      ).to.equal(10);
    });
  });

  describe("Mint period limits", function () {
    it("Before period", async function () {
      await advanceTime(1);
      await expect(
        dutchMinterContract.authorizeMint(
          user1.address,
          45,
          3,
          [])
      ).to.be.revertedWith("Mint is not active");
    });

    it("Mid period", async function () {
      await advanceTime(prePeriodDuration + (periodDuration / 2));
      await expect(
        dutchMinterContract.authorizeMint(
          user1.address,
          45,
          3,
          [])
      ).to.not.be.reverted;
    });

    it("After period", async function () {
      await advanceTime(prePeriodDuration + periodDuration);
      await expect(
        dutchMinterContract.authorizeMint(
          user1.address,
          45,
          3,
          [])
      ).to.be.revertedWith("Mint is not active");
    });
  });

  describe("Multiple mints", function () {
    it("Mid period", async function () {
      await advanceTime(prePeriodDuration + (periodDuration / 2));
      await expect(
        dutchMinterContract.authorizeMint(
          user1.address,
          30,
          2,
          [])
      ).to.not.be.reverted;

      await advanceTime(prePeriodDuration + (periodDuration / 4));
      await expect(
        dutchMinterContract.authorizeMint(
          user1.address,
          25,
          2,
          [])
      ).to.not.be.reverted;
    });
  });
})
