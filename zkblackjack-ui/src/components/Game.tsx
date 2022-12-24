import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
} from "react"
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
import { useRouter } from "next/router"
import { useSockets } from "../context/SocketContext"
import { blackjackCalldata } from "../../zkproof/snarkjsBlackjack"
import { Ace, Card, Sum } from "../context/SocketContext"
import Router from "next/router"

interface IProps {
  library: ethers.providers.Web3Provider
  account: string
  room?: string
}

interface TransactionResponse {
  hash: string
}

export interface RoundResult {
  playerOne: string[]
  playerTwo: string[]
}

export interface Score {
  playerOne: number
  playerTwo: number
}

export const Game: React.FC<IProps> = ({
  library,
  account,

  room,
}) => {
  const [currentDeck, setCurrentDeck] = useState<string[]>([])
  const [score, setScore] = useState<Score>({
    playerOne: 0,
    playerTwo: 0,
  })
  const [roundText, setRoundText] = useState<RoundResult>({
    playerOne: [],
    playerTwo: [],
  })
  const [isCanWithdraw, setIsCanWithdraw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGameEnded, setIsGameEnded] = useState<boolean>(false)

  const {
    socket,
    startDeck,
    setStartDeck,
    isSinglePlayer,
    cards,
    setCards,
    sums,
    setSums,
    aces,
    setAces,
    deckData,
    isGameActive,
    setIsGameActive,
  } = useSockets()

  const router = useRouter()
  const effectRan = useRef(false)

  useEffect(() => {
    if (effectRan.current === false) {
      setIsCanWithdraw(false)

      setIsGameEnded(false)

      if (isSinglePlayer) {
        const firstDeck = constructDeck()
        dealCards(firstDeck)
      }
    }
    return () => {
      effectRan.current = true
    }
  }, [])

  const deck: string[] = []

  const withdrawBet = async (player: string) => {
    try {
      setLoading(false)
      const signer = library?.getSigner()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )
      if (player === "1") {
        if (score.playerOne > 0) {
          const tx: TransactionResponse = await toast.promise(
            blackjackContract.withdrawBet(
              ethers.utils.parseEther("0.02"),
              parseInt(room!)
            ),

            {
              pending: "Withdrawing...",
              success: "Withdrew succesfully",
              error: "Something went wrong 🤯",
            }
          )
          const confirmation = await library.waitForTransaction(tx.hash)
        } else if (score.playerOne === 0) {
          const tx: TransactionResponse = await toast.promise(
            blackjackContract.withdrawBet(
              ethers.utils.parseEther("0.01"),
              parseInt(room!)
            ),

            {
              pending: "Withdrawing...",
              success: "Withdrew succesfully",
              error: "Something went wrong 🤯",
            }
          )
          const confirmation = await library.waitForTransaction(tx.hash)
        }
      } else {
        if (score.playerTwo > 0) {
          const tx: TransactionResponse = await toast.promise(
            blackjackContract.withdrawBet(
              ethers.utils.parseEther("0.02"),
              parseInt(room!)
            ),

            {
              pending: "Withdrawing...",
              success: "Withdrew succesfully",
              error: "Something went wrong 🤯",
            }
          )
          const confirmation = await library.waitForTransaction(tx.hash)
        } else if (score.playerTwo === 0) {
          const tx: TransactionResponse = await toast.promise(
            blackjackContract.withdrawBet(
              ethers.utils.parseEther("0.01"),
              parseInt(room!)
            ),

            {
              pending: "Withdrawing...",
              success: "Withdrew succesfully",
              error: "Something went wrong 🤯",
            }
          )
          const confirmation = await library.waitForTransaction(tx.hash)
        }
      }

      // setRoundText(["Play", "Again"])
      setIsGameEnded(false)
      setIsCanWithdraw(false)
      router.push("/")
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isGameEnded) {
      if (isSinglePlayer) {
        unlockBet(account, "1")
      } else {
      }
      setCards({ playerOneCards: [], playerTwoCards: [], houseCards: [] })
    } else if (!isGameEnded) {
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
  }, [isGameEnded])

  const unlockBet = async (playerAddress: string, playerNumber: string) => {
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

      const gameId = await player.gameId

      if (playerNumber === "1") {
        if (score.playerOne > 0) {
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
        } else if (score.playerOne === 0) {
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
          const endGame: TransactionResponse = await blackjackContract.endGame(
            account,
            gameId,
            ethers.utils.parseEther("0.01")
          )
          const endGameReceipt = await library.waitForTransaction(endGame.hash)

          setIsCanWithdraw(true)
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
          const endGame: TransactionResponse = await blackjackContract.endGame(
            account,
            gameId,
            ethers.utils.parseEther("0.00")
          )
          const endGameReceipt = await library.waitForTransaction(endGame.hash)

          setIsCanWithdraw(false)
        }
      } else {
        if (score.playerTwo > 0) {
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
        } else if (score.playerTwo === 0) {
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
      }

      // setRoundText(["Play", "Again"])
    } catch (err) {
      console.error(err)
    }
  }

  const calculateProof = async (player: string) => {
    let calldata: any
    if (isSinglePlayer) {
      calldata = await blackjackCalldata(sums.playerOneSum, sums.houseSum)
    } else {
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
      if (result) {
        getWinner(
          player,
          calldata.Input[0],
          calldata.Input[1],
          calldata.Input[2]
        )
      } else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
  }

  const constructDeck = () => {
    const cardValues: string[] = [
      "2",
      "3",
      "4",
      "A",
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
        setAces({
          ...aces,
          playerOneAces: aces.playerOneAces + 1,
        })
      }
      setCards({
        ...cards,
        playerOneCards: [...cards.playerOneCards, cardImage],
      })

      setSums({
        ...sums,
        playerOneSum: sums.playerOneSum + playerValue,
      })
      setCurrentDeck(tempDeck)
    }
  }

  useEffect(() => {
    checkAce()
  }, [sums.playerOneSum])

  const dealCards = (deckData: string[]) => {
    let usedDeck: string[] = deckData

    if (deckData.length >= 4) {
      // setRoundText([])

      setAces({
        playerOneAces: 0,
        playerTwoAces: 0,
        houseAces: 0,
      })
      setCards({
        playerOneCards: [],
        playerTwoCards: [],
        houseCards: [],
      })
      setSums({
        playerOneSum: 0,
        playerTwoSum: 0,
        houseSum: 0,
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
          setAces({
            ...aces,
            houseAces: aces.houseAces + 1,
          })
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
          setAces({
            ...aces,
            houseAces: aces.houseAces + 1,
          })
        }

        houseValue += value!
      }

      setSums({
        ...sums,
        houseSum: sums.houseSum + houseValue,
      })
      setCards({
        ...cards,
        houseCards: housecurrentCards,
      })

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
          setAces({
            ...aces,
            playerOneAces: aces.playerOneAces + 1,
          })
        }
      }

      setCards({
        ...cards,
        playerOneCards: playerOneCurrentCards,
      })
      setSums({
        ...sums,
        playerOneSum: sums.playerOneSum + playerOneValue,
      })
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
      toast.error("No more cards left. This is the final round!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      })
      setIsGameActive(false)
      setIsGameEnded(true)
    }
  }

  const checkAce = () => {
    if (sums.playerOneSum > 21 && aces.playerOneAces !== 0) {
      setSums({
        ...sums,
        playerOneSum: sums.playerOneSum - 10,
      })

      setAces({
        ...aces,
        playerOneAces: aces.playerOneAces - 1,
      })

      return true
    }
    // if (playerTwoSum > 21 && aceNumberPlayerTwo !== 0) {
    //   setPlayerOneSum((prevState: number) => prevState - 10)

    //   setAceNumberPlayerTwo((prevState) => prevState - 1)

    //   return true
    // }
    if (sums.houseSum > 21 && aces.houseAces !== 0) {
      // setHouseSum((prevState: number) => prevState - 10)
      setSums({
        ...sums,
        houseSum: sums.houseSum - 10,
      })

      setAces({
        ...aces,
        houseAces: aces.playerOneAces - 1,
      })

      // setAceNumberHouse((prevState) => prevState - 1)
      return true
    }
  }

  const getWinner = (
    player: string,
    result: string,
    draw: string,
    playerSum: string
  ) => {
    if (isSinglePlayer) {
      if (result === "1") {
        setRoundText((prevState) => ({
          ...prevState,
          playerOne: [...prevState.playerOne, "Win"],
        }))
        setScore((prevState) => ({
          ...prevState,
          playerOne: prevState.playerOne + 1,
        }))
      } else if (result === "0") {
        if (draw === "2") {
          setRoundText((prevState) => ({
            ...prevState,
            playerOne: [...prevState.playerOne, "Draw"],
          }))
        } else {
          setRoundText((prevState) => ({
            ...prevState,
            playerOne: [...prevState.playerOne, "Lose"],
          }))
          setScore((prevState) => ({
            ...prevState,
            playerOne: prevState.playerOne - 1,
          }))
        }
      } else if (result === "2") {
        if (parseInt(playerSum) > 21) {
          setRoundText((prevState) => ({
            ...prevState,
            playerOne: [...prevState.playerOne, "Lose"],
          }))
          setScore((prevState) => ({
            ...prevState,
            playerOne: prevState.playerOne - 1,
          }))
        } else {
          setRoundText((prevState) => ({
            ...prevState,
            playerOne: [...prevState.playerOne, "Draw"],
          }))

          // setRoundText({
          //   ...roundText,
          //   playerOne: [...roundText.playerOne, "Lose"],
          // });
        }
      }
      if (currentDeck.length <= 4) {
        setIsGameActive(false)
        setIsGameEnded(true)

        // unlockBet(account, "1")
      } else {
        dealCards(currentDeck)
      }
    } else {
      if (player === "1") {
        if (result === "1") {
          setRoundText((prevState) => ({
            ...prevState,
            playerOne: [...prevState.playerOne, "Win"],
          }))
          setScore((prevState) => ({
            ...prevState,
            playerOne: prevState.playerOne + 1,
          }))
        } else if (result === "0") {
          setRoundText((prevState) => ({
            ...prevState,
            playerOne: [...prevState.playerOne, "Lose"],
          }))
          setScore((prevState) => ({
            ...prevState,
            playerOne: prevState.playerOne - 1,
          }))
        } else if (result === "2") {
          if (parseInt(playerSum) > 21) {
            setRoundText((prevState) => ({
              ...prevState,
              playerOne: [...prevState.playerOne, "Lose"],
            }))
            setScore((prevState) => ({
              ...prevState,
              playerOne: prevState.playerOne - 1,
            }))
            // setRoundText({
            //   ...roundText,
            //   playerOne: [...roundText.playerOne, "Lose"],
            // });
          } else {
            setRoundText((prevState) => ({
              ...prevState,
              playerOne: [...prevState.playerOne, "Draw"],
            }))
          }
        }
      } else {
        if (result === "1") {
          setRoundText((prevState) => ({
            ...prevState,
            playerTwo: [...prevState.playerTwo, "Win"],
          }))
          setScore((prevState) => ({
            ...prevState,
            playerTwo: prevState.playerOne + 1,
          }))
        } else if (result === "0") {
          setRoundText((prevState) => ({
            ...prevState,
            playerTwo: [...prevState.playerTwo, "Lose"],
          }))
          setScore((prevState) => ({
            ...prevState,
            playerTwo: prevState.playerOne - 1,
          }))
        } else if (result === "2") {
          if (parseInt(playerSum) > 21) {
            setRoundText((prevState) => ({
              ...prevState,
              playerTwo: [...prevState.playerTwo, "Lose"],
            }))
            setScore((prevState) => ({
              ...prevState,
              playerTwo: prevState.playerOne + 1,
            }))
          } else {
            setRoundText((prevState) => ({
              ...prevState,
              playerTwo: [...prevState.playerTwo, "Draw"],
            }))
          }
        }
      }
    }
  }

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

  return (
    <div className="h-fit">
      <Table
        isGameEnded={isGameEnded}
        isSinglePlayer={true}
        getCard={getCard}
        library={library}
        account={account}
        // socket={socket}
        room={room}
        currentDeck={currentDeck}
        roundText={roundText}
        score={score}
        isCanWithdraw={isCanWithdraw}
        calculateProof={calculateProof}
        withdrawBet={withdrawBet}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}
