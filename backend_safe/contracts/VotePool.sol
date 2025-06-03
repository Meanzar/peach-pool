// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotePool {
    address public owner;
    bool public votingOpen;

    struct Proposal {
        string name;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    mapping(address => bool) public hasVoted;

    constructor(string[] memory proposalNames) {
        owner = msg.sender;
        votingOpen = true;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function vote(uint proposalIndex) external {
        require(votingOpen, "Voting is closed");
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalIndex < proposals.length, "Invalid proposal");

        proposals[proposalIndex].voteCount += 1;
        hasVoted[msg.sender] = true;
    }

    function closeVoting() external onlyOwner {
        votingOpen = false;
    }

    function getWinningProposal() public view returns (string memory winnerName) {
        uint maxVotes = 0;
        uint winningIndex = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winningIndex = i;
            }
        }
        return proposals[winningIndex].name;
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }
}
