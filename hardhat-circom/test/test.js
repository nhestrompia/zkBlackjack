const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

const { exportCallDataGroth16 } = require("../utils/index")

describe("Blackjack contract", function () {
  async function deployContractFixture() {
    const Blackjack = await ethers.getContractFactory("Blackjack")
    const BlackjackVerifier = await ethers.getContractFactory("Verifier")

    const [owner, addr1, addr2] = await ethers.getSigners()

    const blackjackVerifier = await BlackjackVerifier.deploy()

    await blackjackVerifier.deployed()
    const blackjackVerifierAddress = blackjackVerifier.address

    const blackjack = await Blackjack.deploy(blackjackVerifierAddress)
    await blackjack.deployed()

    return {
      blackjack,
      blackjackVerifier,
      owner,
      addr1,
      addr2,
    }
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { blackjack, owner } = await loadFixture(deployContractFixture)

      expect(await blackjack.owner()).to.equal(owner.address)
    })
    it("Should set the right address for the prover contract", async function () {
      const { blackjack, blackjackVerifier } = await loadFixture(
        deployContractFixture
      )

      expect(await blackjack.verifierAddress()).to.equal(
        blackjackVerifier.address
      )
    })
  })
  describe("Changing parameters", function () {
    it("Should change casino address to given address", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )

      const changeAddress = await blackjack
        .connect(owner)
        .changeAddress(addr1.address)

      expect(await blackjack.casinoAddress()).to.equal(addr1.address)
    })
    it("Should change bet amount to given amount", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )

      const changeBetAmount = await blackjack
        .connect(owner)
        .changeBetAmount(ethers.utils.parseEther("1.0"))

      expect(await blackjack.betAmount()).to.equal(
        ethers.utils.parseEther("1.0")
      )
    })
  })

  describe("Functions", function () {
    it("Should not start game with less amount of ether than required", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )

      await expect(
        blackjack
          .connect(addr1)
          .startSinglePlayerGame({ value: ethers.utils.parseEther("0.001") })
      ).to.be.revertedWith("Not enough ETH sent")
    })
    it("Should start game with right amount of ether transfer", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )

      const startGame = await blackjack
        .connect(addr1)
        .startSinglePlayerGame({ value: ethers.utils.parseEther("0.01") })

      const playerMapping = await blackjack.players(addr1.address)
      await expect(playerMapping.playerAddress).to.equal(addr1.address)
    })
    it("Should let another user to join to room", async function () {
      const { blackjack, owner, addr1, addr2 } = await loadFixture(
        deployContractFixture
      )
      const gameRoom = await blackjack.gameId()
      const startGame = await blackjack
        .connect(addr1)
        .startMultiplayerGame({ value: ethers.utils.parseEther("0.01") })

      const joinGame = await blackjack
        .connect(addr2)
        .joinGame(gameRoom, { value: ethers.utils.parseEther("0.01") })

      const gameMapping = await blackjack.games(gameRoom)

      await expect(gameMapping.player1Address).to.equal(addr1.address)
      await expect(gameMapping.player2Address).to.equal(addr2.address)
    })

    it("Should not let player withdraw bet before game ended", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const gameRoom = await blackjack.gameId()

      const startGame = await blackjack
        .connect(addr1)
        .startSinglePlayerGame({ value: ethers.utils.parseEther("0.01") })
      await expect(
        blackjack
          .connect(addr1)
          .withdrawBet(ethers.utils.parseEther("0.01"), gameRoom)
      ).to.be.revertedWith("Game is ongoing")
    })

    it("Should not let player withdraw more ETH than their current bet", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const gameRoom = await blackjack.gameId()

      const startGame = await blackjack
        .connect(addr1)
        .startSinglePlayerGame({ value: ethers.utils.parseEther("0.01") })
      const endGame = await blackjack
        .connect(owner)
        .endGame(addr1.address, gameRoom, ethers.utils.parseEther("0.01"))

      await expect(
        blackjack
          .connect(addr1)
          .withdrawBet(ethers.utils.parseEther("0.02"), gameRoom)
      ).to.be.revertedWith("You dont have enough credit in your account")
    })
    it("Should let player withdraw their bet from contract", async function () {
      const { blackjack, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const gameRoom = await blackjack.gameId()

      const changeBetAmount = await blackjack
        .connect(owner)
        .changeBetAmount(ethers.utils.parseEther("1.0"))

      const startGame = await blackjack
        .connect(addr1)
        .startSinglePlayerGame({ value: ethers.utils.parseEther("1.0") })

      const balanceBefore = await addr1.getBalance()
      const accountBalanceBefore = ethers.utils.formatEther(balanceBefore)
      const remainderBefore = Math.round(accountBalanceBefore * 1e4) / 1e4

      const endGame = await blackjack
        .connect(owner)
        .endGame(addr1.address, gameRoom, ethers.utils.parseEther("1.0"))
      const withdrawBet = await blackjack
        .connect(addr1)
        .withdrawBet(ethers.utils.parseEther("1.0"), gameRoom)

      const balanceAfter = await addr1.getBalance()
      const accountBalanceAfter = ethers.utils.formatEther(balanceAfter)
      const remainderAfter = Math.round(accountBalanceAfter * 1e4) / 1e4

      expect(remainderAfter).to.be.gte(remainderBefore + 0.9998)
    })

    describe("On chain proof functions", function () {
      it("Should return true for valid proof on-chain", async function () {
        const { blackjackVerifier, blackjack, owner, addr1 } =
          await loadFixture(deployContractFixture)

        const input = {
          sumPlayer: 19,
          sumHouse: 17,
        }

        const dataResult = await exportCallDataGroth16(
          input,
          "./circuits/blackjack.wasm",
          "./circuits/blackjack.zkey"
        )

        console.log("data result", dataResult)

        // Call the function.
        const result = await blackjack.verifyRoundWin(
          dataResult.a,
          dataResult.b,
          dataResult.c,
          dataResult.Input
        )

        console.log("result", result)
        expect(result).to.equal(true)
      })
      it("Should return false for invalid proof on-chain", async function () {
        const { blackjackVerifier, owner, addr1 } = await loadFixture(
          deployContractFixture
        )
        const a = [0, 0]
        const b = [
          [0, 0],
          [0, 0],
        ]
        const c = [0, 0]
        const input = [0, 0, 0]

        const dataResult = { a, b, c, input }

        // Call the function.
        const result = await blackjackVerifier.verifyProof(
          dataResult.a,
          dataResult.b,
          dataResult.c,
          dataResult.input
        )
        expect(result).to.equal(false)
      })
    })
  })
})
