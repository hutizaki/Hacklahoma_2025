"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
const config = {
    solidity: "0.8.28",
    typechain: {
        outDir: "typechain-types", // Where to put the generated TS files
        target: "ethers-v5", // Generates classes compatible with ethers.js v5
        alwaysGenerateOverloads: false,
        externalArtifacts: [], // Array of external artifact files if any
    },
};
exports.default = config;
