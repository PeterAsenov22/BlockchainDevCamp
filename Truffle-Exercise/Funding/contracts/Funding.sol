pragma solidity ^0.4.23;

contract Funding {
  address public owner;
  uint public raised;
  uint public finishesAt;
  uint public goal;
  mapping(address => uint) public balances;

  constructor(uint _duration, uint _goal) public {
    owner = msg.sender;
    finishesAt = now + _duration;
    goal = _goal;
  }
  
  modifier onlyOwner() {
      require(owner == msg.sender);
      _;
  }
  
  modifier onlyFinished() {
      require(isFinished());
      _;
  }

  modifier onlyNotFinished() {
    require(!isFinished());
    _;
  }
  
  modifier onlyFunded() {
      require(isFunded());
      _;
  }
  
  modifier onlyNotFunded() {
      require(!isFunded());
      _;
  }
  
  function isFunded() public view returns (bool) {
      return raised >= goal;
  }

  function isFinished() public view returns (bool) {
    return finishesAt <= now;
  }

  function donate() public onlyNotFinished payable {
    raised += msg.value;
    balances[msg.sender] += msg.value;
  }
  
  function withdraw() public onlyOwner onlyFunded {
      owner.transfer(address(this).balance);
  }
  
  function refund() public onlyFinished onlyNotFunded {
      uint amount = balances[msg.sender];
      require(amount > 0);
      balances[msg.sender] = 0;
      msg.sender.transfer(amount);
  }
}