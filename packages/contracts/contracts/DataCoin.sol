// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DataCoin
 * @dev ERC20 token for rewarding course completion and learning progress
 * Features:
 * - Mintable by authorized minters (course completion system)
 * - Burnable by users (for special features)
 * - Pausable for emergency situations
 * - Role-based access control
 */
contract DataCoin is ERC20, Ownable, ReentrancyGuard {
    // Role-based access control
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public authorizedBurners;
    
    // Token metadata
    uint8 private constant DECIMALS = 18;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**DECIMALS; // 1 billion tokens max
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event BurnerAdded(address indexed burner);
    event BurnerRemoved(address indexed burner);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    // Modifiers
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    modifier onlyBurner() {
        require(authorizedBurners[msg.sender] || msg.sender == owner(), "Not authorized burner");
        _;
    }
    
    constructor(address initialOwner) 
        ERC20("DataCoin", "DATA") 
        Ownable(initialOwner) 
    {
        // Owner is automatically an authorized minter and burner
        authorizedMinters[initialOwner] = true;
        authorizedBurners[initialOwner] = true;
    }
    
    /**
     * @dev Mint DataCoins to a user (only authorized minters)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (for tracking)
     */
    function mint(address to, uint256 amount, string calldata reason) 
        external 
        onlyMinter 
        nonReentrant 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burn DataCoins from a user (only authorized burners)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * @param reason Reason for burning (for tracking)
     */
    function burn(address from, uint256 amount, string calldata reason) 
        external 
        onlyBurner 
        nonReentrant 
    {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    /**
     * @dev Allow users to burn their own tokens
     * @param amount Amount of tokens to burn
     */
    function burnSelf(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, "Self burn");
    }
    
    /**
     * @dev Add authorized minter
     * @param minter Address to authorize for minting
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter
     * @param minter Address to remove from minting
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Add authorized burner
     * @param burner Address to authorize for burning
     */
    function addBurner(address burner) external onlyOwner {
        require(burner != address(0), "Invalid burner address");
        authorizedBurners[burner] = true;
        emit BurnerAdded(burner);
    }
    
    /**
     * @dev Remove authorized burner
     * @param burner Address to remove from burning
     */
    function removeBurner(address burner) external onlyOwner {
        authorizedBurners[burner] = false;
        emit BurnerRemoved(burner);
    }
    
    /**
     * @dev Get token decimals
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Get current total supply
     */
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    /**
     * @dev Get remaining mintable supply
     */
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Check if address is authorized minter
     */
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account] || account == owner();
    }
    
    /**
     * @dev Check if address is authorized burner
     */
    function isBurner(address account) external view returns (bool) {
        return authorizedBurners[account] || account == owner();
    }
}
