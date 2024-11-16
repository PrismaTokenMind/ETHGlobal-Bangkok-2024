// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultToken is ERC20 {
    address manager;

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }

    constructor(address _manager) ERC20("VaultToken", "VT") {
        manager = _manager;
    }

    function mint(address to, uint256 amount) external onlyManager {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyManager {
        _burn(from, amount);
    }
}

contract FundManager {
    IERC20 public underlyingToken;
    VaultToken public vaultToken;
    address public owner;
    address public botAddress;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _underlyingToken, address _botAddress) {
        require(_underlyingToken != address(0), "Invalid token address");
        underlyingToken = IERC20(_underlyingToken); // USDC
        vaultToken = new VaultToken(address(this));
        owner = msg.sender;
        botAddress = _botAddress;
    }

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event BotDeposit(uint256 amount);
    event AdminWithdraw(uint256 amount);

    event TradeCompleted(uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut);
    event LimitOrderCreated(uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut);

    function tradeCompleted(uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut) external {
        emit TradeCompleted(amountIn, amountOut, tokenIn, tokenOut);
    }

    function limitOrderCreated(uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut) external {
        emit LimitOrderCreated(amountIn, amountOut, tokenIn, tokenOut);
    }

    /**
     * @dev Allows users to deposit underlying tokens and receive vault tokens.
     * Vault tokens are minted based on the current exchange rate.
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        uint256 totalUnderlying = underlyingToken.balanceOf(address(this));
        uint256 totalVaultSupply = vaultToken.totalSupply();

        uint256 mintAmount;

        if (totalVaultSupply == 0 || totalUnderlying == 0) {
            // First deposit or no underlying, 1:1 ratio
            mintAmount = amount;
        } else {
            // Calculate vault tokens to mint based on ratio
            mintAmount = (amount * totalVaultSupply) / totalUnderlying;
        }

        underlyingToken.transferFrom(msg.sender, botAddress, amount);
        vaultToken.mint(msg.sender, mintAmount);
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Allows users to burn vault tokens and redeem underlying tokens.
     */
    function withdraw(uint256 vaultTokenAmount) external {
        require(vaultTokenAmount > 0, "Amount must be greater than zero");

        uint256 totalUnderlying = underlyingToken.balanceOf(address(this));
        uint256 totalVaultSupply = vaultToken.totalSupply();

        require(totalVaultSupply > 0, "No vault tokens in circulation");

        // Calculate the amount of underlying tokens to withdraw
        uint256 redeemAmount = (vaultTokenAmount * totalUnderlying) / totalVaultSupply;

        vaultToken.burn(msg.sender, vaultTokenAmount);
        underlyingToken.transfer(msg.sender, redeemAmount);
        emit Withdraw(msg.sender, redeemAmount);
    }

    /**
     * @dev Admin-only function to deposit more underlying tokens into the vault.
     */
    function botDeposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        underlyingToken.transferFrom(msg.sender, address(this), amount);
        emit BotDeposit(amount);
    }

    /**
     * @dev Admin-only function to withdraw underlying tokens from the vault.
     */
    function adminWithdrawAll() external onlyOwner {
        uint256 amount = underlyingToken.balanceOf(address(this));
        underlyingToken.transfer(msg.sender, amount);
        emit AdminWithdraw(amount);
    }

    function setBotAddress(address _botAddress) external onlyOwner {
        botAddress = _botAddress;
    }

    /**
     * @dev Returns the current price of one vault token in terms of the underlying token.
     */
    function vaultTokenPrice() external view returns (uint256) {
        uint256 totalUnderlying = underlyingToken.balanceOf(address(this));
        uint256 totalVaultSupply = vaultToken.totalSupply();

        if (totalVaultSupply == 0 || totalUnderlying == 0) {
            return 1e18; // Default price is 1 (scaled to 18 decimals)
        }

        return (totalUnderlying * 1e18) / totalVaultSupply;
    }
}

