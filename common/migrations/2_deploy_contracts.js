const Target = artifacts.require("Target");
const ERC20Test = artifacts.require("ERC20Test");

module.exports = function(deployer) {
  deployer.deploy(Target).then(function() {
      return deployer.deploy(ERC20Test, Target.address);
  });
};