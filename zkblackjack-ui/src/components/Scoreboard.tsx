import React, { useEffect } from "react"
import truncateEthAddress from "truncate-eth-address"

interface IProps {
  playerOne: string
  roundText: Array<string>
  playerTwo: string
  isSinglePlayer: boolean
}

export const Scoreboard: React.FC<IProps> = ({
  playerOne,
  roundText,
  isSinglePlayer,
  playerTwo,
}) => {
  return (
    <div
      className={`grid text-white font-poppins grid-cols-2 text-center mt-4 ${
        isSinglePlayer ? "ml-16" : "ml-10"
      } ml-10 justify-center w-64 h-64 bg-transparent rounded-xl`}
    >
      <div
        className={`col-start-1 col-span-1 ${
          roundText.length > 0 ? "border-b-2 border-b-white" : ""
        } ${
          isSinglePlayer ? "" : "border-r-2 border-r-white "
        }border-opacity-20`}
      >
        <h1 className=" border-b-2 border-b-white pb-2 border-opacity-20">
          {playerOne ? truncateEthAddress(playerOne) : "Player 1"}
        </h1>
        <div className="mt-2">
          {roundText
            ? roundText.map((round: string, index: number) => {
                return (
                  <h1 className="" key={index}>
                    {round}
                  </h1>
                )
              })
            : ""}
        </div>
      </div>
      {!isSinglePlayer && (
        <div className="col-start-2 col-span-1  ">
          <h1 className="border-b-2 border-b-white pb-2 border-opacity-20">
            {playerTwo ? truncateEthAddress(playerTwo) : "Player 2"}
          </h1>
        </div>
      )}
    </div>
  )
}
