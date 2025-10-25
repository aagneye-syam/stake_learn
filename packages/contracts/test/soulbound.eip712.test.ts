import { expect } from "chai";
import { ethers } from "hardhat";

describe("Soulbound EIP712", () => {
  async function deploy() {
    const [owner, verifier, alice] = await ethers.getSigners();
    const Soulbound = await ethers.getContractFactory("Soulbound");
    const sbt = await Soulbound.deploy(owner.address, verifier.address);
    await sbt.waitForDeployment();
    return { owner, verifier, alice, sbt };
  }

  const name = "ProofOfContribution";
  const version = "1";

  it("mints with valid signature and prevents replay", async () => {
    const { verifier, alice, sbt } = await deploy();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const domain = {
      name,
      version,
      chainId: Number(chainId),
      verifyingContract: await sbt.getAddress(),
    } as const;
    const types = {
      Permit: [
        { name: "to", type: "address" },
        { name: "commitHash", type: "bytes32" },
        { name: "reputation", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "tokenURI", type: "string" },
      ],
    } as const;
    const message = {
      to: await alice.getAddress(),
      commitHash: ethers.id("repo|sha|author"),
      reputation: 42n,
      expiry: BigInt(Math.floor(Date.now() / 1000) + 3600),
      tokenURI: "ipfs://test",
    };

    const signature = await (verifier as any).signTypedData(domain, types, message);
    await expect(sbt.connect(alice).mintWithSig(message, signature))
      .to.emit(sbt, "Transfer");

    // replay should fail
    await expect(sbt.connect(alice).mintWithSig(message, signature)).to.be.revertedWith(
      "Permit already used"
    );
  });

  it("rejects expired permit and invalid signer", async () => {
    const { verifier, owner, alice, sbt } = await deploy();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const domain = {
      name,
      version,
      chainId: Number(chainId),
      verifyingContract: await sbt.getAddress(),
    } as const;
    const types = {
      Permit: [
        { name: "to", type: "address" },
        { name: "commitHash", type: "bytes32" },
        { name: "reputation", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "tokenURI", type: "string" },
      ],
    } as const;
    const expired = {
      to: await alice.getAddress(),
      commitHash: ethers.id("x"),
      reputation: 10n,
      expiry: BigInt(Math.floor(Date.now() / 1000) - 1),
      tokenURI: "ipfs://x",
    };
    const sigExpired = await (verifier as any).signTypedData(domain, types, expired);
    await expect(sbt.connect(alice).mintWithSig(expired, sigExpired)).to.be.revertedWith(
      "Permit expired"
    );

    const msg = { ...expired, expiry: BigInt(Math.floor(Date.now() / 1000) + 3600) };
    const sigWrong = await (owner as any).signTypedData(domain, types, msg);
    await expect(sbt.connect(alice).mintWithSig(msg, sigWrong)).to.be.revertedWith(
      "Invalid signer"
    );
  });

  it("is non-transferable", async () => {
    const { verifier, alice, sbt } = await deploy();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const domain = {
      name,
      version,
      chainId: Number(chainId),
      verifyingContract: await sbt.getAddress(),
    } as const;
    const types = {
      Permit: [
        { name: "to", type: "address" },
        { name: "commitHash", type: "bytes32" },
        { name: "reputation", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "tokenURI", type: "string" },
      ],
    } as const;
    const message = {
      to: await alice.getAddress(),
      commitHash: ethers.id("z"),
      reputation: 1n,
      expiry: BigInt(Math.floor(Date.now() / 1000) + 3600),
      tokenURI: "ipfs://z",
    };
    const signature = await (verifier as any).signTypedData(domain, types, message);
    await sbt.connect(alice).mintWithSig(message, signature);

    await expect(sbt.connect(alice).approve(ethers.ZeroAddress, 1)).to.be.reverted;
    await expect(
      (sbt as any).connect(alice).transferFrom(await alice.getAddress(), ethers.ZeroAddress, 1)
    ).to.be.reverted;
  });
});


