import { expect } from "chai";
import { ethers } from "hardhat";
import { StakingManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StakingManager", function () {
  let stakingManager: StakingManager;
  let owner: SignerWithAddress;
  let verifier: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const COURSE_ID_1 = 1;
  const COURSE_ID_2 = 2;
  const STAKE_AMOUNT_1 = ethers.parseEther("0.002");
  const STAKE_AMOUNT_2 = ethers.parseEther("0.005");

  beforeEach(async function () {
    [owner, verifier, user1, user2] = await ethers.getSigners();

    const StakingManagerFactory = await ethers.getContractFactory("StakingManager");
    stakingManager = await StakingManagerFactory.deploy(owner.address);
    await stakingManager.waitForDeployment();

    // Add verifier
    await stakingManager.addVerifier(verifier.address);

    // Add courses
    await stakingManager.addCourse(COURSE_ID_1, STAKE_AMOUNT_1);
    await stakingManager.addCourse(COURSE_ID_2, STAKE_AMOUNT_2);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await stakingManager.owner()).to.equal(owner.address);
    });

    it("Should set owner as authorized verifier", async function () {
      expect(await stakingManager.authorizedVerifiers(owner.address)).to.be.true;
    });
  });

  describe("Course Management", function () {
    it("Should add a course", async function () {
      const courseId = 3;
      const stakeAmount = ethers.parseEther("0.01");

      await expect(stakingManager.addCourse(courseId, stakeAmount))
        .to.emit(stakingManager, "CourseAdded")
        .withArgs(courseId, stakeAmount);

      expect(await stakingManager.courseStakeAmounts(courseId)).to.equal(stakeAmount);
      expect(await stakingManager.activeCourses(courseId)).to.be.true;
    });

    it("Should update a course", async function () {
      const newStakeAmount = ethers.parseEther("0.003");

      await expect(stakingManager.updateCourse(COURSE_ID_1, newStakeAmount, false))
        .to.emit(stakingManager, "CourseUpdated")
        .withArgs(COURSE_ID_1, newStakeAmount, false);

      expect(await stakingManager.courseStakeAmounts(COURSE_ID_1)).to.equal(newStakeAmount);
      expect(await stakingManager.activeCourses(COURSE_ID_1)).to.be.false;
    });

    it("Should not allow non-owner to add course", async function () {
      await expect(
        stakingManager.connect(user1).addCourse(3, ethers.parseEther("0.01"))
      ).to.be.revertedWithCustomError(stakingManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Verifier Management", function () {
    it("Should add a verifier", async function () {
      const newVerifier = user1.address;

      await expect(stakingManager.addVerifier(newVerifier))
        .to.emit(stakingManager, "VerifierAdded")
        .withArgs(newVerifier);

      expect(await stakingManager.authorizedVerifiers(newVerifier)).to.be.true;
    });

    it("Should remove a verifier", async function () {
      await expect(stakingManager.removeVerifier(verifier.address))
        .to.emit(stakingManager, "VerifierRemoved")
        .withArgs(verifier.address);

      expect(await stakingManager.authorizedVerifiers(verifier.address)).to.be.false;
    });
  });

  describe("Staking", function () {
    it("Should allow user to stake for a course", async function () {
      await expect(
        stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 })
      )
        .to.emit(stakingManager, "Staked")
        .withArgs(user1.address, COURSE_ID_1, STAKE_AMOUNT_1);

      const stake = await stakingManager.getStake(user1.address, COURSE_ID_1);
      expect(stake.amount).to.equal(STAKE_AMOUNT_1);
      expect(stake.completed).to.be.false;
      expect(stake.refunded).to.be.false;
    });

    it("Should not allow incorrect stake amount", async function () {
      const wrongAmount = ethers.parseEther("0.001");

      await expect(
        stakingManager.connect(user1).stake(COURSE_ID_1, { value: wrongAmount })
      ).to.be.revertedWith("Incorrect stake amount");
    });

    it("Should not allow staking twice for the same course", async function () {
      await stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 });

      await expect(
        stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 })
      ).to.be.revertedWith("Already staked for this course");
    });

    it("Should not allow staking for inactive course", async function () {
      await stakingManager.updateCourse(COURSE_ID_1, STAKE_AMOUNT_1, false);

      await expect(
        stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 })
      ).to.be.revertedWith("Course is not active");
    });
  });

  describe("Course Completion", function () {
    beforeEach(async function () {
      await stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 });
    });

    it("Should allow verifier to complete course and refund stake", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);

      await expect(
        stakingManager.connect(verifier).completeCourse(user1.address, COURSE_ID_1)
      )
        .to.emit(stakingManager, "CourseCompleted")
        .withArgs(user1.address, COURSE_ID_1)
        .and.to.emit(stakingManager, "StakeRefunded")
        .withArgs(user1.address, COURSE_ID_1, STAKE_AMOUNT_1);

      const stake = await stakingManager.getStake(user1.address, COURSE_ID_1);
      expect(stake.completed).to.be.true;
      expect(stake.refunded).to.be.true;

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should not allow non-verifier to complete course", async function () {
      await expect(
        stakingManager.connect(user2).completeCourse(user1.address, COURSE_ID_1)
      ).to.be.revertedWith("Not authorized verifier");
    });

    it("Should not allow completing course twice", async function () {
      await stakingManager.connect(verifier).completeCourse(user1.address, COURSE_ID_1);

      await expect(
        stakingManager.connect(verifier).completeCourse(user1.address, COURSE_ID_1)
      ).to.be.revertedWith("Course already marked as completed");
    });
  });

  describe("Batch Operations", function () {
    beforeEach(async function () {
      await stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 });
      await stakingManager.connect(user2).stake(COURSE_ID_2, { value: STAKE_AMOUNT_2 });
    });

    it("Should batch complete courses", async function () {
      const users = [user1.address, user2.address];
      const courseIds = [COURSE_ID_1, COURSE_ID_2];

      await stakingManager.connect(verifier).batchCompleteCourses(users, courseIds);

      const stake1 = await stakingManager.getStake(user1.address, COURSE_ID_1);
      const stake2 = await stakingManager.getStake(user2.address, COURSE_ID_2);

      expect(stake1.completed).to.be.true;
      expect(stake2.completed).to.be.true;
    });

    it("Should get user stakes for multiple courses", async function () {
      const courseIds = [COURSE_ID_1, COURSE_ID_2];
      const stakes = await stakingManager.getUserStakes(user1.address, courseIds);

      expect(stakes[0].amount).to.equal(STAKE_AMOUNT_1);
      expect(stakes[1].amount).to.equal(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      await stakingManager.connect(user1).stake(COURSE_ID_1, { value: STAKE_AMOUNT_1 });

      const contractBalance = await ethers.provider.getBalance(stakingManager.getAddress());
      expect(contractBalance).to.equal(STAKE_AMOUNT_1);

      await expect(stakingManager.emergencyWithdraw())
        .to.emit(stakingManager, "EmergencyWithdraw");

      const finalBalance = await ethers.provider.getBalance(stakingManager.getAddress());
      expect(finalBalance).to.equal(0);
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await expect(
        stakingManager.connect(user1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(stakingManager, "OwnableUnauthorizedAccount");
    });
  });
});
