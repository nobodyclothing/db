import { ethers } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { Logger } from "ethers/lib/utils";
import { abi, Addresses } from "./contract-abi";
import DadBrosClaimWL from "../whitelist/DadBrosClaimWL.json";
import DadBrosFriendsWL from "../whitelist/DadBrosFriendsWL.json";

export const ContractInstance = (signer: ethers.Signer | ethers.providers.Provider, chainId: number) => {
  return new ethers.Contract(Addresses[chainId.toString()], abi, signer);
};

export const getValidAmountClaim = (address: string): string[] => {
  const res = DadBrosClaimWL.find((holder) => holder.address.toLowerCase() === address);
  if (res) return res.ids;
  return [];
};

export const getValidAmountFriends = async (address: string, contract: ethers.Contract): Promise<number> => {
  const res = DadBrosFriendsWL.find((holder) => holder.address.toLowerCase() === address);
  if (res) {
    const minted = await contract.minted(2, address)
    return res.count - Number(minted);
  }
  return 0;
};

export const getProofClaim = (address: string, ids: string[]): string[] => {
  const leaves = DadBrosClaimWL.map((holder) =>
    keccak256(ethers.utils.solidityPack(["address", "uint256[]"], [holder.address, holder.ids]))
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(ethers.utils.solidityPack(["address", "uint256[]"], [address, ids]));
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
