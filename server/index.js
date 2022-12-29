const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

// app.use(cors())

// const server = http.createServer(app)

// const io = new Server(server, {
//   cors: {
//     origin: ["*", "http://localhost:3000"],
//     methods: ["GET", "POST"],
//   },
// })

const server = require("http").createServer()
options = {
  cors: true,
  origins: ["*", "http://localhost:3000"],
}
const io = require("socket.io")(server, options)

// let roomInfo = []

// let rooms = []

// const constructDeck = () => {
//   let deck = []

//   const cardValues = [
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
//   const cardTypes = ["D", "C", "H", "S"]

//   // if (isSinglePlayer) {
//   //   for (let i = 0; i < cardTypes.length; i++) {
//   //     for (let j = 0; j < cardValues.length; j++) {
//   //       deck.push(cardValues[j] + "-" + cardTypes[i])
//   //     }
//   //   }
//   // }

//   for (let i = 0; i < 2; i++) {
//     for (let i = 0; i < cardTypes.length; i++) {
//       for (let j = 0; j < cardValues.length; j++) {
//         deck.push(cardValues[j] + "-" + cardTypes[i])
//       }
//     }
//   }

//   for (let i = 0; i < deck.length; i++) {
//     const randomNumber = Math.floor(Math.random() * deck.length)
//     const currentCard = deck[i]
//     deck[i] = deck[randomNumber] ?? ""
//     deck[randomNumber] = currentCard ?? ""
//   }

//   return deck
// }

// const getValue = (card) => {
//   const data = card.split("-")
//   const value = data[0]

//   const check = /\d/.test(value)

//   if (check == false) {
//     if (value == "A") {
//       return 11
//     }
//     return 10
//   } else {
//     return parseInt(value)
//   }
// }

// const dealCards = (deckData) => {
//   let player1 = {
//     cards: [],
//     aces: 0,
//     sum: 0,
//   }
//   let player2 = {
//     cards: [],
//     aces: 0,
//     sum: 0,
//   }
//   let house = {
//     cards: [],
//     aces: 0,
//     sum: 0,
//   }

//   if (deckData.length >= 4) {
//     let houseValue = 0
//     let housecurrentCards = []
//     for (let i = 0; i < 2; i++) {
//       const dealerCard = deckData.pop()

//       const cardImage = `/cards/${dealerCard}.svg`

//       const value = getValue(dealerCard)
//       houseValue += value
//       housecurrentCards.push(cardImage)
//       if (value == 11) {
//         house.aces += 1
//       }
//     }

//     while (houseValue < 17) {
//       if (deckData.length === 2) {
//         break
//       }
//       const dealerCard = deckData.pop()
//       const cardImage = `/${dealerCard}.png`
//       housecurrentCards.push(cardImage)

//       const value = getValue(dealerCard)
//       if (value == 11) {
//         house.aces += 1
//       }

//       houseValue += value

//       if (houseValue > 21) {
//         if (house.aces > 0) {
//           houseValue -= 10
//           house.aces -= 1
//         }
//       }
//     }

//     // setHouseSum((prevState: number) => prevState + houseValue)

//     house.sum += houseValue
//     house.cards = housecurrentCards

//     // setHouseCards(housecurrentCards)

//     let playerOneValue = 0
//     let playerTwoValue = 0
//     const playerOneCurrentCards = []
//     const playerTwoCurrentCards = []

//     for (let i = 0; i < 2; i++) {
//       const playerCard = deckData.pop()
//       const cardImage = `/cards/${playerCard}.svg`
//       playerOneCurrentCards.push(cardImage)
//       const value = getValue(playerCard)
//       playerOneValue += value
//       if (value == 11) {
//         // setAceNumberPlayerOne((prevState) => prevState + 1)
//         player1.aces += 1
//       }
//     }
//     for (let i = 0; i < 2; i++) {
//       const playerCard = deckData.pop()
//       const cardImage = `/cards/${playerCard}.svg`
//       playerTwoCurrentCards.push(cardImage)
//       const value = getValue(playerCard)
//       playerTwoValue += value
//       if (value == 11) {
//         player2.aces += 1
//       }
//     }
//     if (playerOneValue > 21) {
//       if (player1.aces > 0) {
//         playerOneValue -= 10
//         player1.aces -= 1
//       }
//     }
//     if (playerTwoValue > 21) {
//       if (player1.aces > 0) {
//         playerTwoValue -= 10
//         player1.aces -= 1
//       }
//     }

