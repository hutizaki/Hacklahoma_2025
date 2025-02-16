"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_helpers_1 = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
// This fixture deploys the Lock contract with a one-year unlock time and sends 1 gwei of funds.
async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60; // One year in seconds
    const ONE_GWEI = 1000000000; // Amount to lock (1 gwei)
    const lockedAmount = ONE_GWEI;
    const unlockTime = (await network_helpers_1.time.latest()) + ONE_YEAR_IN_SECS;
    // Get signer accounts: the first is the owner, the second is for unauthorized testing.
    const [owner, otherAccount] = await hardhat_1.ethers.getSigners();
    // Get the contract factory and deploy the contract with the unlockTime and locked amount.
    const LockFactory = await hardhat_1.ethers.getContractFactory("Lock");
    const lock = (await LockFactory.deploy(unlockTime, { value: lockedAmount }));
    return { lock, unlockTime, lockedAmount, owner, otherAccount };
}
describe("Lock", function () {
    it("Should let the owner withdraw", async function () {
        // Deploy the contract using our fixture.
        const { lock, unlockTime, owner } = await (0, network_helpers_1.loadFixture)(deployOneYearLockFixture);
        // Increase the blockchain time to pass the unlock time.
        await network_helpers_1.time.increaseTo(unlockTime);
        // Check initial balances.
        const ownerInitialBalance = await hardhat_1.ethers.provider.getBalance(owner.address);
        const lockInitialBalance = await hardhat_1.ethers.provider.getBalance(lock.address);
        // Call withdraw() and expect the funds to be transferred from the lock to the owner.
        await (0, chai_1.expect)(lock.connect(owner).withdraw()).to.changeEtherBalances([owner, lock], [lockInitialBalance, -lockInitialBalance]);
    });
});
