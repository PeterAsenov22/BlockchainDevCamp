pragma solidity ^0.4.25;

contract ArrayOfFacts{
    string[] private facts;
    address contractOwner = msg.sender;
    address private firstApproved = 0xca35b7d915458ef540ade6068dfe2f44e8fa733c;
    address private secondApproved = 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c;
    
    modifier onlyApproved(){
        require(msg.sender == firstApproved || msg.sender == secondApproved);
        _;
    }
    
    function add(string fact) public {
        require(msg.sender == contractOwner);
        facts.push(fact);
    }
    
    function count() view public returns (uint) {
        return facts.length;
    }
    
    function getFactByIndex(uint index) onlyApproved view public returns (string) {
        return facts[index];
    }
}