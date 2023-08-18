// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "./IRebelsRenderer.sol";

contract CustomizationSelectorURIRenderer is IRebelsRenderer, ERC165 {
    string public normalModeBaseURI;
    string public nightModeBaseURI;
    string public ultraModeBaseURI;
    IERC721 public rebelsNFT;

    // Bit map to store night and ultra mode statuses for each token
    uint8 internal constant NIGHT_MODE_FLAG = 0x01;
    uint8 internal constant ULTRA_MODE_FLAG = 0x02;
    mapping(uint256 => uint8) statuses;

    constructor(string memory normalModeBaseURI_, string memory nightModeBaseURI_, string memory ultraModeBaseURI_, address nftAddress) {
        if (nftAddress == address(0)) revert CantBeZeroAddr();

        normalModeBaseURI = normalModeBaseURI_;
        nightModeBaseURI = nightModeBaseURI_;
        ultraModeBaseURI = ultraModeBaseURI_;

        rebelsNFT = IERC721(nftAddress);
    }

    // Bitfield related operations
    function get(uint256 index, uint8 flag) internal view returns (bool isSet) {
        uint8 b = statuses[index] & flag;
        /// @solidity memory-safe-assembly
        assembly {
            isSet := b
        }
    }

    function set(uint256 index, uint8 flag) internal {
        statuses[index] |= flag;
    }

    function unset(uint256 index, uint8 flag) internal {
        statuses[index] &= ~flag;
    }
    // ------------------------------

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
        if (rebelsNFT.ownerOf(id) != msg.sender) revert NotTokenOwner();
        set(id, NIGHT_MODE_FLAG);
        if (get(id, ULTRA_MODE_FLAG)) {
            unset(id, ULTRA_MODE_FLAG);
        }
    }

    function unsetNightMode(uint256 id) external {
        if (rebelsNFT.ownerOf(id) != msg.sender) revert NotTokenOwner();
        unset(id, NIGHT_MODE_FLAG);
    }

    function setUltraMode(uint256 id) external {
        if (rebelsNFT.ownerOf(id) != msg.sender) revert NotTokenOwner();
        set(id, ULTRA_MODE_FLAG);
        if (get(id, NIGHT_MODE_FLAG)) {
            unset(id, NIGHT_MODE_FLAG);
        }
    }

    function unsetUltraMode(uint256 id) external {
        if (rebelsNFT.ownerOf(id) != msg.sender) revert NotTokenOwner();
        unset(id, ULTRA_MODE_FLAG);
    }

    function getNightMode(uint256 id) public view returns (bool) {
        return get(id, NIGHT_MODE_FLAG);
    }

    function getUltraMode(uint256 id) public view returns (bool) {
        return get(id, ULTRA_MODE_FLAG);
    }
}
