const hre = require("hardhat")

async function main() {
  const [deployer] = await ethers.getSigners()

  const BlackjackVerifier = await hre.ethers.getContractFactory("Verifier")
  const blackjackVerifier = await BlackjackVerifier.deploy()
  await blackjackVerifier.deployed()

  const Blackjack = await hre.ethers.getContractFactory("Blackjack")
  const blackjack = await Blackjack.deploy(blackjackVerifier.address)

  await blackjack.deployed()

  console.log(`Blackjack contract deployed to ${blackjack.address}`)
  console.log(
    `Blackjack verifier contract deployed to ${blackjackVerifier.address}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
