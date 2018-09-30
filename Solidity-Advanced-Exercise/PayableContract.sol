pragma solidity ^0.4.25;

contract PayableContract{
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
}