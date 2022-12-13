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
  return (
    <div className="h-screen">
      <Game isSinglePlayer={true} account={account} library={library} />
    </div>
  )
}

export default Room