//     player1.cards = playerOneCurrentCards
//     player2.cards = playerTwoCurrentCards

//     player1.sum += playerOneValue
//     player2.sum += playerTwoValue

//     return { player1, player2, house, deckData }
//   }
// }

// const getCard = (deckData, player, room) => {
//   console.log("player ", player)
//   console.log("room", roomInfo)
//   let currentRoom = roomInfo.find((roomData) => roomData.room === room)
//   if (currentRoom.player1.aces > 0 && currentRoom.player1.sum > 21) {
//     currentRoom.player1.aces -= 1
//     currentRoom.player1.sum -= 10
//   }
//   if (currentRoom.player2.aces > 0 && currentRoom.player2.sum > 21) {
//     currentRoom.player2.aces -= 2
//     currentRoom.player2.sum -= 10
//   }
//   console.log("current", currentRoom)
//   if (player === "1") {
//     if (currentRoom.player1.sum >= 21) {
//       return
//     } else {
//       let playerValue = 0
//       const playerCard = deckData.pop()
//       const cardImage = `/cards/${playerCard}.svg`
//       const value = getValue(playerCard)
//       playerValue += value

//       currentRoom.deckData = deckData
//       if (value == 11) {
//         currentRoom.player1.aces += 1
//       }

//       currentRoom.player1.cards.push(cardImage)
//       currentRoom.player1.sum += playerValue
//     }
//   } else if (player === "2") {
//     if (currentRoom.player2.sum >= 21) {
//       return
//     } else {
//       let playerValue = 0
//       const playerCard = deckData.pop()
//       const cardImage = `/cards/${playerCard}.svg`
//       const value = getValue(playerCard)
//       playerValue += value

//       currentRoom.deckData = deckData
//       if (value == 11) {
//         currentRoom.player2.aces += 1
//       }

//       currentRoom.player2.cards.push(cardImage)
//       currentRoom.player2.sum += playerValue
//     }
//   }
// }

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`)
  socket.on("join_room", (data) => {
    console.log(
      `User with ID: ${socket.id} joined room: ${data.room}`,
      typeof data.room
    )
    socket.join(data.room)
    // socket.to(data.room).emit("player_joined", data.deck)
    // console.log("data emitted")
    // const deck = constructDeck()
    // console.log("roomINFO in join", roomInfo)
    // const { player1, player2, house, deckData } = dealCards(deck)
    // let currentRoom = roomInfo.filter((roomData) => {
    //   roomData.room == data.room
    // })
    // let currentRoom = { room: data.room, player1, player2, house, deckData }
    // roomInfo.push(currentRoom)

    // console.log(data.deck, "data emitted2")
    // console.log("roomInfo", currentRoom)
    console.log("data new", data)

    io.in(data.room).emit("new_player", data)

    // socket.to(data.room).emit("new_player", data.deck)

    // io.of(data.room).emit("new_player", data.deck)
  })

  socket.on("create_room", (data) => {
    console.log(
      `User with ID: ${socket.id} created room: ${data} `,
      typeof data
    )
    // console.log("userList", roomInfo)
    socket.join(data)
  })

  socket.on("hit_me", (data) => {
    console.log("data hitme0", data)
    // getCard(data.deck, data.player, data.room)
    // let currentRoom = roomInfo.find((roomData) => roomData.room == data.room)
    // io.in(data.room).emit("got_card", currentRoom)
  })

  socket.on("stand", (data) => {})

  // socket.on("player_joined", (data) => {
  // io.in(data.room).emit("new_player", data.deck)
  //   console.log("data player joined", data)
  //   socket.to(data.room).emit("new_player", data.deck)
  // })

  socket.on("card_dealt", (data) => {
    console.log("data dealt", data)
    io.in(data.room).emit("current_deck", data)
  })

  socket.on("disconnect", () => {
    console.log(`User :${socket.id} has disconnected`)
  })
})

server.listen(3001, () => {
  console.log("Server is running")
})
