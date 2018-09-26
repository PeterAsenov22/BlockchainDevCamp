pragma solidity ^0.4.25;

contract LamboCrowdsale{
    address private owner = msg.sender;
    uint private money;
    
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }
    
    function deposit() payable public{
       require(money + msg.value > money);
       money += msg.value;
    }
    
    function getBalance() onlyOwner view public returns(uint){
        return money;
    }
    
    function kill() onlyOwner public{
        selfdestruct(owner);
    }
}