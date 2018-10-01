pragma solidity ^0.4.25;

contract TimedAuction {
    mapping(address => uint) private tokenBalances;
    
    uint private duration = 1 minutes;
    uint private start;
    address private owner;
    
    constructor(uint initialSupply) public {
        start = now;
        owner = msg.sender;
        tokenBalances[owner] = initialSupply;
    }
    
    function buyTokens(uint amount) public {
        require(start + duration >= now);
        require(tokenBalances[owner] >= amount);
        tokenBalances[msg.sender] += amount;
        tokenBalances[owner] -= amount;
    }
    
    function getBalance(address addr) view public returns (uint) {
        return tokenBalances[addr];
    }
}