// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * Soulbound ERC-721 that can only be minted with a valid EIP-712 signature
 * from an authorized verifier (AI service). Tokens are non-transferable.
 */
contract Soulbound is ERC721, EIP712, Ownable {
    using ECDSA for bytes32;

    struct Permit {
        address to;
        bytes32 commitHash; // keccak256(repo|sha|author)
        uint256 reputation; // score assigned by AI
        uint256 expiry;     // unix timestamp
        string tokenURI;    // off-chain metadata (ipfs)
    }

    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(address to,bytes32 commitHash,uint256 reputation,uint256 expiry,string tokenURI)"
    );

    address public verifier; // signer address for AI agent

    // prevent replay for a specific (to, commitHash)
    mapping(address => mapping(bytes32 => bool)) public usedCommitHash;

    // simple incremental token id
    uint256 private _nextTokenId = 1;

    // optional storage for on-chain tokenURI if needed
    mapping(uint256 => string) private _tokenURIs;

    event VerifierUpdated(address indexed verifier);

    constructor(address initialOwner, address initialVerifier)
        ERC721("Proof of Contribution", "POC-SBT")
        EIP712("ProofOfContribution", "1")
        Ownable(initialOwner)
    {
        verifier = initialVerifier;
    }

    function setVerifier(address newVerifier) external onlyOwner {
        verifier = newVerifier;
        emit VerifierUpdated(newVerifier);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _tokenURIs[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    function _hashPermit(Permit memory p) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    PERMIT_TYPEHASH,
                    p.to,
                    p.commitHash,
                    p.reputation,
                    p.expiry,
                    keccak256(bytes(p.tokenURI))
                )
            )
        );
    }

    function mintWithSig(Permit calldata p, bytes calldata signature) external returns (uint256 tokenId) {
        require(block.timestamp <= p.expiry, "Permit expired");
        require(!usedCommitHash[p.to][p.commitHash], "Permit already used");

        bytes32 digest = _hashPermit(p);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == verifier, "Invalid signer");

        usedCommitHash[p.to][p.commitHash] = true;

        tokenId = _nextTokenId++;
        _safeMint(p.to, tokenId);
        _setTokenURI(tokenId, p.tokenURI);
    }

    // Soulbound: disable transfers and approvals
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // allow minting (from == address(0)) and burning (to == address(0)) by owner
        if (from != address(0) && to != address(0)) revert("SBT non-transferable");
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert("SBT non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("SBT non-transferable");
    }
}


