import { expect } from "chai";
import { ethers } from "hardhat";
import { BountyBoard } from "../typechain-types";

describe("BountyBoard", function () {
  let bountyBoard: BountyBoard;
  let creator: any, worker: any, other: any;
  const BOUNTY_AMOUNT = ethers.parseEther("1.0");

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [, creator, worker, other] = signers;
    const BountyBoardFactory = await ethers.getContractFactory("BountyBoard");
    bountyBoard = await BountyBoardFactory.deploy();
    await bountyBoard.waitForDeployment();
  });

  describe("createBounty", function () {
    it("should create a bounty with correct parameters", async function () {
      const tx = await bountyBoard.connect(creator).createBounty(
        "Test Bounty",
        "Test Description",
        { value: BOUNTY_AMOUNT }
      );
      await tx.wait();

      const bounty = await bountyBoard.getBountyById(1);
      expect(bounty.id).to.equal(1n);
      expect(bounty.creator).to.equal(creator.address);
      expect(bounty.title).to.equal("Test Bounty");
      expect(bounty.description).to.equal("Test Description");
      expect(bounty.amount).to.equal(BOUNTY_AMOUNT);
      expect(bounty.status).to.equal(0); // Open
      expect(bounty.worker).to.equal(ethers.ZeroAddress);
    });

    it("should emit BountyCreated event", async function () {
      await expect(
        bountyBoard.connect(creator).createBounty("Test", "Desc", { value: BOUNTY_AMOUNT })
      ).to.emit(bountyBoard, "BountyCreated")
        .withArgs(1n, creator.address, BOUNTY_AMOUNT);
    });

    it("should increment bounty counter", async function () {
      await bountyBoard.connect(creator).createBounty("B1", "D1", { value: BOUNTY_AMOUNT });
      await bountyBoard.connect(creator).createBounty("B2", "D2", { value: BOUNTY_AMOUNT });
      expect(await bountyBoard.getBountyCount()).to.equal(2n);
    });

    it("should revert if value is 0", async function () {
      await expect(
        bountyBoard.connect(creator).createBounty("Test", "Desc", { value: 0 })
      ).to.be.revertedWith("Bounty amount must be greater than 0");
    });

    it("should revert if title is empty", async function () {
      await expect(
        bountyBoard.connect(creator).createBounty("", "Desc", { value: BOUNTY_AMOUNT })
      ).to.be.revertedWith("Title cannot be empty");
    });
  });

  describe("submitWork", function () {
    beforeEach(async function () {
      await bountyBoard.connect(creator).createBounty("Test", "Desc", { value: BOUNTY_AMOUNT });
    });

    it("should allow a worker to submit work", async function () {
      const tx = await bountyBoard.connect(worker).submitWork(1);
      await tx.wait();

      const bounty = await bountyBoard.getBountyById(1);
      expect(bounty.status).to.equal(1); // Submitted
      expect(bounty.worker).to.equal(worker.address);
    });

    it("should emit WorkSubmitted event", async function () {
      await expect(bountyBoard.connect(worker).submitWork(1))
        .to.emit(bountyBoard, "WorkSubmitted")
        .withArgs(1n, worker.address);
    });

    it("should revert if creator tries to submit work to own bounty", async function () {
      await expect(
        bountyBoard.connect(creator).submitWork(1)
      ).to.be.revertedWith("Creator cannot submit work to own bounty");
    });

    it("should revert if work already submitted", async function () {
      await bountyBoard.connect(worker).submitWork(1);
      await expect(
        bountyBoard.connect(other).submitWork(1)
      ).to.be.revertedWith("Work already submitted");
    });

    it("should revert if bounty does not exist", async function () {
      await expect(
        bountyBoard.connect(worker).submitWork(999)
      ).to.be.revertedWith("Bounty does not exist");
    });
  });

  describe("approveWork", function () {
    beforeEach(async function () {
      await bountyBoard.connect(creator).createBounty("Test", "Desc", { value: BOUNTY_AMOUNT });
      await bountyBoard.connect(worker).submitWork(1);
    });

    it("should approve work and transfer ETH to worker", async function () {
      const workerBalanceBefore = await ethers.provider.getBalance(worker.address);

      const tx = await bountyBoard.connect(creator).approveWork(1);
      await tx.wait();

      const workerBalanceAfter = await ethers.provider.getBalance(worker.address);
      const diff = workerBalanceAfter - workerBalanceBefore;
      expect(diff).to.equal(BOUNTY_AMOUNT);

      const bounty = await bountyBoard.getBountyById(1);
      expect(bounty.status).to.equal(2); // Approved
    });

    it("should emit BountyApproved event", async function () {
      await expect(bountyBoard.connect(creator).approveWork(1))
        .to.emit(bountyBoard, "BountyApproved")
        .withArgs(1n, worker.address, BOUNTY_AMOUNT);
    });

    it("should revert if not called by creator", async function () {
      await expect(
        bountyBoard.connect(worker).approveWork(1)
      ).to.be.revertedWith("Only bounty creator can perform this action");
    });

    it("should revert if no work submitted", async function () {
      await bountyBoard.connect(creator).createBounty("B2", "D2", { value: BOUNTY_AMOUNT });
      await expect(
        bountyBoard.connect(creator).approveWork(2)
      ).to.be.revertedWith("No work submitted yet");
    });
  });

  describe("cancelBounty", function () {
    beforeEach(async function () {
      await bountyBoard.connect(creator).createBounty("Test", "Desc", { value: BOUNTY_AMOUNT });
    });

    it("should cancel an open bounty and refund ETH", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

      const tx = await bountyBoard.connect(creator).cancelBounty(1);
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const diff = creatorBalanceAfter - creatorBalanceBefore + gasCost;
      expect(diff).to.equal(BOUNTY_AMOUNT);

      const bounty = await bountyBoard.getBountyById(1);
      expect(bounty.status).to.equal(3); // Cancelled
    });

    it("should emit BountyCancelled event", async function () {
      await expect(bountyBoard.connect(creator).cancelBounty(1))
        .to.emit(bountyBoard, "BountyCancelled")
        .withArgs(1n);
    });

    it("should revert if bounty already submitted", async function () {
      await bountyBoard.connect(worker).submitWork(1);
      await expect(
        bountyBoard.connect(creator).cancelBounty(1)
      ).to.be.revertedWith("Can only cancel open bounties");
    });

    it("should revert if not called by creator", async function () {
      await expect(
        bountyBoard.connect(worker).cancelBounty(1)
      ).to.be.revertedWith("Only bounty creator can perform this action");
    });
  });

  describe("getAllBounties", function () {
    it("should return all bounties", async function () {
      await bountyBoard.connect(creator).createBounty("B1", "D1", { value: BOUNTY_AMOUNT });
      await bountyBoard.connect(creator).createBounty("B2", "D2", { value: BOUNTY_AMOUNT });

      const bounties = await bountyBoard.getAllBounties();
      expect(bounties.length).to.equal(2);
      expect(bounties[0].title).to.equal("B1");
      expect(bounties[1].title).to.equal("B2");
    });

    it("should return empty array when no bounties", async function () {
      const bounties = await bountyBoard.getAllBounties();
      expect(bounties.length).to.equal(0);
    });
  });
});
