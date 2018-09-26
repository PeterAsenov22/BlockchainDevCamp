pragma solidity ^0.4.25;

contract Incrementor{
    uint private valueToIncrement;
    
    function increment(uint x) public {
        valueToIncrement += x;
    }
    
    function getValue() view public returns (uint) {
        return valueToIncrement;
    }
}