import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Lock } from "/Users/kimha/VS Code workspace/Hacklahoma_2025/pogc_extension/typechain-types/"; // Adjust relative path if necessary

// This fixture deploys the Lock contract with a one-year unlock time and sends 1 gwei of funds.
async function deployOneYearLockFixture() {
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;  // One year in seconds
  const ONE_GWEI = 1_000_000_000;                // Amount to lock (1 gwei)

  const lockedAmount = ONE_GWEI;
  const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

  // Get signer accounts: the first is the owner, the second is for unauthorized testing.
  const [owner, otherAccount] = await ethers.getSigners();

  // Get the contract factory and deploy the contract with the unlockTime and locked amount.
  const LockFactory = await ethers.getContractFactory("Lock");
  const lock = (await LockFactory.deploy(unlockTime, { value: lockedAmount })) as Lock;

  return { lock, unlockTime, lockedAmount, owner, otherAccount };
}

describe("Lock", function () {
  it("Should let the owner withdraw", async function () {
    // Deploy the contract using our fixture.
    const { lock, unlockTime, owner } = await loadFixture(deployOneYearLockFixture);

    // Increase the blockchain time to pass the unlock time.
    await time.increaseTo(unlockTime);

    // Check initial balances.
    const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
    const lockInitialBalance = await ethers.provider.getBalance((lock as any).address);

    // Call withdraw() and expect the funds to be transferred from the lock to the owner.
    await expect(lock.connect(owner).withdraw()).to.changeEtherBalances(
      [owner, lock],
      [lockInitialBalance, -lockInitialBalance]
    );
  });
});
