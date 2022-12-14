import "../styles/globals.css"
import type { AppType } from "next/dist/shared/lib/utils"
import React, { useState, useRef, useEffect, useImperativeHandle } from "react"
import { ethers } from "ethers"
import { Navbar } from "../components/Navbar"
import io, { Socket } from "socket.io-client"
// import { socket, SocketProvider } from "../../context/socket"
import SocketsProvider from "../context/SocketContext"

const MyApp: AppType = ({ Component, pageProps }) => {
  const [library, setLibrary] = useState<ethers.providers.Web3Provider>()
  const [account, setAccount] = useState<string>("")
  const [provider, setProvider] = useState()
  const [socket, setSocket] = useState<Socket>()
  const [isSinglePlayer, setIsSinglePlayer] = useState<boolean>(false)

  // useEffect(() => {
  //   const socketInstance = io("http://localhost:3001")
  //   setSocket(socketInstance)

  //   return () => {
  //     return(
  //       socketInstance.off("disconnect",() => {
  //         console.log("client disconnected")
  //       })
  //     )
  //   }
  // }, [])

  // useEffect(() => {
  //   if (!socket) {
  //     setSocket(io("http://localhost:3001"))
  //   }

  //   return () => {
  //     socket?.disconnect()
  //   }
  // }, [])

  // useEffect(() => {
  //   if (!socket) return

  //   socket!.on("connect", () => {
  //     console.log("socket connected")
  //   })

  //   const deckListener = (data: string[]) => {
  //     console.log("app asdadasdadgfdöbvbvd", data)
  //   }

  //   socket!.on("new_player", deckListener)

  //   return () => {
  //     socket.off("connect")
  //     socket.off("new_player")
  //   }
  // }, [socket])

  return (
    <>
      <SocketsProvider>
        <Navbar
          library={library!}
          setLibrary={setLibrary}
          account={account}
          setAccount={setAccount}
          provider={provider}
          setProvider={setProvider}
        />
        <Component
          {...pageProps}
          library={library!}
          account={account}
          isSinglePlayer={isSinglePlayer}
          setIsSinglePlayer={setIsSinglePlayer}
          // socket={socket}
        />
      </SocketsProvider>
    </>
  )
}

export default MyApp
