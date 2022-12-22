import React, { useState, useEffect } from "react"
import type { NextPage } from "next"
import { Game } from "../../components/Game"
import io from "socket.io-client"
import { useRouter } from "next/router"
import { ethers } from "ethers"

interface IProps {
  account: string
  library: ethers.providers.Web3Provider
  isGameActive?: boolean
  setIsGameActive?: (val: boolean) => void
  isSinglePlayer: boolean
  setIsSinglePlayer?: (val: boolean) => void
}

const Room: NextPage<IProps> = ({
  account,
  library,
  isGameActive,
  setIsGameActive,
  isSinglePlayer,
  setIsSinglePlayer,
}) => {
  return (
    <div className="">
      <Game
        setIsSinglePlayer={setIsSinglePlayer}
        isGameActive={isGameActive}
        setIsGameActive={setIsGameActive}
        isSinglePlayer={isSinglePlayer}
        account={account}
        library={library}
      />
    </div>
  )
}

export default Room
