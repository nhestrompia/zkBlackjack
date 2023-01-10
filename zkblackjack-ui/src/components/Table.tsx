import Image from "next/image"
import React, { useState, useReducer, useEffect } from "react"
import { Scoreboard } from "./Scoreboard"
import { ShareModal } from "./ShareModal"
import truncateEthAddress from "truncate-eth-address"
import { BigNumber, Contract, ethers, providers, utils } from "ethers"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  BLACKJACK_CONTRACT_ABI,
  BLACKJACK_CONTRACT_ADDRESS,
} from "../../constants"
import { useSockets, Withdraw } from "../context/SocketContext"
import { Score } from "../context/SocketContext"

type CardGet = {
  startDeck?: string[] | undefined
  tempDeck?: string[] | undefined
  cardImage?: string | undefined
  playerValue?: number | undefined
}

interface IProps {
  account: string
  // socket: any
  score: Score
  room?: string
  isLoading: boolean
  isGameEnded: boolean
  // isSinglePlayer: boolean
  currentDeck?: string[]
  calculateProof: (val: string) => void
  // getCard: (val: string[]) => void

  library: ethers.providers.Web3Provider
  getCard?: (val: string[], player: string) => CardGet
  playerOneRound: string[]
  playerTwoRound: string[]
  playerOne: string
  setPlayerOne: (val: string) => void
  playerTwo: string
  setPlayerTwo: (val: string) => void
  // unlockBet : (playerAddress : string, player : string) => void
  withdrawBet: (val: string) => void
  // isCanWithdraw: Withdraw
  // getWinner: () => void
}

interface RoomInfo {
  room: string
  deckCards: string[]
  house: PlayerInfo
  player1: PlayerInfo
  player2: PlayerInfo
}

interface PlayerInfo {
  cards: string[]
  aces: number
  sum: number
}

