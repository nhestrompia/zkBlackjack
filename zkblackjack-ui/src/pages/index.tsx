import type { NextPage } from "next"
import Head from "next/head"
import { useState, useEffect, useContext } from "react"
import { Wallet } from "../components/Wallet"
import io from "socket.io-client"
import Image from "next/image"
import { useRouter } from "next/router"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
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
import { boolean } from "zod"

interface IProps {
  library: ethers.providers.Web3Provider
  account: string
}

interface TransactionResponse {
  hash: string
}

const Home: NextPage<IProps> = ({ library, account }) => {
  const [isJoin, setIsJoin] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const [room, setRoom] = useState("")
  const router = useRouter()

  const {
    socket,
    dealCards,
    startDeck,
    isGameActive,
    setIsGameActive,
    setIsSinglePlayer,
    cards,
    sums,
    aces,
  } = useSockets()

  useEffect(() => {
    setIsGameActive(false)
    setIsSinglePlayer(false)
  }, [])

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
      const joinGame: TransactionResponse = await toast.promise(
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

      const sendData = {
        room: data,
      }
      socket.emit("join_room", sendData)
      setIsGameActive(true)
      router.push(`/room/${data}`)
    }
  }

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

      socket.emit("create_room", gameRoom.toString())
      setIsGameActive(true)

      router.push(`/room/${gameRoom}`)
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
      setIsGameActive(true)

      router.push(`/room/${gameRoom}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="">
      <Head>
        <title>zkBlackjack</title>
        <meta name="description" content="blackjack dApp" />
      </Head>

      <main className="bg-[#144b1e]  pb-1 text-white">
        <nav className="px-8 md:px-2 fixed w-full z-20 top-0 left-0 py-3.5    "></nav>
        {isGameActive ? (
          <div className="flex justify-center  relative top-64 left-0 z-20 ">
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
          <div className="grid items-center justify-center grid-cols-3 mt-20 lg:mt-8">
            {/* <div className="flex items-center justify-center col-start-1 mx-auto w-fit">
              <button
                onClick={startSinglePlayer}
                className="mx-2 transition duration-300 ease-in-out lg:px-8 hover:scale-110"
              >
                <Image
                  src={"/start.svg"}
                  width={120}
                  height={120}
                  layout={"fixed"}
                />
              </button>
            </div> */}
            <div className="flex items-center justify-center col-start-2">
              <Rules />
            </div>
            <div className="flex flex-col items-center justify-center gap-10 mx-auto w-fit">
              <button
                onClick={startSinglePlayer}
                className="mx-2 transition duration-300 ease-in-out lg:px-8 hover:scale-110"
              >
                <Image
                  src={"/create.svg"}
                  width={120}
                  height={120}
                  layout={"fixed"}
                />
              </button>
              {/* <button
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
                </button> */}
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
