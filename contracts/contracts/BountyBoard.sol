// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BountyBoard is ReentrancyGuard {
    enum BountyStatus { Open, Submitted, Approved, Cancelled }

    struct Bounty {
        uint256 id;
        address payable creator;
        address payable worker;
        string title;
        string description;
        uint256 amount;
        BountyStatus status;
        uint256 createdAt;
    }

    uint256 public nextBountyId = 1;
    mapping(uint256 => Bounty) public bounties;
    uint256[] public bountyIds;

    event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 amount);
    event WorkSubmitted(uint256 indexed bountyId, address indexed worker);
    event BountyApproved(uint256 indexed bountyId, address indexed worker, uint256 amount);
    event BountyCancelled(uint256 indexed bountyId);

    modifier bountyExists(uint256 _bountyId) {
        require(_bountyId > 0 && _bountyId < nextBountyId, "Bounty does not exist");
        _;
    }

    modifier onlyCreator(uint256 _bountyId) {
        require(bounties[_bountyId].creator == msg.sender, "Only bounty creator can perform this action");
        _;
    }

    function createBounty(string calldata _title, string calldata _description) external payable returns (uint256) {
        require(msg.value > 0, "Bounty amount must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 bountyId = nextBountyId;
        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: payable(msg.sender),
            worker: payable(address(0)),
            title: _title,
            description: _description,
            amount: msg.value,
            status: BountyStatus.Open,
            createdAt: block.timestamp
        });
        bountyIds.push(bountyId);
        nextBountyId++;

        emit BountyCreated(bountyId, msg.sender, msg.value);
        return bountyId;
    }

    function submitWork(uint256 _bountyId) external bountyExists(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];
        require(bounty.worker == address(0), "Work already submitted");
        require(bounty.status == BountyStatus.Open, "Bounty is not open");
        require(msg.sender != bounty.creator, "Creator cannot submit work to own bounty");

        bounty.worker = payable(msg.sender);
        bounty.status = BountyStatus.Submitted;

        emit WorkSubmitted(_bountyId, msg.sender);
    }

    function approveWork(uint256 _bountyId) external nonReentrant bountyExists(_bountyId) onlyCreator(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];
        require(bounty.status == BountyStatus.Submitted, "No work submitted yet");
        require(bounty.worker != address(0), "No worker assigned");

        bounty.status = BountyStatus.Approved;
        uint256 amount = bounty.amount;

        (bool sent, ) = bounty.worker.call{value: amount}("");
        require(sent, "Failed to send ETH to worker");

        emit BountyApproved(_bountyId, bounty.worker, amount);
    }

    function cancelBounty(uint256 _bountyId) external nonReentrant bountyExists(_bountyId) onlyCreator(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];
        require(bounty.status == BountyStatus.Open, "Can only cancel open bounties");

        bounty.status = BountyStatus.Cancelled;

        (bool sent, ) = bounty.creator.call{value: bounty.amount}("");
        require(sent, "Failed to refund ETH");

        emit BountyCancelled(_bountyId);
    }

    function getBountyCount() external view returns (uint256) {
        return bountyIds.length;
    }

    function getAllBounties() external view returns (Bounty[] memory) {
        Bounty[] memory result = new Bounty[](bountyIds.length);
        for (uint256 i = 0; i < bountyIds.length; i++) {
            result[i] = bounties[bountyIds[i]];
        }
        return result;
    }

    function getBountyById(uint256 _bountyId) external view returns (Bounty memory) {
        require(_bountyId > 0 && _bountyId < nextBountyId, "Bounty does not exist");
        return bounties[_bountyId];
    }
}
