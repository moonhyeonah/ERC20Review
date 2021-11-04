const ERC20Test = artifacts.require("ERC20Test");
const Target = artifacts.require("Target");
const sha3 = require('js-sha3').keccak_256;
const variable = require('./initialize.js');

contract(variable.TOKENNAME, (accounts) => {
  it('TS1. totalSupply()', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let totalSupply = variable.TOTALSUPPLY;    

    let result = await erc20testInstance.testTS.call(totalSupply);
    assert.equal(result, true, "totalSupply() fail");
  });
  it('BA1. balanceOf(): valid owner', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    let amount = 1000;

    await targetInstance.setBalance(owner, amount);

    let result = await erc20testInstance.testBA.call(owner, amount);
    assert.equal(result, true, "balanceOf() fail");    
  });
  it('BA2. balanceOf(): invalid owner', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    await targetInstance.unsetBalance(owner);

    let amount = 0;
    let result = await erc20testInstance.testBA.call(owner, amount);
    assert.equal(result, true, "balanceOf() fail");    
  });
  it('TR1. transfer(): sender.balance >= value & to.balance+value <= MAX & value != 0', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    let bal = 1000;
    await targetInstance.setBalance(owner, bal);

    let accountTo = accounts[1];
    await targetInstance.setBalance(accountTo, 0);

    let amount = 100;

    //console.log(accountTo);
    let result = await erc20testInstance.testTR.call(accountTo, amount);

    //console.log((await targetInstance.balanceOf(owner)).toNumber());

    assert.equal(result, true, "transfer() fail");  
    var tx = await erc20testInstance.testTR(accountTo, amount);
    //console.log(tx);
    //console.log(tx.receipt.rawLogs);
    //console.log((tx.receipt.rawLogs[0]).abi);
    var targetEvent = tx.receipt.rawLogs.some(l => {
      //console.log(l.topics[0]);
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    //console.log(targetEvent);
    assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TR1-1. transfer(): sender.balance >= value & to.balance+value <= MAX & value != 0 & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    let bal = 1000;
    await targetInstance.setBalance(owner, bal);

    let accountTo = accounts[1];
    await targetInstance.unsetBalance(accountTo);

    let amount = 100;

    let result = await erc20testInstance.testTR.call(accountTo, amount);
    assert.equal(result, true, "transfer() fail");  

    var tx = await erc20testInstance.testTR(accountTo, amount);
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TR2. transfer(): sender.balance >= value & to.balance+value <= MAX & value == 0', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    let bal = 1000;
    await targetInstance.setBalance(owner, bal);

    let accountTo = accounts[1];
    await targetInstance.setBalance(accountTo, 0);

    let amount = 0;
    
    let result = await erc20testInstance.testTR.call(accountTo, amount);
    assert.equal(result, true, "transfer() fail"); 
    let tx = await erc20testInstance.testTR(accountTo, amount); 
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");    
  });
  it('TR2-1. transfer(): sender.balance >= value & to.balance+value <= MAX & value == 0 & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    let bal = 1000;
    await targetInstance.setBalance(owner, bal);

    let accountTo = accounts[1];
    await targetInstance.unsetBalance(accountTo);

    let amount = 0;
    
    let result = await erc20testInstance.testTR.call(accountTo, amount);
    assert.equal(result, true, "transfer() fail"); 

    let tx = await erc20testInstance.testTR(accountTo, amount); 
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");    
  });
  it('TR3. transfer(): sender.balance >= value & to.balance+value > MAX', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    let bal = 1000;
    await targetInstance.setBalance(owner, bal);

    let accountTo = accounts[2];

    let amount = variable.MAXNO;//web3.utils.toBN('115792089237316195423570985008687907853269984665640564039457584007913129639935');
		 //0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    await targetInstance.setBalance(accountTo, amount);

    let value = 100;
    
    let result = await erc20testInstance.testTR.call(accountTo, value);
//
//    let result1 = await erc20testInstance.testBA.call(owner, bal);
//    console.log(result1);
//    let result2 = await erc20testInstance.testBA.call(accountTo, value);
//    console.log(result2);
//
    assert.equal(result, true, "transfer() fail"); 
  });
  it('TR4. transfer(): sender.balance < value', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let amount = 10;
    await targetInstance.setBalance(from, amount);

    let accountTo = accounts[1];
    let value = 100;
    
    let result = await erc20testInstance.testTR.call(accountTo, value);
    assert.equal(result, true, "transfer() fail"); 
  });
  it('TR4-1. transfer(): sender.balance < value & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let amount = 10;
    await targetInstance.setBalance(from, amount);

    let accountTo = accounts[1];
    await targetInstance.unsetBalance(accountTo);
    let value = 100;
    
    let result = await erc20testInstance.testTR.call(accountTo, value);
    assert.equal(result, true, "transfer() fail"); 
  });
  it('TR5. transfer(): invalid sender', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let owner = erc20testInstance.address;
    await targetInstance.unsetBalance(owner);

    let accountTo = accounts[1];
    let value = 100;
    
    let result = await erc20testInstance.testTR.call(accountTo, value);
    assert.equal(result, true, "transfer() fail"); 
  });

  it('TF1. transferFrom(): sender.balance >= value & to.balance+value <= MAX & caller\'s allowance by from >= value & value != 0', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 1000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.setBalance(accountTo, 0);

    let value = 100;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");

    //var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    //console.log(tx);
    //console.log(tx.receipt.rawLogs);
    //console.log((tx.receipt.rawLogs[0]).abi);
    //var targetEvent = tx.receipt.rawLogs.some(l => {
      //console.log(l.topics[0]);
      //return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    //console.log(targetEvent);
    //assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF1-1. transferFrom(): sender.balance >= value & to.balance+value <= MAX & caller\'s allowance by from >= value & value != 0 & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 1000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.unsetBalance(accountTo);

    let value = 100;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF2. transferFrom(): sender.balance >= value & to.balance+value <= MAX & caller\'s allowance by from >= value & value == 0', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 1000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.setBalance(accountTo, 0);

    let value = 0;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF2-1. transferFrom(): sender.balance >= value & to.balance+value <= MAX & caller\'s allowance by from >= value & value == 0 & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 1000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.unsetBalance(accountTo);

    let value = 0;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF3. transferFrom(): sender.balance >= value & to.balance+value <= MAX & caller\'s allowance by from < value', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 1000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.setBalance(accountTo, 0);

    let value = 1001;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    //var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    //var targetEvent = tx.receipt.rawLogs.some(l => {
    //  return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    //assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF3-1. transferFrom(): sender.balance >= value & to.balance+value <= MAX & caller\'s allowance by from < value & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 1000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.unsetBalance(accountTo);

    let value = 1001;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  
  });
  it('TF4. transferFrom(): sender.balance >= value & to.balance+value > MAX', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 10000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 10000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    //let bal = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    let bal = variable.MAXNO;
    //web3.utils.toBN('115792089237316195423570985008687907853269984665640564039457584007913129639935');
    await targetInstance.setBalance(accountTo, bal);

    let value = 100;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    //var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    //var targetEvent = tx.receipt.rawLogs.some(l => {
    //  return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    //assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF5. transferFrom(): sender.balance < value', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 1000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 10000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.setBalance(accountTo, 0);
    
    let value = 1001;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  

    //var tx = await erc20testInstance.testTF(accountFrom, accountTo, value);
    //var targetEvent = tx.receipt.rawLogs.some(l => {
    //  return l.topics[0] == '0x' + sha3("Transfer(address,address,uint256)") });
    //assert.equal(targetEvent, true, "Transfer() event fail");
  });
  it('TF5-1. transferFrom(): sender.balance < value & invalid to', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let amount = 1000;
    await targetInstance.setBalance(accountFrom, amount);

    let spender = erc20testInstance.address;
    let remaining = 10000;
    await targetInstance.setAllowance(accountFrom, spender, remaining);

    let accountTo = accounts[2];
    await targetInstance.unsetBalance(accountTo);
    
    let value = 1001;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  
  });
  it('TF6. transferFrom(): invalid sender', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let accountFrom = accounts[1];
    let spender = erc20testInstance.address;
    await targetInstance.unsetBalance(accountFrom);
    await targetInstance.unsetAllowance(accountFrom, spender);

    let accountTo = accounts[2];
    await targetInstance.setBalance(accountTo, 0);

    let value = 100;

    let result = await erc20testInstance.testTF.call(accountFrom, accountTo, value);
    assert.equal(result, true, "transferFrom() fail");  
  });

  it('AP1. approve(): caller balance >= value', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let amount = 1000;
    await targetInstance.setBalance(from, amount);

    let spender = accounts[1];
    let value = 100;
    
    await targetInstance.setAllowance(from, spender, 0);

    let result = await erc20testInstance.testAP.call(spender, value);
    assert.equal(result, true, "approve() fail");
    let tx = await erc20testInstance.testAP(spender, value); 
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Approval(address,address,uint256)") });
    assert.equal(targetEvent, true, "Approval() event fail"); 
  });
  it('AP1-1. approve(): caller balance >= value & allowance <> 0', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let amount = 1000;
    await targetInstance.setBalance(from, amount);

    let spender = accounts[1];
    let value = 100;
    
    await targetInstance.setAllowance(from, spender, 10);

    let result = await erc20testInstance.testAP.call(spender, value);
    assert.equal(result, true, "approve() fail");
    let tx = await erc20testInstance.testAP(spender, value); 
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Approval(address,address,uint256)") });
    assert.equal(targetEvent, true, "Approval() event fail"); 
  });
  it('AP2. approve(): caller balance < value', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let amount = 1000;
    await targetInstance.setBalance(from, amount);

    let spender = accounts[1];
    let value = 10000;
    
    await targetInstance.setAllowance(from, spender, 0);

    let result = await erc20testInstance.testAP.call(spender, value);
    assert.equal(result, true, "approve() fail");     
    let tx = await erc20testInstance.testAP(spender, value); 
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Approval(address,address,uint256)") });
    assert.equal(targetEvent, true, "Approval() event fail"); 
  });
  it('AP3. approve(): invalid caller', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let spender = accounts[1];

    await targetInstance.unsetBalance(from);
    await targetInstance.unsetAllowance(from, spender);

    let value = 100;

    let result = await erc20testInstance.testAP.call(spender, value);
    assert.equal(result, true, "approve() fail");
    let tx = await erc20testInstance.testAP(spender, value); 
    var targetEvent = tx.receipt.rawLogs.some(l => {
      return l.topics[0] == '0x' + sha3("Approval(address,address,uint256)") });
    assert.equal(targetEvent, true, "Approval() event fail"); 
  });

  it('AL1. allowance(): valid owner', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let amount = 1000;
    await targetInstance.setBalance(from, amount);

    let spender = accounts[1];
    let value = 100;

    await targetInstance.setAllowance(from, spender, value);
  
    //let result1 = await erc20testInstance.testAP.call(spender, value);
    //assert.equal(result1, true, "approve() fail");
    
    let result2 = await erc20testInstance.testAL.call(from, spender, value);
    assert.equal(result2, true, "allowance() fail");     
  });
  it('AL2. allowance(): invalid owner', async () => {
    let erc20testInstance = await ERC20Test.deployed();
    let targetInstance = await Target.deployed();

    let from = erc20testInstance.address;
    let spender = accounts[1];

    await targetInstance.unsetBalance(from);
    await targetInstance.unsetAllowance(from, spender);

    let value = 0;

    let result2 = await erc20testInstance.testAL.call(from, spender, value);
    assert.equal(result2, true, "allowance() fail");     
  });

});
