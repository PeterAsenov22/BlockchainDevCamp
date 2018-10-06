const Funding = artifacts.require("Funding");
const { increaseTime } = require("./utils");

const DAY = 3600*24;
const FINNEY = 10**15;

contract("Funding", accounts => {
  const [firstAccount, secondAccount] = accounts;

  let funding;

  beforeEach( async () => {
    funding = await Funding.new(DAY, 100*FINNEY);
  })

  it("sets an owner", async () => {
    assert.equal(await funding.owner.call(), firstAccount);
  })

  it("accepts donations", async () => {
    await funding.donate({from: firstAccount, value: 10*FINNEY});
    await funding.donate({from: secondAccount, value: 20*FINNEY});
    assert.equal(await funding.raised.call(), 30*FINNEY);
  })

  it("keeps track of donators balances", async () => {
    await funding.donate({from: firstAccount, value: 10*FINNEY});
    await funding.donate({from: secondAccount, value: 20*FINNEY});
    await funding.donate({from: firstAccount, value: 10*FINNEY});
    assert.equal(await funding.balances.call(firstAccount), 20 * FINNEY);
    assert.equal(await funding.balances.call(secondAccount), 20 * FINNEY);
  })

  it("finishes fundraising when time is up", async () => {
    assert.equal(await funding.isFinished.call(), false);
    await increaseTime(DAY);
    assert.equal(await funding.isFinished.call(), true);
  })

  it("does not allow for donations when time is up", async () => {
    await funding.donate({from: firstAccount, value: 10*FINNEY});
    await increaseTime(DAY);
    try{
      await funding.donate({from: firstAccount, value: 10*FINNEY});
      assert.fail();
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })

  it("allows owner to withdraw funds when goal is reached", async () => {
    await funding.donate({from: firstAccount, value: 30*FINNEY});
    await funding.donate({from: secondAccount, value: 70*FINNEY});
    const initBalance = web3.eth.getBalance(firstAccount);
    assert.equal(web3.eth.getBalance(funding.address), 100*FINNEY);
    await funding.withdraw();
    const finalBalance = web3.eth.getBalance(firstAccount);
    assert.ok(finalBalance.greaterThan(initBalance));
  })

  it("does not allow non-owners to withdraw funds", async () => {
    funding = await Funding.new(DAY, 100*FINNEY, { from: secondAccount });
    await funding.donate({from: firstAccount, value: 100*FINNEY});
    try{
      await funding.withdraw()
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })

  it("allows to withdraw funds after time is up and the goal is not reached", async () => {
    await funding.donate({from: secondAccount, value: 70*FINNEY});
    const initBalance = web3.eth.getBalance(secondAccount);
    assert.equal(await funding.balances.call(secondAccount), 70*FINNEY);
    await increaseTime(DAY);
    await funding.refund({from: secondAccount});
    const finalBalance = web3.eth.getBalance(secondAccount);
    assert.ok(finalBalance.greaterThan(initBalance));
  })

  it("does not allow to withdraw funds when time is up and the goal is reached", async () => {
    await funding.donate({from: secondAccount, value: 100*FINNEY});
    assert.equal(await funding.balances.call(secondAccount), 100*FINNEY);
    await increaseTime(DAY);

    try{
      await funding.refund({from: secondAccount});
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })

  it("does not allow to withdraw funds before time is up and the goal is not reached", async () => {
    await funding.donate({from: secondAccount, value: 50*FINNEY});
    assert.equal(await funding.balances.call(secondAccount), 50*FINNEY);

    try{
      await funding.refund({from: secondAccount});
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })
});