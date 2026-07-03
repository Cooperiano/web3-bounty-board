import { ethers } from "hardhat";

async function main() {
  const BountyBoard = await ethers.getContractFactory("BountyBoard");
  const bountyBoard = await BountyBoard.deploy();
  await bountyBoard.waitForDeployment();

  const address = await bountyBoard.getAddress();
  console.log("BountyBoard deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
