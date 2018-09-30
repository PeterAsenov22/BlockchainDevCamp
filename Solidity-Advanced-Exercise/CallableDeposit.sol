pragma solidity ^0.4.25;

contract CallableDeposit{
    address private owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public{
        owner = msg.sender;
    }
    
    function deposit() public payable{
        
    }
    
    function getBalance() onlyOwner view public returns(uint){
        return address(this).balance;
    }
    
    function sendBalance(address addr) onlyOwner public{
        selfdestruct(addr);
    }
}

contract NoPayable{
    address private owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public{
        owner = msg.sender;
    }
    
    function getBalance() onlyOwner view public returns(uint){
        return address(this).balance;
    }
}