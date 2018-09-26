pragma solidity ^0.4.25;

contract StructProblem{
    struct Account{
        string name;
        address addr;
        string email;
    }
    
    Account[] private accounts;
    address private owner;
    
    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier isProperUser(address addr) {
        require(msg.sender == addr);
        _;
    }
    
    constructor () public {
        owner = msg.sender;
    }
    
    function create(string name, address addr, string email) isProperUser(addr) public{
        Account memory currentAccount;
        currentAccount.name = name;
        currentAccount.addr = addr;
        currentAccount.email = email;
        accounts.push(currentAccount);
    }
    
    function get(uint index) isOwner view public returns (string, address, string){
        Account memory currentAccount = accounts[index];
        return (currentAccount.name, currentAccount.addr, currentAccount.email);
    }
}