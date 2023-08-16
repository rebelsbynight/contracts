// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { LibBitmap } from "solady/src/utils/LibBitmap.sol";

import "./IRebelsRenderer.sol";

contract CustomizationSelectorURIRenderer is IRebelsRenderer, ERC165 {
    using LibBitmap for LibBitmap.Bitmap;

    string public normalModeBaseURI;
    string public nightModeBaseURI;
    string public ultraModeBaseURI;
    IERC721 public rebelsNFT;

    // Bit maps to store night and ultra mode status for each token
    LibBitmap.Bitmap nightModeEnabled;
    LibBitmap.Bitmap ultraModeEnabled;

    constructor(string memory normalModeBaseURI_, string memory nightModeBaseURI_, string memory ultraModeBaseURI_, address nftAddress) {
        require(nftAddress != address(0), "NFT address cannot be the zero address");

        normalModeBaseURI = normalModeBaseURI_;
        nightModeBaseURI = nightModeBaseURI_;
        ultraModeBaseURI = ultraModeBaseURI_;

        rebelsNFT = IERC721(nftAddress);
    }

    function tokenURI(uint256 id) external view override returns (string memory) {
        string memory idStr = Strings.toString(id);
        string memory suffix = ".json";
        if (getNightMode(id)) {
            suffix = "-night.json";
            return string(abi.encodePacked(nightModeBaseURI, idStr, suffix));
        } else if (getUltraMode(id)) {
            suffix = "-ultra.json";
            return string(abi.encodePacked(ultraModeBaseURI, idStr, suffix));
        }
        return string(abi.encodePacked(normalModeBaseURI, idStr, suffix));
    }

    function beforeTokenTransfer(address from, address to, uint256 id) external pure override {}

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IRebelsRenderer).interfaceId || super.supportsInterface(interfaceId);
    }

    function setNightMode(uint256 id) external {
        require(rebelsNFT.ownerOf(id) == msg.sender, "Not token owner");
        nightModeEnabled.set(id);
        if (getUltraMode(id)) {
            ultraModeEnabled.unset(id);
        }
    }

    function unsetNightMode(uint256 id) external {
        require(rebelsNFT.ownerOf(id) == msg.sender, "Not token owner");
        nightModeEnabled.unset(id);
    }

    function setUltraMode(uint256 id) external {
        require(rebelsNFT.ownerOf(id) == msg.sender, "Not token owner");
        ultraModeEnabled.set(id);
        if (nightModeEnabled.get(id)) {
            nightModeEnabled.unset(id);
        }
    }

    function unsetUltraMode(uint256 id) external {
        require(rebelsNFT.ownerOf(id) == msg.sender, "Not token owner");
        ultraModeEnabled.unset(id);
    }

    function getNightMode(uint256 id) public view returns (bool) {
        return nightModeEnabled.get(id);
    }

    function getUltraMode(uint256 id) public view returns (bool) {
        return ultraModeEnabled.get(id);
    }

    function setNormalModeBaseURI(string memory newBaseURI) external {
        normalModeBaseURI = newBaseURI;
    }

    function setNightModeBaseURI(string memory newNightModeBaseURI) external {
        nightModeBaseURI = newNightModeBaseURI;
    }

    function setUltraModeBaseURI(string memory newUltraModeBaseURI) external {
        ultraModeBaseURI = newUltraModeBaseURI;
    }
}
