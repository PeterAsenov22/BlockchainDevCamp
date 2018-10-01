pragma solidity ^0.4.25;

contract MainContract {
    address internal owner = msg.sender;
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    function deposit() public payable{
    }
    
    function getBalance() onlyOwner view public returns (uint){
        return address(this).balance;
    }
}

contract ToBeTerminated is MainContract {
    function terminate() onlyOwner public{
        selfdestruct(msg.sender);
    }
}