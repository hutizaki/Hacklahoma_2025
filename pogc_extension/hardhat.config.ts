import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  typechain: {
    outDir: "typechain-types",  // Where to put the generated TS files
    target: "ethers-v5",        // Generates classes compatible with ethers.js v5
    alwaysGenerateOverloads: false,
    externalArtifacts: [],      // Array of external artifact files if any
  },
};

export default config;
