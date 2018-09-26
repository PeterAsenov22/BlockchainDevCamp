pragma solidity ^0.4.25;

contract SimpleStorage{
    uint256 storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() view public returns (uint256) {
        return storedData;
    }
}