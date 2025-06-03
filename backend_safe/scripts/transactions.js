const hre = require("hardhat");

async function main() {
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const VotePool = await hre.ethers.getContractFactory("VotePool");
    const votePool = VotePool.attach(contractAddress);
    const [owner] = await hre.ethers.getSigners();

    

    // const rmveProposalTx = await votePool.connect(owner).cancelVote();
    // await rmveProposalTx.wait();
    // console.log(`✅ Proposal removed by ${owner.address}`);
    const tx = await votePool.connect(owner).vote(3);
    await tx.wait();


    const count = await votePool.getProposalCount();
    for (let i = 0; i < count; i++) {
        const [name, voteCount] = await votePool.getProposal(i);
        console.log(`${i}: ${name} — ${voteCount.toString()} votes`);
    }

    const winner = await votePool.getWinningProposal();
    console.log(`🏆 Current winner: ${winner}`);
    console.log(`✅ Transaction hash: ${tx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
