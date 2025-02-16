// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract Lock {
    uint public unlockTime;
    address payable public owner;
    bool public isCanceled; // Tracks if the lock has been canceled

    event Withdrawal(uint amount, uint when);
    event LockCanceled(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        require(block.timestamp < _unlockTime, "Unlock time should be in the future");
        unlockTime = _unlockTime;
        owner = payable(msg.sender);
        isCanceled = false; // Initially, the lock is not canceled
    }

    function withdraw() public {
        console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(!isCanceled, "Lock has been canceled, funds were reverted.");
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        uint amount = address(this).balance;
        emit Withdrawal(amount, block.timestamp);

        // Using call instead of transfer for increased safety
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function cancelLock() public {
        require(msg.sender == owner, "Only owner can cancel the lock");
        require(block.timestamp < unlockTime, "Cannot cancel after unlock time");
        require(!isCanceled, "Lock is already canceled");

        isCanceled = true;
        uint amount = address(this).balance;
        emit LockCanceled(amount, block.timestamp);

        // Refund the owner using call
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
