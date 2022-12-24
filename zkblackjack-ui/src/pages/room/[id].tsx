import React, { useState, useEffect } from "react"
import type { NextPage } from "next"
import { Game } from "../../components/Game"
import io from "socket.io-client"
import { useRouter } from "next/router"
import { ethers } from "ethers"

interface IProps {
  account: string
  library: ethers.providers.Web3Provider
}

const Room: NextPage<IProps> = ({ account, library }) => {
  const router = useRouter()

  const { id } = router.query

  const room = id?.toString() ?? ""

  return (
    <div className="h-screen w-fit overflow-hidden">
      <Game room={room} account={account} library={library} />
    </div>
  )
}

export default Room
