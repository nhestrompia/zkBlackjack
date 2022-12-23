import React, { useEffect } from "react"
import truncateEthAddress from "truncate-eth-address"
import { RoundResult, Score } from "./Game"

interface IProps {
  playerOne: string
  roundText: RoundResult
  playerTwo: string
  isSinglePlayer: boolean
  score: Score
}

export const Scoreboard: React.FC<IProps> = ({
  playerOne,
  roundText,
  isSinglePlayer,
  playerTwo,
  score,
}) => {
  return (
    <div
      className={`grid text-white font-poppins grid-cols-2 grid-rows-4 text-center mt-4 ${
        isSinglePlayer ? "ml-16" : "ml-10"
      } ml-10 justify-center w-64 h-64 bg-transparent rounded-xl`}
    >
      <div
        className={`col-start-1 row-start-1 row-span-3  col-span-1  ${
          isSinglePlayer ? "" : "border-r-2 border-r-white "
        }border-opacity-20 mt-6 h-fit`}
      >
        <h1 className=" border-b-2 border-b-white pb-2 border-opacity-20">
          {playerOne ? truncateEthAddress(playerOne) : "Player 1"}
        </h1>
        <div className="mt-2 flex flex-col h-full">
          {roundText
            ? roundText.playerOne.map((round: string, index: number) => {
                return (
                  <h1 className="" key={index}>
                    {round}
                  </h1>
                )
              })
            : ""}
        </div>
      </div>
      <div className="row-start-4 mt-28">
        {roundText.playerOne.length > 0 && (
          <h1 className="font-poppins text-xl">Score : {score.playerOne}</h1>
        )}
      </div>
      {!isSinglePlayer && (
        <div className="col-start-2 col-span-1  ">
          <h1 className="border-b-2 border-b-white pb-2 border-opacity-20">
            {playerTwo ? truncateEthAddress(playerTwo) : "Player 2"}
          </h1>
          <div className="mt-2">
            {roundText
              ? roundText.playerTwo.map((round: string, index: number) => {
                  return (
                    <h1 className="" key={index}>
                      {round}
                    </h1>
                  )
                })
              : ""}
          </div>
        </div>
      )}
    </div>
  )
}
