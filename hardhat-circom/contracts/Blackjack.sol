// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;


import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
// import "./BlackjackVerifier.sol"

interface IVerifier {
     function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[3] memory input
        )external view returns (bool);

}



contract Blackjack is Ownable {

    struct Player {
        uint256 bet;
        uint16 gameId;
        address playerAddress;
    }

    struct Game {
        uint256 totalBet;
        bool isGameActive;
        address player1Address;
        address player2Address;
        bool isSinglePlayer;
    }

    event GameCreated(
        address player1Address,
        uint256 bet
    );

    event PlayerJoined(
      address player2Address,
      uint16 gameId
      );


    event GameEnded(
        address winnerAddress,
        uint256 totalPrize
    );

    address public verifierAddress;
    address public casinoAddress = payable(0x664C66ece173898ea923cFA8060e9b0C6EF599aB);

    uint256 public betAmount = 0.01 ether;
    uint16 public gameId = 0;

    mapping (address => Player) public players;
    mapping (uint16 => Game) public games;

    constructor (address _verifierAddress) {
      verifierAddress = _verifierAddress;
    }


        function verifyProof(
        uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[3] memory input
    ) public view returns (bool) {
        return IVerifier(verifierAddress).verifyProof(a, b, c, input);
    }


        function verifyRoundWin(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input
    ) public view returns (bool) {
        // require(verifyProof(a, b, c, input), "Failed proof check");
        require(verifyProof(a, b, c, input), "Failed proof check");
        return true;
    }

    function startSinglePlayerGame() external payable {
      require(msg.value >= betAmount, "Not enough ETH sent");
      players[msg.sender] = Player(betAmount,gameId,msg.sender);
      games[gameId] = Game(betAmount,true,msg.sender,address(0),true);
      gameId += 1;
      emit GameCreated(msg.sender, betAmount);
    }


      function startMultiplayerGame() external  payable {
      require(msg.value >= betAmount, "Not enough ETH sent");
      players[msg.sender] = Player(betAmount,gameId,msg.sender);
      games[gameId] = Game(betAmount,true,msg.sender,address(0),false);
      gameId += 1;
      emit GameCreated(msg.sender, betAmount);

    }

    function joinGame(uint16 _gameId) external payable {
      require(games[_gameId].isGameActive == true,"Game is not active");
      require(games[_gameId].player2Address == address(0),"Game room is full");
      require(msg.value >= betAmount, "Not enough ETH sent");
      players[msg.sender] = Player(betAmount,gameId,games[_gameId].player1Address);
      games[_gameId].player2Address = msg.sender;
      games[_gameId].totalBet += msg.value;
      emit PlayerJoined(msg.sender,_gameId); 

    }

    function withdrawSafe(uint256 _amount) public onlyOwner{
      require(address(this).balance >= _amount,"Not enough in the safe");
      (bool sent, bytes memory data) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");

    }

    function changeAddress(address _casinoAddress) public onlyOwner{
      casinoAddress = _casinoAddress;
    }

    function changeBetAmount(uint256 _bet) public onlyOwner{
      betAmount = _bet;
    }


  

    function endGame(address _player,uint16 _gameId, uint256 _finalBet) public onlyOwner {
        games[_gameId].isGameActive = false;
        players[_player].bet = _finalBet;
        

    }



    receive() external payable {}



    function withdrawBet(uint256 _amount,uint16 _gameId) public  {
        require(games[_gameId].isGameActive == false, "Game is ongoing");
        require(players[msg.sender].playerAddress == msg.sender, "No player has been found");
        require(_amount <= players[msg.sender].bet  ,"You dont have enough credit in your account");

        (bool sent, bytes memory data) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        delete players[games[_gameId].player1Address]; 
        delete players[games[_gameId].player2Address]; 
        delete games[_gameId];
        emit GameEnded(msg.sender, _amount);
    }

}