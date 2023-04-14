import { ethers } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { abi, DadBrosAdr } from "../contract-abi";
import DadBrosFreeWL from "../whitelist/DadBrosFreeWL.json";
import DadBrosFriendsWL from "../whitelist/DadBrosFriendsWL.json";
import { Logger } from "ethers/lib/utils";

export const ContractInstance = (signer: ethers.Signer) => {
  return new ethers.Contract(DadBrosAdr, abi, signer);
};

export const getValidAmountFree = (address: string): number => {
  const res = DadBrosFreeWL.find((holder) => holder.address.toLowerCase() === address);
  if (res) return res.count;
  return 0;
};

export const getValidAmountFriends = (address: string): number => {
  const res = DadBrosFriendsWL.find((holder) => holder.address.toLowerCase() === address);
  if (res) return res.count;
  return 0;
};

export const getProofFree = (address: string, count: number): string[] => {
  const leaves = DadBrosFreeWL.map((holder) =>
    keccak256(ethers.utils.solidityPack(["address", "uint256"], [holder.address, holder.count]))
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(ethers.utils.solidityPack(["address", "uint256"], [address, count]));
  return tree.getHexProof(leaf);
};

export const getProofFriends = (address: string, count: number): string[] => {
  const leaves = DadBrosFriendsWL.map((holder) =>
    keccak256(ethers.utils.solidityPack(["address", "uint256"], [holder.address, holder.count]))
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(ethers.utils.solidityPack(["address", "uint256"], [address, count]));
  return tree.getHexProof(leaf);
};

export const getErrorMessage = (error: any): string => {
  const errMessage = error?.data?.message || error?.message;
  if (error?.code === Logger.errors.ACTION_REJECTED) {
    return "User denied transaction";
  } else if (errMessage && /insufficient funds/.test(errMessage)) {
    return "Not enough balance";
  }

  const regex = /execution reverted: (?<target>[a-zA-Z0-9]+): (?<reason>[a-zA-Z0-9]+)/;
  const result = errMessage.match(regex);
  const reason = result?.groups?.reason;

  return reason || "Transaction reverted in some reason.";
};
