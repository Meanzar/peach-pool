import { ethers } from "ethers";
import VotePoolJson from "./abis/VotePool.json";
const abi = VotePoolJson.abi;

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask non installé");
  
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}
