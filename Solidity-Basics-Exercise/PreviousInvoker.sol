pragma solidity ^0.4.25;

contract PreviousInvoker{
    address private prevInvoker;
    
    function getPreviousInvoker() public returns (bool, address) {
        address result = prevInvoker;
        prevInvoker = msg.sender;
        return (result != 0x0, result);
    }
}