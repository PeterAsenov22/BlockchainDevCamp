var Funding = artifacts.require("Funding.sol")

const DAY = 3600 * 24;
const FINNEY = 10**15;

module.exports = function (deployer) {
  deployer.deploy(Funding, DAY, 100*FINNEY)
}