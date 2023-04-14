import { ethers } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { abi, DadBrosAdr } from "../contract-abi";
import DadBrosFreeWL from "../whitelist/DadBrosFreeWL.json";
import DadBrosFriendsWL from "../whitelist/DadBrosFriendsWL.json";

export const OmniElementsContract = (signer: ethers.Signer) => {
  return new ethers.Contract(DadBrosAdr, abi, signer);
};

export const getValidAmountFree = (address: string): number => {
  const res = DadBrosFreeWL.find(
    (holder) => holder.address.toLowerCase() === address
  );
  if (res) return res.count;
  return 0;
};

export const getValidAmountFriends = (address: string): number => {
  const res = DadBrosFriendsWL.find(
    (holder) => holder.address.toLowerCase() === address
  );
  if (res) return res.count;
  return 0;
};

export const getProofFree = (address: string, count: number): string[] => {
  const leaves = DadBrosFreeWL.map((holder) =>
    keccak256(
      ethers.utils.solidityPack(
        ["address", "uint256"],
        [holder.address, holder.count]
      )
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(
    ethers.utils.solidityPack(["address", "uint256"], [address, count])
  );
  return tree.getHexProof(leaf);
};

export const getProofFriends = (address: string, count: number): string[] => {
  const leaves = DadBrosFriendsWL.map((holder) =>
    keccak256(
      ethers.utils.solidityPack(
        ["address", "uint256"],
        [holder.address, holder.count]
      )
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(
    ethers.utils.solidityPack(["address", "uint256"], [address, count])
  );
  return tree.getHexProof(leaf);
};
