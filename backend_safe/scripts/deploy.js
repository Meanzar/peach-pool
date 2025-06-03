const hre =  require("hardhat");


async function main() {
    const Safe = await hre.ethers.getContractFactory("VotePool");
    const safeInstance = await Safe.deploy(['Jean', 'Yves', 'Catherine', 'Eva']);
    
    await safeInstance.waitForDeployment();
    const [ owner ] = await hre.ethers.getSigners();
    console.log(`Safe deployed at ${safeInstance.target} by ${owner.address}`);

    const contractAddress = await safeInstance.getAddress();
    console.log(`Safe contract address: ${contractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})