import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const verifier = process.env.AI_VERIFIER_ADDRESS || deployer.address;

  const Soulbound = await ethers.getContractFactory("Soulbound");
  const soulbound = await Soulbound.deploy(deployer.address, verifier);
  await soulbound.waitForDeployment();
  console.log("Soulbound:", await soulbound.getAddress());

  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  console.log("Reputation:", await reputation.getAddress());

  const tx = await reputation.setMinter(await soulbound.getAddress());
  await tx.wait();
  console.log("Reputation minter set to Soulbound");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


