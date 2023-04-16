// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Claim is Pausable, Ownable {
    using SafeERC20 for IERC20;

    error Already_Claimed();

    IERC20 public constant targetTokenOne = IERC20(0x535a9Fd8597dA4B0E09f0AfD1fd56FaFe7139807);
    IERC20 public constant targetTokenTwo = IERC20(0x535a9Fd8597dA4B0E09f0AfD1fd56FaFe7139807);
    IERC20 public constant targetTokenThree = IERC20(0x535a9Fd8597dA4B0E09f0AfD1fd56FaFe7139807);

    uint256 public claimAmount = 10e18;

    mapping (address => bool) public claimStatus;

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setClaimAmount(uint256 newClaimAmount) external onlyOwner {
        claimAmount = newClaimAmount;
    }

    function recoverToken(IERC20 token,uint256 tokenAmount) external onlyOwner {
        token.safeTransfer(msg.sender,tokenAmount);
    }

    function claim() external whenNotPaused {
        address caller = msg.sender;

        if(claimStatus[caller]) revert Already_Claimed();

        claimStatus[caller] = true;
        targetTokenOne.safeTransfer(caller,claimAmount);
        targetTokenTwo.safeTransfer(caller,claimAmount);
        targetTokenThree.safeTransfer(caller,claimAmount);
    }
}