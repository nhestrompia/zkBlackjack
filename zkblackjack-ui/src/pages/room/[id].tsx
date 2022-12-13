import React, { useState, useEffect } from "react"
import type { NextPage } from "next"
import { Game } from "../../components/Game"
import io from "socket.io-client"
import { useRouter } from "next/router"
import { ethers } from "ethers"

interface IProps {
  account: string
  library: ethers.providers.Web3Provider
  socket: any
}
// const socket = io("http://localhost:3002")

const Room: NextPage<IProps> = ({ account, library, socket }) => {
  const router = useRouter()

  const { id } = router.query

  const room = id?.toString() ?? ""

  // const sendMessage = async () => {

  //     const messageData = {
  //       room: room,
  //       author: username,
  //       message: currentMessage,
  //       time:
  //         new Date(Date.now()).getHours() +
  //         ":" +
  //         new Date(Date.now()).getMinutes(),
  //     };

  //     await socket.emit("send_message", messageData);
  //     setMessageList((list) => [...list, messageData]);
  //     setCurrentMessage("");

  // };

  return (
    <div className="h-screen">
      <Game socket={socket} room={room} account={account} library={library} />
    </div>
  )
}

export default Room
