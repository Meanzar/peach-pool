import { ethers } from "ethers";
import abi from "./abis/VotePool.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export async function getContract() {
    console.log("Récupération du contrat à l'adresse", CONTRACT_ADDRESS);
  if (!window.ethereum) throw new Error("MetaMask non installé");
  await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("MetaMask connecté");
  const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider récupéré", provider);
  const signer = await provider.getSigner();
  console.log("Signer récupéré", signer);
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}
