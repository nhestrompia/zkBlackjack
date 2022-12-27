import { createContext, useContext, useEffect, useState } from "react"
import io, { Socket } from "socket.io-client"
// import { SOCKET_URL } from "../config/default";
// import EVENTS from "../config/events";

interface Context {
  socket: Socket
  aces: Ace
  setAces: Function
  // username?: string;
  // setUsername: Function;
  // messages?: { message: string; time: string; username: string }[];
  // setMessages: Function;
  startDeck: string[]
  setStartDeck: Function

  roomId?: string
  cards: Card
  setCards: Function
  sums: Sum
  setSums: Function
  dealCards: Function
  deckData: SocketData
  setDeckData: Function
  setIsGameActive: (val: boolean) => false
  setIsSinglePlayer: (val: boolean) => false
  isSinglePlayer: boolean
  isGameActive: boolean
  // rooms: object;
}

interface SocketData {
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

export interface Ace {
  playerOneAces: number
  playerTwoAces: number
  houseAces: number
}
export interface Card {
  playerOneCards: string[]
  playerTwoCards: string[]
  houseCards: string[]
}
export interface Sum {
  playerOneSum: number
  playerTwoSum: number
  houseSum: number
}

const socket = io("http://localhost:3001")

const SocketContext = createContext<Context>({
  socket,
  isSinglePlayer: false,
  setIsSinglePlayer: (val: boolean) => false,
  setDeckData: () => false,
  deckData: {
    room: "",
    deckCards: [],
    house: {
      cards: [],
      sum: 0,
      aces: 0,
    },
    player1: {
      cards: [],
      sum: 0,
      aces: 0,
    },
    player2: {
      cards: [],
      sum: 0,
      aces: 0,
    },
  },
  startDeck: [],
  aces: {
    playerOneAces: 0,
    playerTwoAces: 0,
    houseAces: 0,
  },
  setAces: () => false,
  cards: {
    playerOneCards: [],
    playerTwoCards: [],
    houseCards: [],
  },
  setCards: () => false,
  dealCards: () => false,
  sums: {
    playerOneSum: 0,
    playerTwoSum: 0,
    houseSum: 0,
  },
  setSums: () => false,

  setIsGameActive: (val: boolean) => false,
  setStartDeck: (val: string[]) => false,
  roomId: "",
  isGameActive: false,
})

function SocketsProvider(props: any) {
  const [startDeck, setStartDeck] = useState<string[]>([])
  // const [isGameStarted, setIsGameStarted] = useState<boolean>(false)
  const [deckData, setDeckData] = useState<SocketData>({
    room: "",
    deckCards: [],
    house: {
      cards: [],
      sum: 0,
      aces: 0,
    },
    player1: {
      cards: [],
      sum: 0,
      aces: 0,
    },
    player2: {
      cards: [],
      sum: 0,
      aces: 0,
    },
  })
  const [sums, setSums] = useState<Sum>({
    playerOneSum: 0,
    playerTwoSum: 0,
    houseSum: 0,
  })
  const [cards, setCards] = useState<Card>({
    playerOneCards: [],
    playerTwoCards: [],
    houseCards: [],
  })
  const [aces, setAces] = useState<Ace>({
    playerOneAces: 0,
    playerTwoAces: 0,
    houseAces: 0,
  })

  const [isGameActive, setIsGameActive] = useState(false)
  const [isSinglePlayer, setIsSinglePlayer] = useState(false)

  // socket.on("player_joined", (value) => {
  //   setRoomId(value);

  // });

  // setCards((prevCards) => ({ ...prevCards, playerOneCards: newCards }));

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
          setAces((prevAces) => ({
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
          setAces((prevAces) => ({
            ...prevAces,
            houseAces: prevAces.houseAces + 1,
          }))
        }

        houseValue += value!
      }

      // setHouseSum((prevState: number) => prevState + houseValue)
      setSums((prevSums) => ({
        ...prevSums,
        houseSum: prevSums.houseSum + houseValue,
      }))
      setCards((prevCards) => ({ ...prevCards, houseCards: housecurrentCards }))

      // setHouseCards(housecurrentCards)

      let playerOneValue = 0
      let playerTwoValue = 0
      const playerOneCurrentCards: string[] = []
      const playerTwoCurrentCards: string[] = []

      for (let i = 0; i < 2; i++) {
        const playerCard = usedDeck.pop()
        const cardImage = `/cards/${playerCard}.svg`
        playerOneCurrentCards.push(cardImage)
        const value = getValue(playerCard!)
        playerOneValue += value!
        if (value == 11) {
          // setAceNumberPlayerOne((prevState) => prevState + 1)
          setAces((prevAces) => ({
            ...prevAces,
            playerOneAces: prevAces.playerOneAces + 1,
          }))
        }
      }
      for (let i = 0; i < 2; i++) {
        const playerCard = usedDeck.pop()
        const cardImage = `/cards/${playerCard}.svg`
        playerTwoCurrentCards.push(cardImage)
        const value = getValue(playerCard!)
        playerTwoValue += value!
        if (value == 11) {
          setAces((prevAces) => ({
            ...prevAces,
            playerTwoAces: prevAces.playerTwoAces + 1,
          }))
        }
      }
      setCards((prevCards) => ({
        ...prevCards,
        playerOneCards: playerOneCurrentCards,
        playerTwoCards: playerTwoCurrentCards,
      }))
      setSums((prevSums) => ({
        ...prevSums,
        playerOneSum: prevSums.playerOneSum + playerOneValue,
        playerTwoSum: prevSums.playerTwoSum + playerTwoValue,
      }))
      setStartDeck(usedDeck)

      // setPlayerOneCards(playerOneCurrentCards)
      // setPlayerOneSum(playerOneValue)
      // setPlayerTwoCards(playerTwoCurrentCards)
      // setPlayerTwoSum(playerTwoValue)

      const emitData = {
        playerOneCards: playerOneCurrentCards,
        playerTwoCards: playerTwoCurrentCards,
        playerOneSum: sums.playerOneSum,
        playerTwoSum: sums.playerTwoSum,
        houseSum: sums.houseSum,
        houseCards: housecurrentCards,
      }

      socket.emit("card_dealt", emitData)

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

  //   useEffect(() => {
  //   if (!socket) {
  //     setSocket(io("http://localhost:3001"))
  //   }

  //   return () => {
  //     socket?.disconnect()
  //   }
  // }, [])

  useEffect(() => {
    socket.on("new_player", (data) => {
      // setStartDeck(data.deckData)
      // setCards({
      //   playerOneCards: data.player1.cards,
      //   playerTwoCards: data.player2.cards,
      //   houseCards: data.house.cards,
      // })
      // setSums({
      //   playerOneSum: data.player1.sum,
      //   playerTwoSum: data.player1.sum,
      //   houseSum: data.house.sum,
      // })
      // setAces({
      //   playerOneAces: data.player1.aces,
      //   playerTwoAces: data.player2.aces,
      //   houseAces: data.house.aces,
      // })
      setDeckData({
        room: data.room,
        deckCards: data.deckData,
        house: {
          cards: data.house.cards,
          sum: data.house.sum,
          aces: data.house.aces,
        },
        player1: {
          cards: data.player1.cards,
          sum: data.player1.sum,
          aces: data.player1.aces,
        },
        player2: {
          cards: data.player2.cards,
          sum: data.player2.sum,
          aces: data.player2.aces,
        },
      })
      // dealCards(data)
      // setIsGameStarted(true)
      setIsGameActive(true)
    })

    socket.on("got_card", (data) => {
      setDeckData((prevState) => ({
        ...prevState,
        deckCards: data.deckData,
        player1: {
          cards: data.player1.cards,
          sum: data.player1.sum,
          aces: data.player1.aces,
        },
        player2: {
          cards: data.player2.cards,
          sum: data.player2.sum,
          aces: data.player2.aces,
        },
      }))
    })

    socket.on("current_deck", (data) => {
      // setStartDeck(data.deck)
      // setCards({
      //   playerOneCards: data.playerOneCards,
      //   playerTwoCards: data.playerTwoCards,
      //   houseCards: data.houseCards,
      // })
    })

    // socket.on()
  }, [socket])

  return (
    <SocketContext.Provider
      value={{
        socket,
        setStartDeck,
        startDeck,
        sums,
        setSums,
        setCards,
        cards,
        aces,
        setAces,
        deckData,
        setIsGameActive,
        isGameActive,
        isSinglePlayer,
        setIsSinglePlayer,
        // dealCards,
      }}
      {...props}
    />
  )
}

export const useSockets = () => useContext(SocketContext)

export default SocketsProvider
