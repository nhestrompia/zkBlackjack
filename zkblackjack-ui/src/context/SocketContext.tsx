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

  //   useEffect(() => {
  //   if (!socket) {
  //     setSocket(io("http://localhost:3001"))
  //   }

  //   return () => {
  //     socket?.disconnect()
  //   }
  // }, [])
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
      setStartDeck(usedDeck)

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
      // toast.error("No more cards left. This is the final round!", {
      //   position: "top-center",
      //   autoClose: 3000,
      //   hideProgressBar: true,
      //   closeOnClick: true,
      //   pauseOnHover: false,
      //   draggable: true,
      //   progress: undefined,
      // })
      setIsGameActive(false)
      // setIsGameEnded(true)
    }
  }

  const constructDeck = () => {
    console.log("here utils")

    let deck: string[] = []

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

    for (let i = 0; i < 2; i++) {
      for (let i = 0; i < cardTypes.length; i++) {
        for (let j = 0; j < cardValues.length; j++) {
          deck.push(cardValues[j] + "-" + cardTypes[i])
        }
      }
    }

    for (let i = 0; i < deck.length; i++) {
      const randomNumber = Math.floor(Math.random() * deck.length)
      const currentCard = deck[i]
      deck[i] = deck[randomNumber] ?? ""
      deck[randomNumber] = currentCard ?? ""
    }

    return deck
  }

  console.log("cards", cards)

  useEffect(() => {
    socket.on("new_player", (data) => {
      // setStartDeck(data.deckData)
      const newDeck = constructDeck()
      console.log("here? cont")

      dealCards(newDeck)
      setIsSinglePlayer(false)
      // setCards(data.cards)
      // setSums(data.sums)
      // setAces(data.aces)
      // setStartDeck(data.deck)

      const emitData = {
        deck: startDeck,
        cards: cards,
        sums: sums,
        aces: aces,
      }

      socket.emit("card_dealt", emitData)
      console.log("data", data)
      console.log("socket deck", newDeck)
      setIsSinglePlayer(false)
      // dealCards(data)
      // setIsGameStarted(true)
      setIsGameActive(true)
    })

    // socket.on("got_card", (data) => {
    //   setDeckData((prevState) => ({
    //     ...prevState,
    //     deckCards: data.deckData,
    //     player1: {
    //       cards: data.player1.cards,
    //       sum: data.player1.sum,
    //       aces: data.player1.aces,
    //     },
    //     player2: {
    //       cards: data.player2.cards,
    //       sum: data.player2.sum,
    //       aces: data.player2.aces,
    //     },
    //   }))
    // })

    socket.on("current_deck", (data) => {
      setCards(data.cards)
      setSums(data.sums)
      setAces(data.aces)
      setStartDeck(data.deck)
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