export const Table: React.FC<IProps> = ({
  account,
  library,
  room,
  calculateProof,
  // socket,
  // getCard,
  currentDeck,
  playerOneRound,
  playerTwoRound,
  // isCanWithdraw,
  // score,
  getCard,
  // isSinglePlayer,
  isGameEnded,
  // unlockBet,
  withdrawBet,
  isLoading,
  playerOne,
  playerTwo,
  setPlayerOne,
  setPlayerTwo,
  // getWinner,
}) => {
  const {
    socket,
    startDeck,
    cards,
    deckData,
    isSinglePlayer,
    isGameActive,
    setIsGameActive,
    score,
    setScore,
    stand,
    isCanWithdraw,
  } = useSockets()
  // const handleClick = () => {
  //   dispatch({ type: LeaderboardActionKind.WIN_ROUND, payload: "Win" })
  // }

  const getPlayers = async () => {
    // const signer = library?.getSigner()

    const blackjackContract = new Contract(
      BLACKJACK_CONTRACT_ADDRESS,
      BLACKJACK_CONTRACT_ABI,
      library
    )

    const roomCheck = await blackjackContract.games(parseInt(room!))

    setPlayerOne(roomCheck[2])
    setPlayerTwo(roomCheck[3])
  }

  const hitMe = () => {
    let playerNumber: string
    if (account == playerTwo) {
      playerNumber = "2"
    } else {
      playerNumber = "1"
    }
    const { tempDeck, cardImage, playerValue } = getCard!(
      startDeck,
      playerNumber
    )

    const sendData = {
      deck: tempDeck,
      card: cardImage,
      sum: playerValue,
      player: playerNumber,
      room: room,
    }
    socket.emit("hit_me", sendData)
  }

  const withdrawSafe = async () => {
    const signer = library?.getSigner()

    const blackjackContract = new Contract(
      BLACKJACK_CONTRACT_ADDRESS,
      BLACKJACK_CONTRACT_ABI,
      signer
    )

    const tx = await blackjackContract.withdrawSafe(
      ethers.utils.parseEther("0.5")
    )
  }

  const standHand = async () => {
    // toast.info("Calculating Winner")

    let playerNumber: string
    if (account === playerTwo) {
      playerNumber = "2"
      if (!stand.playerTwo) {
        await calculateProof(playerNumber)
      } else {
        toast.info("Wait for other player")
      }
      // setPlayerTwoRound((prevState: string[]) => [
      //   ...prevState,
      //   "Calculating...",
      // ])
    } else {
      playerNumber = "1"
      if (!stand.playerOne) {
        await calculateProof(playerNumber)
      } else {
        toast.info("Wait for other player")
      }
      // setPlayerOneRound((prevState: string[]) => [
      //   ...prevState,
      //   "Calculating...",
      // ])
    }
  }

  useEffect(() => {
    if (!isSinglePlayer) {
      getPlayers()
    } else {
      setPlayerOne(account)
    }
  }, [cards, isSinglePlayer])

  console.log("is single", isSinglePlayer)

  if (isSinglePlayer) {
    return (
      <div className="   w-fit h-screen mt-2 ml-4 ">
        {/* <div className="h-[1400px] w-[2000px]   absolute -right-2 bg-transparent border-2 rounded-[50%] "></div> */}
        <div className="grid grid-cols-3  grid-rows-2 justify-center   items-center   ">
          <div className="col-start-2 row-start-1 flex flex-col items-center  relative right-8">
            <div className="flex justify-evenly md:flex-row md:justify-center items-center  md:gap-8 md:mt-6 md:mb-4">
              {/* <h1 className="text-white text-3xl pb-4 text-center text-poppins">
          House
        </h1> */}
              <div className="w-28 h-28 absolute border-2 rounded-full"></div>

              {/* <div className="  z-10">
          <Image
            src={"/cards/back.svg"}
            width={120}
            height={120}
            layout="fixed"
          />
        </div> */}
              {cards.houseCards.length > 0 ? (
                cards.houseCards.map((card, index) => {
                  if (index === 0) {
                    return (
                      <div
                        className={` 
                        flex   mt-0.5`}
                      >
                        <Image
                          src={card}
                          width={135}
                          height={140}
                          layout="fixed"
                        />
                      </div>
                    )
                  } else {
                    return (
                      <div className="-ml-[8rem] md:-ml-[8rem]">
                        <Image
                          src={"/cards/back.svg"}
                          width={120}
                          height={120}
                          layout="fixed"
                        />
                      </div>
                    )
                  }
                })
              ) : (
                <div className="flex justify-evenly relative left-12">
                  <div className="">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                  <div className=" relative right-24">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                </div>
              )}
            </div>
            <div
              className={` row-start-1 pt-10  w-fit ${
                isLoading ? "opacity-60" : "opacity-20"
              } mb-5 md:mb-0 flex  z-0 hover:opacity-30 transition duration-300 justify-center  `}
            >
              <Image
                className={`${isLoading ? "animate-spin " : ""} `}
                src={"/logo.svg"}
                width={isLoading ? 90 : 56}
                height={89}
                layout={"fixed"}
              />
            </div>
            {!isLoading ? (
              <div className="relative -z-10 bottom-8 ml-6">
                <Image
                  className="opacity-30"
                  src={"/text.svg"}
                  width={581}
                  height={131}
                  layout="fixed"
                />
              </div>
            ) : (
              <div className="relative -z-10 bottom-8 ml-6">
                <Image
                  className="opacity-30"
                  src={"/final.svg"}
                  width={664}
                  height={155}
                  layout="fixed"
                />
              </div>
            )}
          </div>
          <div className="col-start-1 col-span-3 bottom-14 row-start-2 flex justify-evenly relative ">
            <div className="flex justify-evenly md:flex-row md:justify-center items-center    md:mb-20">
              <div className="w-28 h-28 absolute border-2 rounded-full"></div>
              <div className="flex relative left-5">
                <div className="relative left-14">
                  <Image
                    src={"/cards/back.svg"}
                    width={120}
                    height={120}
                    layout="fixed"
                  />
                </div>
                <div className={`  relative right-8 `}>
                  <Image
                    src={"/cards/back.svg"}
                    width={120}
                    height={120}
                    layout="fixed"
                  />
                </div>
              </div>
              <h1 className="relative top-24 right-32 ml-2 text-white font-poppins text-xl">
                Vitalik
              </h1>
            </div>

            <div
              className={`flex justify-evenly max-w-fit relative right-10 md:flex-row md:justify-center items-center  md:gap-8  md:mb-8`}
            >
              <div className="w-28 h-28 absolute border-2  rounded-full"></div>

              {cards.playerOneCards.length > 0 ? (
                cards.playerOneCards.map((card, index) => {
                  return (
                    <div
                      key={card}
                      className={` ${
                        index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                      }  flex gap-6  relative left-20`}
                    >
                      <Image
                        src={card}
                        width={135}
                        height={140}
                        layout="fixed"
                        priority
                      />
                    </div>
                  )
                })
              ) : (
                <div className="flex relative right-12 w-fit">
                  <div className={`   relative left-36 `}>
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                  <div className={`   relative left-14 `}>
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                  <h1 className="relative h-fit top-[140px] right-14  text-white font-poppins text-xl">
                    Player 1
                  </h1>
                </div>
              )}

              <h1
                className={`relative top-24   ${
                  cards.playerOneCards.length > 2 ? "right-32" : "right-24"
                } text-white font-poppins text-xl`}
              >
                {cards.playerOneCards.length > 0 && truncateEthAddress(account)}
              </h1>
            </div>

            <div className="flex justify-evenly relative right-8 md:flex-row md:justify-center items-center    md:mb-20">
              <div className="w-28 h-28 absolute border-2 rounded-full"></div>
              <div className="flex relative left-2">
                <div className="relative left-14">
                  <Image
                    src={"/cards/back.svg"}
                    width={120}
                    height={120}
                    layout="fixed"
                  />
                </div>
                <div className={`  relative right-8 `}>
                  <Image
                    src={"/cards/back.svg"}
                    width={120}
                    height={120}
                    layout="fixed"
                  />
                </div>
              </div>
              <h1 className="relative top-24 right-32 ml-2 text-white font-poppins text-xl">
                Ben
              </h1>
            </div>
          </div>
          <div className="col-start-1 row-start-1">
            <Scoreboard
              score={score}
              isSinglePlayer={isSinglePlayer}
              playerTwo={playerTwo}
              playerOneRound={playerOneRound}
              // playerTwoRound={playerTwoRound}
              playerOne={playerOne}
            />{" "}
          </div>
          {!isGameEnded && (
            <div className="col-start-3 row-start-1 flex ml-24 mt-6 flex-col items-center  ">
              <button
                onClick={standHand}
                className="p-4 mb-4 hover:scale-110 transition duration-300 ease-in-out"
              >
                <Image
                  src={"/stand.svg"}
                  width={120}
                  height={120}
                  layout="fixed"
                />
              </button>
              {account === "0xB402f112a2C8BF41739129F69c52bb97Eb95119a" && (
                <button className=" p-4 text-white" onClick={withdrawSafe}>
                  Start
                </button>
              )}
              <button className="p-4  mb-4 hover:scale-110 transition duration-300 ease-in-out">
                <Image
                  onClick={() => getCard!(currentDeck!, "1")}
                  src={"/hit.svg"}
                  width={120}
                  height={120}
                  layout="fixed"
                />
              </button>
            </div>
          )}
          {isCanWithdraw.playerOne! && (
            <div className="col-start-3 row-start-1 flex ml-24 mt-6 flex-col items-center">
              <button className="p-4  mb-4 hover:scale-110 transition duration-300 ease-in-out">
                <Image
                  onClick={() => withdrawBet("1")}
                  src={"/withdraw.svg"}
                  width={120}
                  height={120}
                  layout="fixed"
                />
              </button>
            </div>
          )}

          {/* <ShareModal /> */}
        </div>
      </div>
    )
  } else {
    return (
      <div className="    w-fit h-screen mt-2 ml-4">
        {/* <div className="h-[1400px] w-[2000px]   absolute -right-2 bg-transparent border-2 rounded-[50%] "></div> */}
        <div className="grid grid-cols-3  grid-rows-2 justify-center   items-center ">
          <div className="col-start-2 row-start-1 flex flex-col items-center  relative right-8">
            <div className="flex justify-evenly md:flex-row md:justify-center items-center  md:gap-8 md:mt-6 md:mb-4">
              {/* <h1 className="text-white text-3xl pb-4 text-center text-poppins">
              House
            </h1> */}
              <div className="w-28 h-28 absolute border-2 rounded-full"></div>

              {/* <div className="  z-10">
              <Image
                src={"/cards/back.svg"}
                width={120}
                height={120}
                layout="fixed"
              />
            </div> */}
              {cards.houseCards.length > 0 ? (
                cards.houseCards.map((card, index) => {
                  if (index === 0) {
                    return (
                      <div key={card} className="mt-0.5">
                        <Image
                          src={card}
                          width={135}
                          height={140}
                          layout="fixed"
                        />
                      </div>
                    )
                  } else {
                    return (
                      <div key={card} className="-ml-[8rem] md:-ml-[8rem]">
                        <Image
                          src={"/cards/back.svg"}
                          width={120}
                          height={120}
                          layout="fixed"
                        />
                      </div>
                    )
                  }
                })
              ) : (
                <div className="flex justify-evenly relative left-12">
                  <div className="">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                  <div className=" relative right-24">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                </div>
              )}
            </div>
            <div
              className={` row-start-1 pt-10  w-fit ${
                isLoading ? "opacity-60" : "opacity-20"
              } mb-5 md:mb-0 flex  z-0 hover:opacity-30 transition duration-300 justify-center  `}
            >
              <Image
                className={`${isLoading ? "animate-spin " : ""} `}
                src={"/logo.svg"}
                width={isLoading ? 90 : 56}
                height={89}
                layout={"fixed"}
              />
            </div>
            <div className="relative -z-10 bottom-8 ml-6">
              <Image
                className="opacity-30"
                src={"/text.svg"}
                width={581}
                height={131}
                layout="fixed"
              />
            </div>
          </div>
          <div className="col-start-1 col-span-3 bottom-32 row-start-2 flex justify-evenly relative right-16">
            <div className="flex justify-evenly md:flex-row md:justify-center items-center  relative left-52 w-fit  md:mb-20">
              <div className="w-28 h-28 absolute border-2 rounded-full"></div>
              <div className="flex relative left-6">
                <div className="relative left-14">
                  <Image
                    src={"/cards/back.svg"}
                    width={120}
                    height={120}
                    layout="fixed"
                  />
                </div>
                <div className={`  relative right-9 `}>
                  <Image
                    src={"/cards/back.svg"}
                    width={120}
                    height={120}
                    layout="fixed"
                  />
                </div>
              </div>
              <h1 className="relative top-24 right-32 ml-2 text-white font-poppins text-xl">
                Vitalik
              </h1>
            </div>

            <div
              className={`flex justify-evenly max-w-fit relative left-7 md:flex-row md:justify-center items-center  md:gap-8 md:mt-12 md:mb-4`}
            >
              {/* <h1 className="text-white text-3xl pb-4 text-center text-poppins">
              House
            </h1> */}
              <div className="w-28 h-28 absolute  border-2 rounded-full"></div>
              {account && account === playerTwo ? (
                cards.playerTwoCards.length > 0 ? (
                  cards.playerTwoCards.map((card, index) => {
                    if (index === 0) {
                      return (
                        <div
                          key={card}
                          className={` ${
                            index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                          }  flex gap-6  relative left-20`}
                        >
                          <Image
                            src={card}
                            width={135}
                            height={140}
                            layout="fixed"
                          />
                        </div>
                      )
                    } else {
                      if (account === playerOne) {
                        return (
                          <div
                            key={card}
                            className={` "-ml-[8rem]  md:-ml-[8rem]" 
                              flex gap-6  relative left-20`}
                          >
                            <Image
                              src={"/cards/back.svg"}
                              // src={card}
                              width={120}
                              height={120}
                              layout="fixed"
                            />
                          </div>
                        )
                      } else if (account === playerTwo) {
                        return (
                          <div
                            key={card}
                            className={` ${
                              index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                            }  flex gap-6  relative left-20`}
                          >
                            <Image
                              // src={"/cards/back.svg"}
                              src={card}
                              width={135}
                              height={140}
                              layout="fixed"
                            />
                          </div>
                        )
                      }
                    }
                  })
                ) : (
                  <div className="flex justify-evenly relative left-[130px]">
                    <div className="">
                      <Image
                        src={"/cards/back.svg"}
                        width={120}
                        height={120}
                        layout="fixed"
                      />
                    </div>
                    <div className=" relative right-24">
                      <Image
                        src={"/cards/back.svg"}
                        width={120}
                        height={120}
                        layout="fixed"
                      />
                    </div>
                  </div>
                  //                 <div>
                  //                   <div
                  //                     className={`relative ${
                  //                       account ? "left-[77px]" : "left-[52px]"
                  //                     } `}
                  //                   >
                  //                     <Image
                  //                       src={"/cards/back.svg"}
                  //                       width={120}
                  //                       height={120}
                  //                       layout="fixed"
                  //                     />
                  //                   </div>
                  //                   <div
                  //                     className={`
                  // -ml-[6rem] md:-ml-[10.5rem] relative ${
                  //   account ? "left-[77px]" : "left-[52px]"
                  // } `}
                  //                   >
                  //                     <Image
                  //                       src={"/cards/back.svg"}
                  //                       width={120}
                  //                       height={120}
                  //                       layout="fixed"
                  //                     />
                  //                   </div>
                  //                 </div>
                )
              ) : cards.playerOneCards.length > 0 ? (
                cards.playerOneCards.map((card, index) => {
                  if (index === 0) {
                    return (
                      <div
                        key={card}
                        className={` ${
                          index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                        }  flex gap-6  relative left-20`}
                      >
                        <Image
                          src={card}
                          width={135}
                          height={140}
                          layout="fixed"
                        />
                      </div>
                    )
                  } else {
                    if (account === playerOne) {
                      return (
                        <div
                          key={card}
                          className={` ${
                            index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                          }  flex gap-6  relative left-20`}
                        >
                          <Image
                            // src={"/cards/back.svg"}
                            src={card}
                            width={135}
                            height={140}
                            layout="fixed"
                          />
                        </div>
                      )
                    } else if (account === playerTwo) {
                      return (
                        <div
                          key={card}
                          className={` 
  -ml-[6rem] mt-[2px] md:-ml-[10.5rem] relative ${
    account ? "left-[77px]" : "left-[52px]"
  } `}
                        >
                          <Image
                            src={"/cards/back.svg"}
                            // src={card}
                            width={120}
                            height={120}
                            layout="fixed"
                          />
                        </div>
                      )
                    }
                  }
                })
              ) : (
                //               <div>
                //                 <div
                //                   className={`relative ${
                //                     account ? "left-[77px]" : "left-[52px]"
                //                   } `}
                //                 >
                //                   <Image
                //                     src={"/cards/back.svg"}
                //                     width={120}
                //                     height={120}
                //                     layout="fixed"
                //                   />
                //                 </div>
                //                 <div
                //                   className={`
                // -ml-[6rem] md:-ml-[10.5rem] relative ${
                //   account ? "left-[77px]" : "left-[52px]"
                // } `}
                //                 >
                //                   <Image
                //                     src={"/cards/back.svg"}
                //                     width={120}
                //                     height={120}
                //                     layout="fixed"
                //                   />
                //                 </div>
                //               </div>
                <div className="flex justify-evenly relative left-[130px]">
                  <div className="">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                  <div className=" relative right-24">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                </div>
              )}
              <h1 className="relative top-24 right-28  text-white font-poppins text-xl">
                {account ? truncateEthAddress(account) : "Player 1"}
              </h1>
            </div>

            <div className="flex justify-evenly md:flex-row relative right-16 bottom-2 md:justify-center items-center  md:gap-8 -mt-8 md:mb-4">
              {/* <h1 className="text-white text-3xl pb-4 text-center text-poppins">
              House
            </h1> */}
              <div className="w-28 h-28 absolute border-2 rounded-full"></div>
              {/* {account === 

            } */}
              {account && account === playerTwo ? (
                cards.playerOneCards.length > 0 ? (
                  cards.playerOneCards.map((card, index) => {
                    if (index === 0) {
                      return (
                        <div
                          key={card}
                          className={` ${
                            index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                          }  flex gap-6  relative left-20`}
                        >
                          <Image
                            src={card}
                            width={135}
                            height={140}
                            layout="fixed"
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div
                          key={card}
                          className={` ${
                            index !== 0 ? "-ml-[8rem]  md:-ml-[8rem]" : ""
                          }  flex gap-6  relative left-20`}
                        >
                          <Image
                            src={"/cards/back.svg"}
                            // src={card}
                            width={120}
                            height={120}
                            layout="fixed"
                          />
                        </div>
                      )
                    }
                  })
                ) : (
                  <div className="flex relative left-[68px]">
                    <div className="relative left-16">
                      <Image
                        src={"/cards/back.svg"}
                        width={120}
                        height={120}
                        layout="fixed"
                      />
                    </div>
                    <div className={`  relative right-8 `}>
                      <Image
                        src={"/cards/back.svg"}
                        width={120}
                        height={120}
                        layout="fixed"
                      />
                    </div>
                  </div>
                )
              ) : cards.playerTwoCards.length > 0 ? (
                cards.playerTwoCards.map((card, index) => {
                  if (index === 0) {
                    return (
                      <div key={card} className=" relative left-[38px] mt-0.5 ">
                        <Image
                          src={card}
                          width={135}
                          height={140}
                          layout="fixed"
                        />
                      </div>
                    )
                  } else {
                    return (
                      <div
                        key={card}
                        className={` 
  -ml-[6rem]  md:-ml-[10.5rem] relative left-20`}
                      >
                        <Image
                          src={"/cards/back.svg"}
                          // src={card}
                          width={120}
                          height={120}
                          layout="fixed"
                        />
                      </div>
                    )
                  }
                })
              ) : (
                <div className="flex relative left-[68px]">
                  <div className="relative left-16">
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                  <div className={`  relative right-8 `}>
                    <Image
                      src={"/cards/back.svg"}
                      width={120}
                      height={120}
                      layout="fixed"
                    />
                  </div>
                </div>
              )}
              {/* {account && account === playerOne ? deckData.player2.cards.length > 0 ? deckData.player2.cards.map((card,index) => {

            } ) (

              <div className=" relative left-[40px] mt-0.5 ">
                <Image
                  src={deckData.player2.cards[0]!}
                  width={135}
                  height={140}
                  layout="fixed"
                />
              </div>
            ) : (
              <div className={`relative left-[80px]  `}>
                <Image
                  src={"/cards/back.svg"}
                  width={120}
                  height={120}
                  layout="fixed"
                />
              </div>
            )}
            <div
              className={` 
                       -ml-[8rem] md:-ml-[10.5rem] 
                       relative left-[76px]`}
            >
              <Image
                src={"/cards/back.svg"}
                width={120}
                height={120}
                layout="fixed"
              />
            </div> */}
              <h1 className="relative top-24 right-32  text-white font-poppins text-xl">
                {account === playerTwo
                  ? truncateEthAddress(playerOne)
                  : truncateEthAddress(playerTwo)}
              </h1>
            </div>
          </div>
          <div className="col-start-1 row-start-1">
            <Scoreboard
              score={score}
              isSinglePlayer={isSinglePlayer}
              playerTwo={playerTwo}
              playerOneRound={playerOneRound}
              playerTwoRound={playerTwoRound}
              playerOne={playerOne}
            />{" "}
          </div>
          <div className="col-start-3  row-start-1 flex ml-12 mt-6 flex-col items-center  ">
            <button
              onClick={standHand}
              className="p-4 mb-4  hover:scale-110 transition duration-300 ease-in-out"
            >
              <Image
                src={"/stand.svg"}
                width={120}
                height={120}
                layout="fixed"
              />
            </button>
            {account === "0xB402f112a2C8BF41739129F69c52bb97Eb95119a" && (
              <button className=" p-4 text-white" onClick={withdrawSafe}>
                Start
              </button>
            )}
            <button className="p-4  mb-4 hover:scale-110 transition duration-300 ease-in-out">
              <Image
                onClick={hitMe}
                src={"/hit.svg"}
                width={120}
                height={120}
                layout="fixed"
              />
            </button>
          </div>
          {/* <ShareModal /> */}
        </div>
      </div>
    )
  }
}
