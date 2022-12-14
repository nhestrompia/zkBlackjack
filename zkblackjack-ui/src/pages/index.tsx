import type { NextPage } from "next"
import Head from "next/head"
import { useState, useEffect, useContext } from "react"
import { Wallet } from "../components/Wallet"
import io from "socket.io-client"
import Image from "next/image"
import { useRouter } from "next/router"
import { toast, ToastContainer } from "react-toastify"
import { constructDeck } from "../utils/constructDeck"
import {
  BLACKJACK_CONTRACT_ABI,
  BLACKJACK_CONTRACT_ADDRESS,
} from "../../constants"

import { Game } from "../components/Game"
import { BigNumber, Contract, ethers, providers, utils } from "ethers"
import Rules from "../components/Rules"
import { Modal } from "../components/Modal"
import { useSockets } from "../context/SocketContext"

interface IProps {
  library: ethers.providers.Web3Provider
  account: string
  socket: any
  setIsSinglePlayer: (val: boolean) => void
  isSinglePlayer: boolean
}

interface TransactionResponse {
  hash: string
}

const Home: NextPage<IProps> = ({
  library,
  account,
  isSinglePlayer,
  setIsSinglePlayer,
}) => {
  // const [library, setLibrary] = useState<ethers.providers.Web3Provider>()
  // const [account, setAccount] = useState<string>("")
  // const [provider, setProvider] = useState()
  const [isJoin, setIsJoin] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  // const [isGameStarted, setIsGameStarted] = useState<boolean>(false)
  const [room, setRoom] = useState("")
  const router = useRouter()

  const { socket, isGameStarted, dealCards, startDeck, cards, sums, aces } =
    useSockets()
  // const socket = useContext(SocketContext)

  // Messages States

  // const constructDeck = () => {
  //   const cardValues: string[] = [
  //     "A",
  //     "2",
  //     "3",
  //     "4",
  //     "5",
  //     "6",
  //     "7",
  //     "8",
  //     "9",
  //     "10",
  //     "J",
  //     "Q",
  //     "K",
  //   ]
  //   const cardTypes: string[] = ["D", "C", "H", "S"]

  //   if (isSinglePlayer) {
  //     for (let i = 0; i < cardTypes.length; i++) {
  //       for (let j = 0; j < cardValues.length; j++) {
  //         deck.push(cardValues[j] + "-" + cardTypes[i])
  //       }
  //     }
  //   } else {
  //     for (let i = 0; i < 2; i++) {
  //       for (let i = 0; i < cardTypes.length; i++) {
  //         for (let j = 0; j < cardValues.length; j++) {
  //           deck.push(cardValues[j] + "-" + cardTypes[i])
  //         }
  //       }
  //     }
  //   }

  //   for (let i = 0; i < deck.length; i++) {
  //     const randomNumber = Math.floor(Math.random() * deck.length)
  //     const currentCard = deck[i]
  //     deck[i] = deck[randomNumber] ?? ""
  //     deck[randomNumber] = currentCard ?? ""
  //   }
  //   // setCurrentDeck(deck)
  //   return deck
  // }

  const joinRoom = async (data: any) => {
    const signer = library?.getSigner()

    const blackjackContract = new Contract(
      BLACKJACK_CONTRACT_ADDRESS,
      BLACKJACK_CONTRACT_ABI,
      signer
    )

    const roomCheck = await blackjackContract.games(parseInt(room))

    if (
      room !== "" &&
      roomCheck[2] !== "0x0000000000000000000000000000000000000000"
    ) {
      const joinGame: TransactionResponse = await await toast.promise(
        blackjackContract.joinGame(room, {
          value: ethers.utils.parseEther("0.01"),
        }),
        {
          pending: "Sending transaction...",
          success: "Joining to room",
          error: "Something went wrong 🤯",
        }
      )
      const confirmation = await library.waitForTransaction(joinGame.hash)

      // const deck = constructDeck()
      // await dealCards(deck)

      // console.log("page deck", deck)

      const sendData = {
        room: data,
        // account: account,
        // deck: deck,
        // playerOneCards: cards.playerOneCards,
        // playerTwoCards: cards.playerTwoCards,
        // houseCards: cards.houseCards,
        // playerOneAces: aces.playerOneAces,
        // playerTwoAces: aces.playerTwoAces,
        // houseAces: aces.houseAces,
        // playerOneSums: sums.playerOneSum,
        // playerTwoSums: sums.playerTwoSum,
        // houseSums: sums.houseSum,
      }
      socket.emit("join_room", sendData)
      router.push(`/room/${data}`)
    }
  }

  //TODO put construct deck and deal cards here and emit it to backend in joinroom

  const createRoom = async () => {
    try {
      const signer = library?.getSigner()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )
      const gameRoom = await blackjackContract.gameId()

      const createGame: TransactionResponse = await toast.promise(
        blackjackContract.startMultiplayerGame({
          value: ethers.utils.parseEther("0.01"),
        }),

        {
          pending: "Sending transaction...",
          success: "Starting the game",
          error: "Something went wrong 🤯",
        }
      )

      const confirmation = await library.waitForTransaction(createGame.hash)

      console.log("game room", gameRoom)

      router.push(`/room/${gameRoom}`)
      socket.emit("create_room", gameRoom.toString())
    } catch (err) {
      console.error(err)
    }
  }

  const startSinglePlayer = async () => {
    try {
      const signer = library?.getSigner()

      const blackjackContract = new Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_CONTRACT_ABI,
        signer
      )

      const gameRoom = await blackjackContract.gameId()

      const createGame: TransactionResponse = await toast.promise(
        blackjackContract.startSinglePlayerGame({
          value: ethers.utils.parseEther("0.01"),
        }),

        {
          pending: "Sending transaction...",
          success: "Starting the game",
          error: "Something went wrong 🤯",
        }
      )

      const confirmation = await library.waitForTransaction(createGame.hash)
      setIsSinglePlayer(true)
      console.log("game room", gameRoom)

      router.push(`/room/${gameRoom}`)
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = () => {
    // socket.emit("send_message", { message, room })
  }

  // const createRoom = () => {
  //   router.push()
  // }

  // useEffect(() => {
  //   socket.on("receive_message", (data) => {
  //     setMessageReceived(data.message)
  //   })
  // }, [socket])

  return (
    <div className="">
      <Head>
        <title>zkBlackjack</title>
        <meta name="description" content="blackjack dApp" />
      </Head>

      <main className="bg-[#144b1e]  pb-1 text-white">
        <nav className="px-8 md:px-2 fixed w-full z-20 top-0 left-0 py-3.5    ">
          {/* <div className="container flex flex-wrap items-center justify-between mx-auto"> */}
          {/* <div className="grid items-center justify-center grid-cols-3 mx-2">
            <h1 className="col-start-1 text-3xl font-bold leading-normal font-poppins ">
              zkBlackjack
            </h1>
            <div className="col-start-3 text-end">
              <Wallet
                account={account}
                setAccount={setAccount}
                setProvider={setProvider}
                provider={provider}
                setLibrary={setLibrary}
                library={library!}
              />
            </div>
          </div> */}
        </nav>
        {isGameStarted ? (
          <div className="flex justify-center  relative top-64 left-0 z-20 ">
            {" "}
            {/* <Game
              isSinglePlayer={isSinglePlayer}
              library={library!}
              account={account}
            /> */}
            {/* <Image
              src={"/loader.svg"}
              width={64}
              height={64}
              layout="fixed"
              className=""
            /> */}
            {/* <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle className="spinner_ZCsl" cx="12" cy="12" r="0" />
              <circle
                className="spinner_ZCsl spinner_gaIW"
                cx="12"
                cy="12"
                r="0"
              />
            </svg> */}
            <svg
              width="36"
              height="36"
              fill="#fff"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse className="spinner_rXNP" cx="12" cy="5" rx="4" ry="4" />
            </svg>
          </div>
        ) : (
          <div className="grid items-center justify-center grid-cols-3 mt-20 lg:-mt-4">
            <div className="flex items-center justify-center col-start-1 mx-auto w-fit">
              <button
                onClick={startSinglePlayer}
                className="mx-2 transition duration-300 ease-in-out lg:px-8 hover:scale-110"
              >
                <Image
                  src={"/single.svg"}
                  width={120}
                  height={120}
                  layout={"fixed"}
                />
              </button>
            </div>
            <div className="flex items-center justify-center col-start-2">
              <Rules />
            </div>
            <div className="flex flex-col items-center justify-center gap-10 mx-auto w-fit">
              <button
                onClick={createRoom}
                className="mx-2 transition duration-300 ease-in-out lg:px-8 hover:scale-110"
              >
                <Image
                  src={"/create.svg"}
                  width={120}
                  height={120}
                  layout={"fixed"}
                />
              </button>
              <button
                onClick={() => {
                  setIsJoin(true)
                  setIsModalOpen(true)
                }}
                className="mx-2 transition duration-300 ease-in-out lg:px-8 hover:scale-110"
              >
                <Image
                  src={"/join.svg"}
                  width={120}
                  height={120}
                  layout={"fixed"}
                />
              </button>
            </div>
            <Modal
              // setIsGameStarted={setIsGameStarted}
              setIsModalOpen={setIsModalOpen}
              isModalOpen={isModalOpen}
              isJoin={isJoin}
              joinRoom={joinRoom}
              setRoom={setRoom}
              room={room}
            />
          </div>
        )}
      </main>
      <ToastContainer
        position="top-center"
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

export default Home
