export const constructDeck = () => {
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

  // if (isSinglePlayer) {
  //   for (let i = 0; i < cardTypes.length; i++) {
  //     for (let j = 0; j < cardValues.length; j++) {
  //       deck.push(cardValues[j] + "-" + cardTypes[i])
  //     }
  //   }
  // }

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

module.exports = {
  constructDeck,
}
