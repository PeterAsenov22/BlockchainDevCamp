pragma solidity ^0.4.25;

contract TokenShares {
    address private owner;
    uint private price;
    uint private dividend;
    mapping(address => uint) private sharesPerAddress;
    mapping(address => bool) private addressesAllowedToWithdrawFunds;
    address[] private shareholders;
    
    constructor(uint initialSupply, uint pricePerShare, uint _dividend) public {
        owner = msg.sender;
        sharesPerAddress[owner] = initialSupply;
        price = pricePerShare * 1 ether;
        dividend = _dividend * 1 ether;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier investorOrOwnerOnly(address addr) {
        require(msg.sender == addr || msg.sender == owner);
        _;
    }
    
    function getPricePerShare() view public returns (uint) {
        return price / 1 ether;
    }
    
    function calculateSharesWorth(uint amount) view public returns (uint) {
        return (amount * price) / 1 ether;
    }
    
    function buyShares(uint amount) public payable {
        require(sharesPerAddress[owner] >= amount);
        require(sharesPerAddress[msg.sender] + amount >= sharesPerAddress[msg.sender]);
        require(msg.value == price * amount);
        sharesPerAddress[owner] -= amount;
        sharesPerAddress[msg.sender] += amount;
        shareholders.push(msg.sender);
    }
    
    function getShareholders() onlyOwner view public returns (address[]) {
        return shareholders;
    }
    
    function allowWithdraw(address addr) onlyOwner public {
        addressesAllowedToWithdrawFunds[addr] = true;
    }
    
    function depositEarnings() onlyOwner public payable {
    }
    
    function getBalance() onlyOwner view public returns (uint) {
        return address(this).balance / 1 ether;
    }
    
    function getNumberOfShares(address addr) investorOrOwnerOnly(addr) view public returns (uint) {
        return sharesPerAddress[addr];
    }
    
    function withdraw() public {
        require(sharesPerAddress[msg.sender] > 0);
        require(address(this).balance >= sharesPerAddress[msg.sender] * dividend);
        require(addressesAllowedToWithdrawFunds[msg.sender] == true);
        msg.sender.transfer(sharesPerAddress[msg.sender] * dividend);
        addressesAllowedToWithdrawFunds[msg.sender] = false;
    }
}