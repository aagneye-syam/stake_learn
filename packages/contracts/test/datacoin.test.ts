import { expect } from "chai";
import { ethers } from "hardhat";
import { DataCoin } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DataCoin", function () {
  let dataCoin: DataCoin;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  const MINT_AMOUNT = ethers.parseEther("100");
  const BURN_AMOUNT = ethers.parseEther("50");

  beforeEach(async function () {
    [owner, minter, burner, user1, user2] = await ethers.getSigners();

    const DataCoinFactory = await ethers.getContractFactory("DataCoin");
    dataCoin = await DataCoinFactory.deploy(owner.address);
    await dataCoin.waitForDeployment();

    // Add minter and burner
    await dataCoin.addMinter(minter.address);
    await dataCoin.addBurner(burner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dataCoin.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await dataCoin.name()).to.equal("DataCoin");
      expect(await dataCoin.symbol()).to.equal("DATA");
    });

    it("Should have correct decimals", async function () {
      expect(await dataCoin.decimals()).to.equal(18);
    });

    it("Should have zero initial supply", async function () {
      expect(await dataCoin.totalSupply()).to.equal(0);
    });

    it("Should set owner as authorized minter and burner", async function () {
      expect(await dataCoin.isMinter(owner.address)).to.be.true;
      expect(await dataCoin.isBurner(owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow authorized minter to mint tokens", async function () {
      await expect(dataCoin.connect(minter).mint(user1.address, MINT_AMOUNT, "Test mint"))
        .to.emit(dataCoin, "TokensMinted")
        .withArgs(user1.address, MINT_AMOUNT, "Test mint");

      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT);
      expect(await dataCoin.totalSupply()).to.equal(MINT_AMOUNT);
    });

    it("Should allow owner to mint tokens", async function () {
      await dataCoin.connect(owner).mint(user1.address, MINT_AMOUNT, "Owner mint");
      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT);
    });

    it("Should not allow non-authorized address to mint", async function () {
      await expect(
        dataCoin.connect(user1).mint(user2.address, MINT_AMOUNT, "Unauthorized mint")
      ).to.be.revertedWith("Not authorized minter");
    });

    it("Should not allow minting to zero address", async function () {
      await expect(
        dataCoin.connect(minter).mint(ethers.ZeroAddress, MINT_AMOUNT, "Zero address mint")
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should not allow minting zero amount", async function () {
      await expect(
        dataCoin.connect(minter).mint(user1.address, 0, "Zero amount mint")
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await dataCoin.MAX_SUPPLY();
      const excessAmount = maxSupply + 1n;
      
      await expect(
        dataCoin.connect(minter).mint(user1.address, excessAmount, "Excess mint")
      ).to.be.revertedWith("Would exceed max supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to user1 first
      await dataCoin.connect(minter).mint(user1.address, MINT_AMOUNT, "Setup mint");
    });

    it("Should allow authorized burner to burn tokens", async function () {
      await expect(dataCoin.connect(burner).burn(user1.address, BURN_AMOUNT, "Test burn"))
        .to.emit(dataCoin, "TokensBurned")
        .withArgs(user1.address, BURN_AMOUNT, "Test burn");

      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
      expect(await dataCoin.totalSupply()).to.equal(MINT_AMOUNT - BURN_AMOUNT);
    });

    it("Should allow owner to burn tokens", async function () {
      await dataCoin.connect(owner).burn(user1.address, BURN_AMOUNT, "Owner burn");
      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
    });

    it("Should allow users to burn their own tokens", async function () {
      await expect(dataCoin.connect(user1).burnSelf(BURN_AMOUNT))
        .to.emit(dataCoin, "TokensBurned")
        .withArgs(user1.address, BURN_AMOUNT, "Self burn");

      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
    });

    it("Should not allow non-authorized address to burn", async function () {
      await expect(
        dataCoin.connect(user2).burn(user1.address, BURN_AMOUNT, "Unauthorized burn")
      ).to.be.revertedWith("Not authorized burner");
    });

    it("Should not allow burning from zero address", async function () {
      await expect(
        dataCoin.connect(burner).burn(ethers.ZeroAddress, BURN_AMOUNT, "Zero address burn")
      ).to.be.revertedWith("Cannot burn from zero address");
    });

    it("Should not allow burning zero amount", async function () {
      await expect(
        dataCoin.connect(burner).burn(user1.address, 0, "Zero amount burn")
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should not allow burning more than balance", async function () {
      const excessAmount = MINT_AMOUNT + 1n;
      await expect(
        dataCoin.connect(burner).burn(user1.address, excessAmount, "Excess burn")
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to add minter", async function () {
      await expect(dataCoin.addMinter(user1.address))
        .to.emit(dataCoin, "MinterAdded")
        .withArgs(user1.address);

      expect(await dataCoin.isMinter(user1.address)).to.be.true;
    });

    it("Should allow owner to remove minter", async function () {
      await dataCoin.removeMinter(minter.address);
      expect(await dataCoin.isMinter(minter.address)).to.be.false;
    });

    it("Should allow owner to add burner", async function () {
      await expect(dataCoin.addBurner(user1.address))
        .to.emit(dataCoin, "BurnerAdded")
        .withArgs(user1.address);

      expect(await dataCoin.isBurner(user1.address)).to.be.true;
    });

    it("Should allow owner to remove burner", async function () {
      await dataCoin.removeBurner(burner.address);
      expect(await dataCoin.isBurner(burner.address)).to.be.false;
    });

    it("Should not allow non-owner to add minter", async function () {
      await expect(
        dataCoin.connect(user1).addMinter(user2.address)
      ).to.be.revertedWithCustomError(dataCoin, "OwnableUnauthorizedAccount");
    });

    it("Should not allow non-owner to add burner", async function () {
      await expect(
        dataCoin.connect(user1).addBurner(user2.address)
      ).to.be.revertedWithCustomError(dataCoin, "OwnableUnauthorizedAccount");
    });
  });

  describe("Utility Functions", function () {
    it("Should return correct total supply", async function () {
      await dataCoin.connect(minter).mint(user1.address, MINT_AMOUNT, "Test");
      expect(await dataCoin.getTotalSupply()).to.equal(MINT_AMOUNT);
    });

    it("Should return correct remaining supply", async function () {
      const maxSupply = await dataCoin.MAX_SUPPLY();
      await dataCoin.connect(minter).mint(user1.address, MINT_AMOUNT, "Test");
      expect(await dataCoin.getRemainingSupply()).to.equal(maxSupply - MINT_AMOUNT);
    });

    it("Should return correct max supply", async function () {
      const maxSupply = await dataCoin.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("1000000000")); // 1 billion tokens
    });
  });

  describe("Integration", function () {
    it("Should handle multiple mints and burns correctly", async function () {
      // Mint to multiple users
      await dataCoin.connect(minter).mint(user1.address, MINT_AMOUNT, "User1 mint");
      await dataCoin.connect(minter).mint(user2.address, MINT_AMOUNT, "User2 mint");
      
      expect(await dataCoin.totalSupply()).to.equal(MINT_AMOUNT * 2n);
      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT);
      expect(await dataCoin.balanceOf(user2.address)).to.equal(MINT_AMOUNT);

      // Burn from users
      await dataCoin.connect(burner).burn(user1.address, BURN_AMOUNT, "User1 burn");
      await dataCoin.connect(user2).burnSelf(BURN_AMOUNT);
      
      expect(await dataCoin.totalSupply()).to.equal(MINT_AMOUNT);
      expect(await dataCoin.balanceOf(user1.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
      expect(await dataCoin.balanceOf(user2.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
    });
  });
});
