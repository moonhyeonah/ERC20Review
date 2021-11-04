pragma solidity ^0.6.0;

abstract contract ERC20TokenInterface {
    function totalSupply() public virtual view returns (uint256);
    function balanceOf(address _owner) public virtual view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public virtual returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public virtual returns (bool success);
    function approve(address _spender, uint256 _value) public virtual returns (bool success);
    function allowance(address _owner, address _spender) public virtual view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract ERC20Test {
    
    ERC20TokenInterface targetToken;
    
    constructor (address _targetToken) public {
        targetToken = ERC20TokenInterface(_targetToken);
    }
    
    function testBA(address _owner, uint256 _balance) public view returns (bool success) {
        if (targetToken.balanceOf(_owner) == _balance) {
            return true;
        }
        return false;
    }
    
    function testTS(uint256 _totalSupply) public view returns (bool success) {
        if (targetToken.totalSupply() == _totalSupply) {
            return true;
        }
        return false;
    }

    function testAL(address _owner, address _spender, uint256 _remaining) public view returns (bool success) {
        if (targetToken.allowance(_owner, _spender) == _remaining) {
            return true;
        }
        return false;
    }
    
    function testAP(address _spender, uint256 _value) public returns (bool success) {
        address msgSender = address(this);
        //uint256 fromBal = targetToken.balanceOf(msgSender);

        /*
        // invalid caller
        if (fromBal == 0) {
            uint256 remaining = targetToken.allowance(msgSender, _spender);
            if (targetToken.approve(_spender, _value) == false) {
                if (targetToken.allowance(msgSender, _spender) == remaining) {
                    return true;
                }
            }
            return false;            
        }

        if (fromBal >= _value) {
            if (targetToken.approve(_spender, _value) == true) {
                if (targetToken.allowance(msgSender, _spender) == _value) {
                    return true;
                }
            }
        }
        else {
            uint256 remaining = targetToken.allowance(msgSender, _spender);
            if (targetToken.approve(_spender, _value) == false) {
                if (targetToken.allowance(msgSender, _spender) == remaining) {
                    return true;
                }
            }
        }*/
        if (targetToken.approve(_spender, _value) == true) {
            if (targetToken.allowance(msgSender, _spender) == _value) {
                return true;
            }
        }
        return false;
    }    
    
    function testTF(address _from, address _to, uint256 _value) public returns (bool success) {
        address msgSender = address(this);
        uint256 fromBal = targetToken.balanceOf(_from);
        uint256 toBal = targetToken.balanceOf(_to);
        uint256 remaining = targetToken.allowance(_from, msgSender);

       // invalid from
        if (fromBal == 0) {
            /*if (targetToken.transferFrom(_from, _to, _value) == false) {
                if ( (targetToken.balanceOf(_to) == toBal) || (toBal == 0) ) {
                    return true;
                }
            }*/

            // throw check
            try targetToken.transferFrom(_from, _to, _value) {
                return false;
            } catch Error(string memory reason) {
                return true;
            } catch (bytes memory lowLevelData) {
                return true;
            }
        }  // invalid from
         
        if (fromBal >= _value) {
            if ((toBal + _value) >= toBal) {
                if (remaining >= _value) {
                    if (_value == 0 || _value > 0) {
                        if (targetToken.transferFrom(_from, _to, _value) == true) {
                            if ( (targetToken.balanceOf(_from) == (fromBal - _value)) &&
                                 (targetToken.balanceOf(_to) == (toBal + _value)) &&
                                 (targetToken.allowance(_from, msgSender) == (remaining - _value)) ) {
                                     return true;
                            }
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    // throw check
                    
                    try targetToken.transferFrom(_from, _to, _value) {
                        return false;
                    } catch Error(string memory reason) {
                        return true;
                    } catch (bytes memory lowLevelData) {
                        return true;
                    }
                }
            }
            else {
                if (targetToken.transferFrom(_from, _to, _value) == false) {
                    if ( (targetToken.balanceOf(_from) == fromBal) &&
                         (targetToken.balanceOf(_to) == toBal) &&
                         (targetToken.allowance(_from, msgSender) == remaining) )
                         return true;
                }
            }    
        }
        else {
            /*if (targetToken.transferFrom(_from, _to, _value) == false) {
                    if ( (targetToken.balanceOf(_from) == fromBal) &&
                         (targetToken.balanceOf(_to) == toBal) &&
                         (targetToken.allowance(_from, msgSender) == remaining) )
                         return true;
            }*/
            // throw 확인
            try targetToken.transfer(_to, _value) {
                return false;
            } catch Error(string memory reason) {
                return true;
            } catch (bytes memory lowLevelData) {
                return true;
            }
        }
        
        return false;
    }

    function testTR(address _to, uint256 _value) public returns (bool success) {
        address msgSender = address(this);
        uint256 fromBal = targetToken.balanceOf(msgSender);
        uint256 toBal = targetToken.balanceOf(_to);
 
       // invalid sender
        if (fromBal == 0) {
            /*if (targetToken.transfer(_to, _value) == false) {
                if ( (targetToken.balanceOf(_to) == toBal) || (toBal == 0) ) {
                    return true;
                }
            }*/
            // throw 확인
            try targetToken.transfer(_to, _value) {
                return false;
            } catch Error(string memory reason) {
                return true;
            } catch (bytes memory lowLevelData) {
                return true;
            }
        }  // invalid sender
         
        if (fromBal >= _value) {
            if ((toBal + _value) >= toBal) {
                if (_value == 0 || _value > 0) {
                    if (targetToken.transfer(_to, _value) == true) {
                        if ( (targetToken.balanceOf(msgSender) == (fromBal - _value)) &&
                             (targetToken.balanceOf(_to) == (toBal + _value)) ) {
                                 return true;
                        }
                    }
                }
                else {
                    return false;
                }
            }
            else {
                if (targetToken.transfer(_to, _value) == false) {
                    if ( (targetToken.balanceOf(msgSender) == fromBal) &&
                         (targetToken.balanceOf(_to) == toBal) )
                         return true;
                }
            }    
        }
        else {
            // throw 확인
            
            try targetToken.transfer(_to, _value) {
                return false;
            } catch Error(string memory reason) {
                return true;
            } catch (bytes memory lowLevelData) {
                return true;
            }
        }
        
        return false;
    }
}