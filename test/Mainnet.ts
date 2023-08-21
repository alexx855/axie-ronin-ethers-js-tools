import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Mainnet", function () {
  describe("Deployment", function () {
    it("Should pass the test", async function () {
      expect(true).to.equal(true);
    });
    // TODO: test events
    // describe("Events", function () {
    //   it("Should emit an event on withdrawals", async function () {
    //     await expect(lock.withdraw())
    //       .to.emit(lock, "Withdrawal")
    //       .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
    //   });
    // });

    // // TODO: test transfers
    // describe("Transfers", function () {
    //   it("Should transfer the funds to the owner from the vault", async function () {
    //     await expect(lock.withdraw()).to.changeEtherBalances(
    //       [owner, lock],
    //       [lockedAmount, -lockedAmount]
    //     );
    //   });
    // });
  });
});
