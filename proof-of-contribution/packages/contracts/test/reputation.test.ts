import { expect } from "chai";
import { ethers } from "hardhat";

describe("Reputation", () => {
  it("records and ranks contributions", async () => {
    const [owner, minter, a, b] = await ethers.getSigners();
    const Reputation = await ethers.getContractFactory("Reputation");
    const rep = await Reputation.deploy(owner.address);
    await rep.waitForDeployment();
    await rep.setMinter(await minter.getAddress());

    await rep.connect(owner).recordContribution(await a.getAddress(), 10);
    await rep.connect(minter).recordContribution(await b.getAddress(), 20);

    expect(await rep.getScore(await a.getAddress())).to.equal(10);
    expect(await rep.getScore(await b.getAddress())).to.equal(20);

    const [addrs, scores] = await rep.topContributors(2);
    expect(addrs[0]).to.equal(await b.getAddress());
    expect(scores[0]).to.equal(20n);
  });
});


