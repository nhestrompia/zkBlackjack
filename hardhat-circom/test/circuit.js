// const { assert } = require("chai")
// const wasm_tester = require("circom_tester").wasm

// describe("Blackjack circuit", function () {
//   let blackjackCircuit

//   before(async function () {
//     blackjackCircuit = await wasm_tester("circuits/blackjack.circom")
//   })

//   it("Should generate the witness successfully", async function () {
//     const input = {
//       sumPlayer: "19",
//       sumHouse: "17",
//     }

//     const witness = await blackjackCircuit.calculateWitness(input)
//     console.log("witness", witness)
//     await blackjackCircuit.assertOut(witness, {})
//   })
// })

const hre = require("hardhat")
const { assert } = require("chai")

describe("Blackjack circuit", () => {
  let circuit

  const input = {
    sumPlayer: "19",
    sumHouse: "17",
  }
  const sanityCheck = true

  before(async () => {
    circuit = await hre.circuitTest.setup("blackjack")
  })

  it("produces a witness with valid constraints", async () => {
    const witness = await circuit.calculateWitness(input)
    console.log("witness", witness)
    await circuit.checkConstraints(witness, sanityCheck)
  })

  it("has expected witness values", async () => {
    const witness = await circuit.calculateLabeledWitness(input, sanityCheck)
    assert.propertyVal(witness, "main.sumPlayer", input.sumPlayer)
    assert.propertyVal(witness, "main.sumHouse", input.sumHouse)
    assert.propertyVal(witness, "main.player21Check", undefined)
    assert.propertyVal(witness, "main.house21Check", "17")
    assert.propertyVal(witness, "main.out", "1")
    assert.propertyVal(witness, "main.draw", "19")
    assert.propertyVal(witness, "main.playerScore", "19")
  })

  it("has the correct output", async () => {
    const expected = { out: 1 }
    const witness = await circuit.calculateWitness(input, sanityCheck)
    await circuit.assertOut(witness, expected)
  })
})
