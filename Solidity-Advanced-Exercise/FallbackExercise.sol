pragma solidity ^0.4.25;

contract Fallback{
    address private owner;
    
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }
    
    constructor() public{
        owner = msg.sender;
    }
    
    function getBalance() onlyOwner view public returns (uint){
        return address(this).balance;
    }
    
    function transfer(address addr, uint amount) onlyOwner public{
        require(address(this).balance >= amount);
        addr.transfer(amount);
    }
    
    function deposit() public payable{
    }
}

contract RecipientContract{
    address private owner;
    
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }
    
    constructor() public{
        owner = msg.sender;
    }
    
    function getBalance() onlyOwner view public returns (uint){
        return address(this).balance;
    }
    
    function() public payable{
    }
}