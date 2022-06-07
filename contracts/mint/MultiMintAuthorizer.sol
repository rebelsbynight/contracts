// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./BaseMinter.sol";

contract MultiMintAuthorizer is BaseMinter {
  struct MintInfo {
    bytes32 merkleRoot;
    uint256 mintPrice;
    uint256 mintLimit;
  }

  MintInfo[] private _mintInfo;

  mapping(address => uint256) private _userMintCount;

  constructor(
    address entryPoint,
    string memory mintName,
    uint256 totalMintLimit,
    uint256 startTime,
    uint256 endTime,
    MintInfo[] memory mintInfo
  ) BaseMinter(entryPoint, mintName, totalMintLimit, startTime, endTime) {
    for (uint256 i = 0; i < mintInfo.length; ++i) {
      _mintInfo.push(mintInfo[i]);
    }
  }

  function _getMintInfo(
    address sender,
    bytes32[] memory proof
  ) internal view returns (MintInfo memory) {
    bytes32 addrHash = keccak256(abi.encodePacked(sender));
    for (uint256 i = 0; i < _mintInfo.length; ++i) {
      if (MerkleProof.verify(
            proof, _mintInfo[i].merkleRoot, addrHash)) {
        return _mintInfo[i];
      }
    }
    revert("sender not allowed to participate");
  }

  function getProofRequired() external pure override returns (bool) {
    return true;
  }

  function getUserMintPrice(
    address sender,
    bytes32[] memory proof
  ) external view override returns (uint256) {
    MintInfo memory mintInfo = _getMintInfo(sender, proof);
    return mintInfo.mintPrice;
  }

  function getUserMintLimit(
    address sender,
    bytes32[] memory proof
  ) external view override returns (uint256) {
    MintInfo memory mintInfo = _getMintInfo(sender, proof);
    return mintInfo.mintLimit;
  }

  function getUserMintCount(
    address user
  ) external view override returns (uint256) {
    return _userMintCount[user];
  }

  function authorizeMint(
    address sender,
    uint256 value,
    uint256 number,
    bytes32[] memory proof
  ) external override {
    _authorizeMint(number);

    MintInfo memory mintInfo = _getMintInfo(sender, proof);

    uint256 newMintCount = _userMintCount[sender] + number;
    require(newMintCount <= mintInfo.mintLimit, "Trying to mint more than allowed");
    _userMintCount[sender] = newMintCount;

    require(value >= mintInfo.mintPrice * number, "Insufficient payment");
  }
}
