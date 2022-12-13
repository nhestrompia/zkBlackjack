require("hardhat-circom")
require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config({ path: ".env" })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const ALCHEMY_HTTP_URL = process.env.ALCHEMY_API
const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.11",
      },
      {
        version: "0.8.9",
      },
    ],
  },
  networks: {
    goerli: {
      // url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      url: ALCHEMY_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  circom: {
    inputBasePath: "./circuits",
    ptau: "https://hermezptau.blob.core.windows.net/ptau/powersOfTau28_hez_final_15.ptau",
    circuits: [
      {
        name: "blackjack",
      },
    ],
  },
}
