pragma solidity ^0.4.25;

contract EventCreation {
    address private owner = msg.sender;
    
    event _showInformation(address, string indexed name, uint indexed age);
    
    function showInformation(string name, uint age) public{
        emit _showInformation(owner, name, age);
    } 
}