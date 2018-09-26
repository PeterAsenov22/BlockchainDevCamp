pragma solidity ^0.4.25;

contract SimpleToken{
    mapping(address => uint256) private balances;
    
    constructor() public payable{
        balances[msg.sender] = msg.value;
    }
    
    function transfer(address to, uint256 amount) public{
        require(balances[msg.sender] >= amount);
        require(balances[to] + amount >= balances[to]);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    function getBalance(address addr) view public returns (uint256){
        return balances[addr];
    }
}