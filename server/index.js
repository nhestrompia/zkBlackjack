const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

app.use(cors())

// const server = http.createServer(app)

// const io = new Server(server, {
//   cors: {
//     origin: ["*", "http://localhost:3000"],
//     methods: ["GET", "POST"],
//   },
// })

const server = require("http").createServer()
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    // origin: "http://zkblackjack.onrender.com/",
    origin: "*",
    methods: ["GET", "POST"],
  },
})

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

    socket.to(data.room).emit("new_player", data)

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
    socket.to(data.room).emit("got_card", data)
  })

  socket.on("stand", (data) => {
    console.log("data stand", data)

    socket.to(data.room).emit("stand_hand", data)
  })

  socket.on("round_finished", (data) => {
    socket.to(data.room).emit("new_round", data)
  })

  // socket.on("player_joined", (data) => {
  // io.in(data.room).emit("new_player", data.deck)
  //   console.log("data player joined", data)
  //   socket.to(data.room).emit("new_player", data.deck)
  // })

  socket.once("card_dealt", (data) => {
    console.log("data dealt", data)
    io.in(data.room).emit("current_deck", data)
  })

  socket.on("disconnect", () => {
    console.log(`User :${socket.id} has disconnected`)
  })
})
const PORT = process.env.PORT || 3001
server.listen(3001, () => {
  console.log("Server is running")
})
