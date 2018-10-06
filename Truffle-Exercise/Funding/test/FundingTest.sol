pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Funding.sol";

contract FundingTest {
  uint public initialBalance = 10 ether;
  Funding funding;

  function beforeEach() public {
    funding = new Funding(1 days, 100 finney);
  }
  
  function testSettingAnOwnerDuringCreation() public {
    Assert.equal(funding.owner(), this, "An owner is different from deployer.");
  }

  function testSettingAnOwnerOfDeployedContract() public {
    funding = Funding(DeployedAddresses.Funding());
    Assert.equal(funding.owner(), msg.sender, "An owner is different from deployer.");
  }

  function testAcceptingDonations() public {
    Assert.equal(funding.raised(), 0, "Initial raised amount is different than 0.");
    funding.donate.value(10 finney)();
    funding.donate.value(20 finney)();
    Assert.equal(funding.raised(), 30 finney, "Raised amount is different than sum of donations.");
  }

  function testTrackingDonatorsBalances() public {
    funding.donate.value(20 finney)();
    funding.donate.value(25 finney)();
    Assert.equal(funding.balances(this), 45 finney, "Donator balance is different than sum of donations.");
  }

  function testDonatingAfterTimeIsUp() public {
    Funding newFunding = new Funding(0, 100 finney);
    bool result = address(newFunding).call.value(10 finney)(bytes4(keccak256("donate()")));
    Assert.equal(result, false, "Allows for donations when time is up.");
  }

  function testWithdrwalByNotAnOwner() public {
    funding = Funding(DeployedAddresses.Funding());
    funding.donate.value(100 finney)();
    bool result = address(funding).call(bytes4(keccak256("withdraw()")));
    Assert.equal(result, false, "Allows for withdrawal by not an owner.");
  }

  function testContractFunding() public {
    uint initBalance = address(this).balance;
    funding.donate.value(50 finney)();
    bool result = address(funding).call(bytes4(keccak256("withdraw()")));
    Assert.equal(result, false, "Allows for withdrawal before reaching the goal.");
    funding.donate.value(50 finney)();
    Assert.equal(address(this).balance, initBalance - 100 finney, "Balance before withdrawal does not correspond to the sum of donations.");
    bool funded = funding.isFunded();
    Assert.equal(funded, true, "Not funded.");
    address owner = funding.owner();
    Assert.equal(owner, address(this), "Not owner.");
    //result = address(funding).call(bytes4(keccak256("withdraw()")));
    //Assert.equal(result, true, "Does not allow for withdrawal after reaching the goal.");
    //Assert.equal(address(this).balance, initBalance, "Balance after withdrawal does not correspond to the sum of donations.");
  }
}