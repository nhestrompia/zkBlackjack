import React, { useState, useEffect, useRef, useContext } from "react"
import { BigNumber, Contract, ethers, providers, utils } from "ethers"
import {
  BLACKJACK_CONTRACT_ABI,
  BLACKJACK_CONTRACT_ADDRESS,
  BLACKJACK_VERIFIER_CONTRACT_ABI,
  BLACKJACK_VERIFIER_CONTRACT_ADDRESS,
} from "../../constants/index"
import Image from "next/image"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Modal } from "./Modal"
import { Table } from "./Table"
import { constructDeck } from "../utils/constructDeck"
import { useSockets } from "../context/SocketContext"
import { blackjackCalldata } from "../../zkproof/snarkjsBlackjack"
import { Ace, Card, Sum } from "../context/SocketContext"

interface IProps {
  library: ethers.providers.Web3Provider
  account: string
  isSinglePlayer?: boolean
  // socket: any
  room?: string
}

interface TransactionResponse {
  hash: string
}

export const Game: React.FC<IProps> = ({
  library,
  account,
  isSinglePlayer,

  // socket,
  room,
}) => {
  const [isGameActive, setIsGameActive] = useState<boolean>(false)
  const [isStandSingle, setIsStandSingle] = useState(false)
  const [currentDeck, setCurrentDeck] = useState<string[]>([])
  const [isStandPlayerOne, setIsStandPlayerOne] = useState(false)
  const [isStandPlayerTwo, setIsStandPlayerTwo] = useState(false)
  const [score, setScore] = useState<number>()
  const [roundText, setRoundText] = useState<string[]>([])
  const [isCanWithdraw, setIsCanWithdraw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGameEnded, setIsGameEnded] = useState<boolean>(false)

  const {
    socket,
    isGameStarted,
    startDeck,
    setStartDeck,
    cards,
    setCards,
    sums,
    setSums,
    aces,
    setAces,
    deckData,
  } = useSockets()

  const effectRan = useRef(false)
  // const socket = useContext(SocketContext)

  useEffect(() => {
    if (effectRan.current === false) {
      setRoundText([])
      setIsCanWithdraw(false)
      setIsGameActive(false)
      setIsGameEnded(false)
      // setPlayerOneCards([])
      // setPlayerTwoCards([])
      // setHouseCards([])
      // setHouseSum(0)
      // setPlayerOneSum(0)
      // setPlayerTwoSum(0)
      // setAceNumberPlayerOne(0)
      // setAceNumberPlayerTwo(0)
      // setAceNumberHouse(0)
      // constructDeck()
    }
    return () => {
      effectRan.current = true
    }
  }, [])

  // const sendMessage = async () => {
  //   if (currentMessage !== "") {
  //     const messageData = {
  //       room: room,
  //       author: username,
  //       message: currentMessage,

  //     };

  //     await socket.emit("send_message", messageData);

  //   }
  // };

  // useEffect(() => {
  //   if (!account) {
  //     setRoundText(["Connect", "Wallet"])
  //   } else {
  //     setRoundText([])
  //   }
  // }, [account])

  const deck: string[] = []

  const withdrawBet = async () => {
    try {
      setLoading(false)
      const signer = library?.getSigner()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )
      if (score! > 0) {
        const tx: TransactionResponse = await toast.promise(
          blackjackContract.withdrawBet(ethers.utils.parseEther("0.02")),

          {
            pending: "Withdrawing...",
            success: "Withdrew succesfully",
            error: "Something went wrong 🤯",
          }
        )
        const confirmation = await library.waitForTransaction(tx.hash)
      } else if (score == 0) {
        const tx: TransactionResponse = await toast.promise(
          blackjackContract.withdrawBet(ethers.utils.parseEther("0.01")),

          {
            pending: "Withdrawing...",
            success: "Withdrew succesfully",
            error: "Something went wrong 🤯",
          }
        )
        const confirmation = await library.waitForTransaction(tx.hash)
      }
      setRoundText(["Play", "Again"])
      setIsGameEnded(false)
      setIsCanWithdraw(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isGameEnded === true) {
      unlockBet(account)
      window.setTimeout(() => {
        if (score! > 0) {
          toast.info(
            "You have won the game and extra 0.01 ETH! Wait for withdraw button to come",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: 0,
            }
          )
          setRoundText(["Wait for", `Evaluation`])
        } else if (score === 0) {
          toast.info(
            "It was a close game but it ended in tie. Wait for withdraw button to come to get back your initial bet",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: 0,
            }
          )
          setRoundText(["Wait for", `Evaluation`])
        } else {
          toast.info(
            "It was a close game but you have lost it. Play again to earn back your 0.01 ETH ",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: 0,
            }
          )
          setRoundText(["Wait for", `Evaluation`])
        }
        setIsGameActive(false)
        setLoading(true)
      }, 2000)
    }
  }, [isGameEnded])

  // console.log("socket in game", socket)

  useEffect(() => {
    console.log("is game", isGameActive)
    if (isGameActive === false) {
      setCards({ playerOneCards: [], playerTwoCards: [], houseCards: [] })
    } else if (isGameActive) {
      // dealCards(currentDeck)
      // const data = {
      //   room: room,
      //   deck: currentDeck,
      //   playerOneCards: cards.playerOneCards,
      //   playerTwoCards: cards.playerTwoCards,
      //   houseCards: cards.houseCards,
      // }
      // socket.emit("card_dealt", data)
    }
  }, [isGameActive])

  const unlockBet = async (playerAddress: string) => {
    try {
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY!,
        library
      )

      const signerAddress = signer.getAddress()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )
      const player = await blackjackContract.players(playerAddress)

      console.log("player", player)

      const gameId = await player.gameId

      console.log("gameId", gameId)

      if (score! > 0) {
        const data = {
          from: signerAddress,
          to: BLACKJACK_CONTRACT_ADDRESS,
          value: ethers.utils.parseEther("0.01"),
        }

        const tx: TransactionResponse = await signer.sendTransaction(data)

        const confirmation = await library.waitForTransaction(tx.hash)

        const endGame: TransactionResponse = await blackjackContract.endGame(
          account,
          gameId,
          ethers.utils.parseEther("0.02")
        )
        const endGameReceipt = await library.waitForTransaction(endGame.hash)

        setIsCanWithdraw(true)
      } else if (score === 0) {
        const endGame: TransactionResponse = await blackjackContract.endGame(
          account,
          gameId,
          ethers.utils.parseEther("0.01")
        )
        const endGameReceipt = await library.waitForTransaction(endGame.hash)

        setIsCanWithdraw(true)
      } else {
        const endGame: TransactionResponse = await blackjackContract.endGame(
          account,
          gameId,
          ethers.utils.parseEther("0.00")
        )
        const endGameReceipt = await library.waitForTransaction(endGame.hash)

        setIsCanWithdraw(false)
      }
      setRoundText(["Play", "Again"])
    } catch (err) {
      console.error(err)
    }
  }

  const calculateProof = async (player: string) => {
    let calldata: any
    if (player === "1") {
      calldata = await blackjackCalldata(
        deckData.player1.sum,
        deckData.house.sum
      )
    } else {
      calldata = await blackjackCalldata(
        deckData.player2.sum,
        deckData.house.sum
      )
    }

    try {
      const signer = library?.getSigner()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )

      const result: TransactionResponse =
        await blackjackContract.verifyRoundWin(
          calldata.a,
          calldata.b,
          calldata.c,
          calldata.Input
        )
      const confirmation = await library.waitForTransaction(result.hash)
      console.log("result", result)
    } catch (error) {
      console.error(error)
    }
  }

  const constructDeck = () => {
    const cardValues: string[] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ]
    const cardTypes: string[] = ["D", "C", "H", "S"]

    if (isSinglePlayer) {
      for (let i = 0; i < cardTypes.length; i++) {
        for (let j = 0; j < cardValues.length; j++) {
          deck.push(cardValues[j] + "-" + cardTypes[i])
        }
      }
    } else {
      for (let i = 0; i < 2; i++) {
        for (let i = 0; i < cardTypes.length; i++) {
          for (let j = 0; j < cardValues.length; j++) {
            deck.push(cardValues[j] + "-" + cardTypes[i])
          }
        }
      }
    }

    for (let i = 0; i < deck.length; i++) {
      const randomNumber = Math.floor(Math.random() * deck.length)
      const currentCard = deck[i]
      deck[i] = deck[randomNumber] ?? ""
      deck[randomNumber] = currentCard ?? ""
    }
    setCurrentDeck(deck)
    return deck
  }

  const getCard = (deckData: string[]) => {
    if (sums.playerOneSum >= 21) {
      toast.error("You can't get more cards", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      })
    } else {
      const tempDeck = deckData
      let playerValue = 0
      const playerCard = tempDeck.pop()
      const cardImage = `/cards/${playerCard}.svg`
      const value = getValue(playerCard!)
      playerValue += value!
      if (value == 11) {
        setAces((prevState: Ace) => ({
          ...prevState,
          playerOneAces: prevState.playerOneAces + 1,
        }))
      }
      setCards((prevState: Card) => ({
        ...prevState,
        playerOneCards: [...prevState.playerOneCards, cardImage],
      }))

      setSums((prevState: Sum) => ({
        ...prevState,
        playerOneSum: prevState.playerOneSum + playerValue,
      }))
      setCurrentDeck(tempDeck)
    }
  }

  useEffect(() => {
    if (deckData.deckCards.length <= 4) {
      setIsGameActive(false)
    } else {
      console.log("deck data in game", deckData)
    }
    // const data = {
    //   room: room,
    //   deck: currentDeck,
    //   playerOneCards: playerOneCards,
    //   playerTwoCards: playerTwoCards,
    // }
    // socket.emit("card_dealt", data)
  }, [currentDeck])

  useEffect(() => {
    // setCurrentDeck(startDeck)
    setIsGameActive(isGameStarted)
  }, [socket])

  useEffect(() => {
    const firstDeck = constructDeck()
    dealCards(firstDeck)
  }, [isSinglePlayer])

  // useEffect(() => {
  //   checkAce()
  // }, [sums.playerOneSum,sums.playerTwoSum])

  const dealCards = (deckData: string[]) => {
    let usedDeck: string[] = deckData

    if (deckData.length >= 4) {
      // setRoundText([])

      setAces({
        playerOneAces: 0,
        playerTwoAces: 0,
        houseAces: 0,
      })

      // setIsStand(false)
      let houseValue = 0
      const housecurrentCards: string[] = []
      for (let i = 0; i < 2; i++) {
        const dealerCard = usedDeck?.pop()

        const cardImage = `/cards/${dealerCard}.svg`

        const value = getValue(dealerCard!)
        houseValue += value!
        housecurrentCards.push(cardImage)
        if (value == 11) {
          // setAces({...aces, houseAces : aces.houseAces + 1})
          setAces((prevAces: any) => ({
            ...prevAces,
            houseAces: prevAces.houseAces + 1,
          }))
        }
      }

      while (houseValue < 17) {
        if (usedDeck.length === 2) {
          break
        }
        const dealerCard = usedDeck.pop()
        const cardImage = `/${dealerCard}.png`
        housecurrentCards.push(cardImage)

        const value = getValue(dealerCard!)
        if (value == 11) {
          setAces((prevAces: any) => ({
            ...prevAces,
            houseAces: prevAces.houseAces + 1,
          }))
        }

        houseValue += value!
      }

      setSums((prevSums: any) => ({
        ...prevSums,
        houseSum: prevSums.houseSum + houseValue,
      }))
      setCards((prevCards: any) => ({
        ...prevCards,
        houseCards: housecurrentCards,
      }))

      let playerOneValue = 0

      const playerOneCurrentCards: string[] = []

      for (let i = 0; i < 2; i++) {
        const playerCard = usedDeck.pop()
        const cardImage = `/cards/${playerCard}.svg`
        playerOneCurrentCards.push(cardImage)
        const value = getValue(playerCard!)
        playerOneValue += value!
        if (value == 11) {
          // setAceNumberPlayerOne((prevState) => prevState + 1)
          setAces((prevAces: any) => ({
            ...prevAces,
            playerOneAces: prevAces.playerOneAces + 1,
          }))
        }
      }

      setCards((prevCards: any) => ({
        ...prevCards,
        playerOneCards: playerOneCurrentCards,
      }))
      setSums((prevSums: any) => ({
        ...prevSums,
        playerOneSum: prevSums.playerOneSum + playerOneValue,
      }))
      setCurrentDeck(usedDeck)

      if (
        deckData.length <= 4 &&
        cards.playerOneCards.length < 2 &&
        cards.playerTwoCards.length < 2
      ) {
        // setIsGameActive(false)
        // setIsStand(true)
        // toast.error("No more cards left. This is the final round!", {
        //   position: "top-center",
        //   autoClose: 3000,
        //   hideProgressBar: true,
        //   closeOnClick: true,
        //   pauseOnHover: false,
        //   draggable: true,
        //   progress: undefined,
        // })
      }
    } else {
      // setIsGameActive(false)
    }
  }

  const checkAce = () => {
    if (sums.playerOneSum > 21 && aces.playerOneAces !== 0) {
      setSums((prevSums: Sum) => ({
        ...prevSums,
        playerOneSum: prevSums.playerOneSum - 10,
      }))

      setAces((prevState: Ace) => ({
        ...prevState,
        playerOneAces: prevState.playerOneAces - 1,
      }))

      return true
    }
    // if (playerTwoSum > 21 && aceNumberPlayerTwo !== 0) {
    //   setPlayerOneSum((prevState: number) => prevState - 10)

    //   setAceNumberPlayerTwo((prevState) => prevState - 1)

    //   return true
    // }
    if (sums.houseSum > 21 && aces.houseAces !== 0) {
      // setHouseSum((prevState: number) => prevState - 10)
      setSums((prevState: Sum) => ({
        ...prevState,
        houseSum: prevState.houseSum - 10,
      }))

      setAces((prevState: Ace) => ({
        ...prevState,
        houseAces: prevState.playerOneAces - 1,
      }))

      // setAceNumberHouse((prevState) => prevState - 1)
      return true
    }
  }

  // const getWinner = () => {
  //   setIsStandSingle(true)
  //   if (suplayerOneSum > 21) {
  //     setRoundText(["You", "Lost!"])
  //     setScore((prevState) => prevState! - 1)
  //   } else if (houseSum > 21) {
  //     setRoundText(["You", "Won!"])

  //     setScore((prevState) => prevState! + 1)
  //   } else if (playerOneSum == houseSum) {
  //     setRoundText(["It's a", "Tie!"])
  //   } else if (playerOneSum > houseSum) {
  //     setRoundText(["You", "Won"])

  //     setScore((prevState) => prevState! + 1)
  //   } else if (playerOneSum < houseSum) {
  //     setRoundText(["You", "Lost!"])

  //     setScore((prevState) => prevState! - 1)
  //   }
  //   setPlayerOneSum(0)
  //   setHouseSum(0)
  //   const tempDeck = currentDeck

  //   if (tempDeck.length >= 4) {
  //     window.setTimeout(() => {
  //       dealCards(tempDeck)
  //     }, 2000)
  //   } else {
  //     setIsGameEnded(true)
  //   }
  // }

  const getValue = (card: string) => {
    const data = card?.split("-")
    const value = data[0]

    const check = /\d/.test(value!)

    if (check == false) {
      if (value == "A") {
        return 11
      }
      return 10
    } else {
      return parseInt(value!)
    }
  }

  const startGame = async () => {
    try {
      const signer = library?.getSigner()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )

      const tx: TransactionResponse = await toast.promise(
        blackjackContract.startGame({
          value: ethers.utils.parseEther("0.01"),
        }),

        {
          pending: "Sending transaction...",
          success: "Starting the game",
          error: "Something went wrong 🤯",
        }
      )

      setLoading(true)

      const confirmation = await library.waitForTransaction(tx.hash)

      setLoading(false)
      const tempDeck = constructDeck()
      setScore(0)
      setIsGameActive(true)
      setIsCanWithdraw(false)

      // dealCards(tempDeck)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    // <>
    //   <div
    //     className="items-center justify-center mt-20 md:grid md:grid-cols-3 md:-mt-12"
    //     id="page"
    //   >
    //     <div className="flex flex-col items-center pt-5 lg:col-start-1 md:mt-0">
    //       {isGameActive ? (
    //         <h1 className="pb-4 text-3xl ">Player score : {score}</h1>
    //       ) : isGameEnded ? (
    //         <h1 className="pb-5 text-3xl ">Player score : {score}</h1>
    //       ) : (
    //         ""
    //       )}
    //       <h1></h1>

    //       {!isCanWithdraw && roundText[0] !== "Wait for" && account && (
    //         <button
    //           className={`${
    //             isGameActive ? "hidden" : "md:mt-4"
    //           } p-4 mb-4 hover:scale-110 transition duration-200`}
    //           onClick={startGame}
    //         >
    //           <Image
    //             src={"/start.svg"}
    //             width={120}
    //             height={120}
    //             layout={"fixed"}
    //           />
    //         </button>
    //       )}
    //       {isCanWithdraw && score! >= 0 && (
    //         <button
    //           className={`${
    //             isGameActive ? "mt-8" : ""
    //           } hover:scale-110 transition duration-200`}
    //           onClick={withdrawBet}
    //         >
    //           <Image
    //             className=""
    //             src={"/withdraw.svg"}
    //             width={120}
    //             height={120}
    //             layout={"fixed"}
    //           />
    //         </button>
    //       )}
    //     </div>
    //     <div className="flex flex-col items-center justify-center md:col-start-2">
    //       <h1 className="p-1 mt-2 mb-6 text-2xl font-poppins">Dealer</h1>
    //       <div className="flex flex-wrap items-center lg:flex-nowrap justify-evenly lg:row-start-1 md:flex-row md:justify-center md:gap-10 ">
    //         {houseCards?.length !== 0 ? (
    //           houseCards?.map((card, index) => {
    //             if (index == 0) {
    //               return (
    //                 <div
    //                   className={`${
    //                     isStand ? "transition translate-x-1 duration-300" : ""
    //                   }`}
    //                   key={index}
    //                 >
    //                   <Image
    //                     src={isStand ? card : "/back.png"}
    //                     layout="fixed"
    //                     width={160}
    //                     height={220}
    //                     priority
    //                   />
    //                 </div>
    //               )
    //             } else {
    //               return (
    //                 <div
    //                   key={index}
    //                   className={`${
    //                     index !== 0 ? "-ml-[8rem] md:-ml-[10.5rem]" : ""
    //                   }  `}
    //                 >
    //                   <Image
    //                     src={card}
    //                     layout="fixed"
    //                     width={160}
    //                     height={220}
    //                     priority
    //                   />
    //                 </div>
    //               )
    //             }
    //           })
    //         ) : (
    //           <div className="flex gap-10">
    //             <Image
    //               src={"/back.png"}
    //               layout="fixed"
    //               width={160}
    //               height={220}
    //               loading="lazy"
    //             />

    //             <Image
    //               src={"/back.png"}
    //               layout="fixed"
    //               width={160}
    //               height={220}
    //               loading="lazy"
    //             />
    //           </div>
    //         )}
    //       </div>

    //       <div className="flex flex-row items-center w-full -my-2 justify-evenly ">
    //         {roundText && !loading && (
    //           <span
    //             className={` text-3xl w-1/3 text-right ${
    //               roundText[0] === "It's a" ? "" : ""
    //             }  mt-4 font-sans  `}
    //           >
    //             {roundText[0]}
    //           </span>
    //         )}
    //         <div
    //           className={`${roundText ? "" : " "} ${
    //             roundText && roundText[0] === "It's a" ? "" : ""
    //           } mt-4 md:mt-10 w-1/3 ${
    //             loading ? "opacity-60" : "opacity-20"
    //           } mb-5 md:mb-0 flex justify-center `}
    //         >
    //           <Image
    //             className={`${loading ? "animate-spin " : ""}`}
    //             src={"/logo.svg"}
    //             width={loading ? 90 : 56}
    //             height={89}
    //             layout={"fixed"}
    //           />
    //         </div>
    //         {roundText && !loading && (
    //           <span className={` text-3xl w-1/3 font-sans mt-4`}>
    //             {roundText![1]}
    //           </span>
    //         )}
    //       </div>
    //       <div className="flex items-center justify-evenly md:flex-row md:justify-center md:gap-10 md:mt-10 md:mb-4">
    //         {playerCards.length !== 0 ? (
    //           playerCards.map((card, index) => {
    //             return (
    //               <div
    //                 key={index}
    //                 className={` ${
    //                   index !== 0 ? "-ml-[8rem] md:-ml-[10.5rem]" : ""
    //                 }  flex gap-10  `}
    //               >
    //                 <Image
    //                   src={card}
    //                   layout="fixed"
    //                   width={160}
    //                   height={220}
    //                   priority
    //                 />
    //               </div>
    //             )
    //           })
    //         ) : (
    //           <div className="flex gap-10">
    //             <Image
    //               src={"/back.png"}
    //               layout="fixed"
    //               width={160}
    //               height={220}
    //               loading="lazy"
    //             />

    //             <Image
    //               src={"/back.png"}
    //               layout="fixed"
    //               width={160}
    //               height={220}
    //               loading="lazy"
    //             />
    //           </div>
    //         )}
    //       </div>
    //       <h1 className="mt-2 text-2xl font-poppins">Player - {playerOneSum}</h1>
    //     </div>

    //     <div className="flex items-center justify-center col-start-2 gap-4 mt-4 mr-4 md:row-start-3 lg:row-start-1 lg:col-start-3 md:mt-8 md:mr-0 lg:mr-0 lg:flex-col lg:content-end">
    //       {isGameActive && playerOneSum > 0 && (
    //         <button
    //           className="mx-2 transition duration-200 lg:px-8 hover:scale-110"
    //           onClick={getWinner}
    //         >
    //           <Image
    //             src={"/stand.svg"}
    //             width={120}
    //             height={120}
    //             layout={"fixed"}
    //           />
    //         </button>
    //       )}
    //       {isGameActive && playerOneSum > 0 && currentDeck.length > 0 && (
    //         <button
    //           className={`${
    //             playerOneSum >= 21 ? "cursor-not-allowed " : "cursor-pointer"
    //           } hover:scale-110 transition duration-200`}
    //           onClick={() => getCard(currentDeck)}
    //         >
    //           <Image
    //             src={"/hit.svg"}
    //             width={120}
    //             height={120}
    //             layout={"fixed"}
    //           />
    //         </button>
    //       )}
    //     </div>
    //   </div>
    //   <ToastContainer
    //     position="top-center"
    //     hideProgressBar
    //     newestOnTop={false}
    //     closeOnClick
    //     rtl={false}
    //     pauseOnFocusLoss
    //     draggable
    //   />
    // </>
    <div>
      <Table
        isSinglePlayer={true}
        getCard={getCard}
        library={library}
        account={account}
        socket={socket}
        room={room}
        currentDeck={currentDeck}
        // getCard={getCard}
        calculateProof={calculateProof}
        isGameActive={isGameActive}
        setIsGameActive={setIsGameActive}
        // getWinner={getWinner}
      />
    </div>
  )
}
