import { exportCallDataGroth16 } from "./snarkjsZkproof"

export async function blackjackCalldata(player, house) {
  console.log("player type", typeof player)
  const input = {
    sumPlayer: player,
    sumHouse: house,
  }

  console.log("input", input)

  let dataResult

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "/zkproof/blackjack.wasm",
      "/zkproof/blackjack.zkey"
    )

    console.log("dataresult", dataResult)
  } catch (error) {
    console.log(error)
  }

  return dataResult
}
