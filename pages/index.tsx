import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import toast from "react-hot-toast";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { getProvider } from "@wagmi/core";
import "98.css";
import FlipCard, { BackCard, FrontCard } from "../components/FlipCard";
import {
  getErrorMessage,
  getProofClaim,
  getProofFriends,
  getValidAmountClaim,
  getValidAmountFriends,
  ContractInstance
} from "../services/utils";
import { SUPPORT_CHAIN_IDS } from "../types/enums";

const Home: NextPage = () => {
  // https://nextjs.org/docs/messages/react-hydration-error
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [claimWlIds, setClaimWlIds] = useState<string[]>([]);
  const [friendsWlCount, setFriendsWlCount] = useState(0);
  const [amountFamily, setAmountFamily] = useState(1);
  const [amountPublic, setAmountPublic] = useState(1);
  const [isMintLoading, setIsMintLoading] = useState(false);
  const [isMintSuccess, setIsMintSuccess] = useState(false);
  const [slippage, setSlippage] = useState(0)
  const [hash, setHash] = useState("");
  const [publicPrice, setPublicPrice] = useState("");
  const [friendsPrice, setFriendsPrice] = useState("");
  const [totalMinted, setTotalMinted] = useState("0");
  const [refresh, setRefresh] = useState(false);

  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  /**
   * @description The following code defines an async function `mintFree` that mints a certain amount of tokens on the DADBROS contract instance. If the user is on the whitelist and a signer is connected, the function calculates a proof and calls the `mint` function on the contract, passing in the amount, the proof, and the number of friends' addresses on the whitelist.
   */
  const claim = async () => {
    if (claimWlIds.length === 0) {
      return toast.error("You are not on the whitelist");
    } else if (!signer) {
      return toast.error("Please connect your wallet");
    } else if (!chain) {
      return toast.error("You are connected to an unsupported network");
    } else {
      const contract = ContractInstance(signer as ethers.Signer, chain.id);
      try {
        setIsMintLoading(true);

        const proofClaim = getProofClaim((address as string).toLowerCase(), claimWlIds);
        const tx = await (await contract.claim(claimWlIds, address, proofClaim)).wait();
        const receipt = await signer?.provider?.getTransactionReceipt(tx.transactionHash);
        if (receipt?.status === 1) {
          setIsMintSuccess(true);
          setHash(tx.transactionHash);
          setRefresh(!refresh);
        }
      } catch (e) {
        console.log(e)
        toast.error(getErrorMessage(e));
      } finally {
        setIsMintLoading(false);
      }
    }
  };



  /**
   * @description The following code defines an async function `mintFriends` that mints a certain amount of tokens on the DADBROS contract instance. If the user is on the whitelist and a signer is connected, the function calculates a proof and calls the `mint` function on the contract, passing in the amount, the proof, and the number of friends' addresses on the whitelist.
   */
  const purchasePublic = async () => {
    if (!signer) {
      return toast.error("Please connect your wallet");
    } else if (!chain) {
      return toast.error("You are connected to an unsupported network");
    } else if (parseInt(totalMinted) + amountPublic > 2000) {
      return toast.error("Max supply reached");
    }else {
      const proofPublic = [ethers.utils.formatBytes32String("0")];
      try {
        const contract = ContractInstance(signer as ethers.Signer, chain.id);
        setIsMintLoading(true);
        const publicPrice = await contract.getPriceInfo(3, amountPublic);
        const ethPrice = ethers.utils.formatEther(publicPrice[1].toString());
        const slippagePrice = Number(ethPrice) * (1 + slippage/100);
        const tx = await (
          await contract.mint(amountPublic, 3, proofPublic, 0, {
            value: ethers.utils.parseEther(slippagePrice.toString())
          })
        ).wait();
        setIsMintLoading(false);
        const receipt = await signer?.provider?.getTransactionReceipt(tx.transactionHash);
        if (receipt?.status === 1) {
          setIsMintSuccess(true);
          setHash(tx.transactionHash);
          setRefresh(!refresh);
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setIsMintLoading(false);
      }
    }
  };

  /**
   * @description The following code defines an async function `mintFriends` that mints a certain amount of tokens on the DADBROS contract instance. If the user is on the whitelist and a signer is connected, the function calculates a proof and calls the `mint` function on the contract, passing in the amount, the proof, and the number of friends' addresses on the whitelist.
   */
  const purchaseFriends = async () => {
    if (friendsWlCount === 0) {
      return toast.error("You are not on the whitelist");
    } else if (!signer) {
      return toast.error("Please connect your wallet");
    } else if (!chain) {
      return toast.error("You are connected to an unsupported network");
    } else if (parseInt(totalMinted) + amountFamily > 2000) {
      return toast.error("Max supply reached");
    }else {
      try {
        const contract = ContractInstance(signer as ethers.Signer, chain.id);
        setIsMintLoading(true);
        const proofFriends = getProofFriends((address as string).toLowerCase(), 10);
        const tx = await (
          await contract.mint(amountFamily, 2, proofFriends, 10, {
            value: ethers.utils.parseEther(friendsPrice)
          })
        ).wait();
        setIsMintLoading(false);
        const receipt = await signer?.provider?.getTransactionReceipt(tx.transactionHash);
        if (receipt?.status === 1) {
          setRefresh(!refresh);
          setIsMintSuccess(true);
          setHash(tx.transactionHash);
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setIsMintLoading(false);
      }
    }
  };



  useEffect(() => {
    // Define a function that updates the data

    // Call the function immediately

    // Call the function every 10 minutes
    const interval = setInterval(() => {
      setRefresh(!refresh);
    }, 600000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (signer && address && chain) {
      const wlClaim = getValidAmountClaim((address as string).toLowerCase());
      getValidAmountFriends((address as string).toLowerCase(), ContractInstance(signer as ethers.Signer, chain.id)).then((res) => {
        setFriendsWlCount(res);
      });
      setClaimWlIds(wlClaim);

    }
  }, [signer, address, chain, isMintSuccess, refresh]);

  useEffect(() => {
    (async () => {
      if (chain && chain.unsupported) {
        setFriendsPrice("0");
        setPublicPrice("0");
        setTotalMinted("0");
      } else if ((amountFamily > 0 || amountPublic > 0) && signer) {
        const provider = getProvider({
          chainId: chain ? chain.id : SUPPORT_CHAIN_IDS.ETHEREUM
        });
        const contract = ContractInstance(provider, chain ? chain.id : SUPPORT_CHAIN_IDS.ETHEREUM);
        // getting friends price
        const price = await contract.getPriceInfo(2, amountFamily);
        setFriendsPrice(ethers.utils.formatEther(price[1]).toString());

        // getting public price
        const publicPrice = await contract.getPriceInfo(3, amountPublic);
        const ethPrice = ethers.utils.formatEther(publicPrice[1].toString());
        const slippagePrice = Number(ethPrice) * (1 + slippage/100);
        setPublicPrice(slippagePrice.toString());

        // getting total supply
        const claimSupply = await contract.claimSupply();
        const friendsSupply = await contract.friendsAndPublicSupply();
        const supply = claimSupply + friendsSupply;
        setTotalMinted(supply.toString());
      } else {
        setFriendsPrice("0");
        setPublicPrice("0");
        setTotalMinted("0");
      }
    })();
  }, [signer, address, amountPublic, amountFamily, refresh, chain, slippage, isMintSuccess]);

  return (
    <div className='page'>
      <Head>
        <title>dadbro.</title>
        <meta name='description' content='Dad, on the Blockchain.' />
        <meta property='image' content='/dadvatarTrans.png' />

        {/*<!-- Facebook Meta Tags -->*/}
        <meta property='og:url' content='https://www.dadbro.xyz/' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='dadbro.' />
        <meta property='og:description' content='Dad, on the Blockchain' />
        <meta property='og:image' content='/dadvatarTrans.png' />

        {/*<!-- Twitter Meta Tags -->*/}
        <meta name='twitter:card' content='summary_large_image' />
        <meta property='twitter:domain' content='dadbro.' />
        <meta property='twitter:url' content='https://www.dadbro.xyz/' />
        <meta name='twitter:title' content='dadbro.' />
        <meta name='twitter:description' content='https://www.dadbro.xyz/' />
        <meta name='twitter:image' content='/dadvatarTrans.png' />
      </Head>

      <div className='container'>
        <div className='imageContainer'>
          <FlipCard>
            <FrontCard isCardFlipped={isMintSuccess && !isMintLoading}>
              <Image layout='responsive' src='/dadGif.gif' width='500' height='500' alt='Dadbro NFT' priority={true} />
              <h1 style={{ marginTop: 24 }}>dadbro.</h1>
              <ConnectButton />
            </FrontCard>

            <BackCard isCardFlipped={isMintSuccess && !isMintLoading}>
              <div className='mintedCard'>
                <Image src='/dadvatarTrans.png' width='90' height='90' alt='dadbro NFT' style={{ borderRadius: 8 }} />
                <h3 style={{ marginTop: 6, marginBottom: 6, color: "green" }}>dad check.</h3>
                <p style={{ marginBottom: 24 }}>check your wallet, Dad is finally home.</p>
                <p style={{ marginBottom: 6 }}>
                  View on{" "}
                  <a href={`https://etherscan.io/tx/${hash}`} target={"_blank"} rel='noreferrer'>
                    Etherscan
                  </a>
                </p>
                <p>
                  View on{" "}
                  <a href={`https://opensea.io/tx/${hash}`} target={"_blank"} rel='noreferrer'>
                    Opensea
                  </a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
          <h3 style={{ margin: "12px 0 24px" }}>{totalMinted}/3000 Dads minted.</h3>
          <div className='links'>
            <div className='linkRow'>
              <Image src='/etherscan.png' width='20' height='20' alt='etherscan' />
              <a target='_blank' href='https://etherscan.io/address/0x78F3C6c28b6D70982f98678F5e09c3731c963152' rel='noopener noreferrer'>
                <h4 style={{ paddingLeft: "10px" }}>Etherscan</h4>
              </a>
            </div>

            <div className='linkRow'>
              <Image src='/opensea.png' width='20' height='20' alt='opensea' />
              <a target='_blank' href='https://opensea.io/collection/dadbros' rel='noopener noreferrer'>
                <h4 style={{ paddingLeft: "10px" }}>Opensea</h4>
              </a>
            </div>
            <div className='linkRow'>
              <Image src='/twitter.png' width='20' height='20' alt='twitter' />
              <a target='_blank' href='https://www.twitter.com/raddadbro' rel='noopener noreferrer'>
                <h4 style={{ paddingLeft: "10px" }}>Twitter</h4>
              </a>
            </div>
            <div className='linkRow'>
              <Image src='/sushi.png' width='20' height='20' alt='sushi' />
              <a
                target='_blank'
                href='https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0xdDc6625FEcA10438857DD8660C021Cd1088806FB&chainId=1'
                rel='noopener noreferrer'
              >
                <h4 style={{ paddingLeft: "10px" }}>Swap $Rad</h4>
              </a>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div className='titlebox'>
              <div className='topbox'>
                <h1>
                  <b>dadbro.</b>
                </h1>
                <h2>Dad, on the Blockchain.</h2>
              </div>

              <div className='connect-line'>
                <ConnectButton />
              </div>
            </div>

            {/*{error && <p style={{ marginTop: 24, color: "#FF6257" }}>Error: {error}</p>}*/}

            {mounted && isConnected && (
              <div className='mintWindows'>
                <div
                  className='window'
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    maxWidth: "400px"
                  }}
                >
                  <div className='title-bar'>
                    <div className='title-bar-text'>Convert Your Dads to v2</div>
                  </div>
                  <div className='window-body'>
                    <p> You have {claimWlIds.length} v2 Dads to Claim.</p>
                    <p style={{ textAlign: "center", padding: "20px" }}>Click <b>Claim</b> to receive v2 versions of your minted v1 Dads.</p>
                    <div className='field-row' style={{ justifyContent: "center" }}>

                      <button disabled={false} data-mint-loading={isMintLoading} onClick={claim}>
                        {isMintLoading && "Approving and "}
                        {isMintLoading && "Claiming..."}
                        {!isMintLoading && "Claim"}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className='window'
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    maxWidth: "400px"
                  }}
                >
                  <div className='title-bar'>
                    <div className='title-bar-text'>Mint Family</div>
                  </div>
                  <div className='window-body'>
                    <p> You have {friendsWlCount} TOTAL family mints.</p>

                    <p style={{ textAlign: "center", padding: "20px" }}>
                      Discounted mints for friends. When you&apos;re here, you&apos;re Family. Price is a flat .01, take your time.
                    </p>
                    <div className='field-row' style={{ justifyContent: "space-between" }}>
                      <input
                        style={{ width: "80px" }}
                        value={amountFamily}
                        onChange={(val) => setAmountFamily(Number(val.target.value))}
                        max={10}
                        min={1}
                        type='number'
                      />
                      <p> Price: {friendsPrice.slice(0, 7)}</p>
                      <button disabled={isMintLoading} data-mint-loading={isMintLoading} onClick={purchaseFriends}>
                        {isMintLoading && "Approving and "}
                        {isMintLoading && "Minting..."}
                        {!isMintLoading && "Mint Family"}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className='window'
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    maxWidth: "400px"
                  }}
                >
                  <div className='title-bar'>
                    <div className='title-bar-text'>Mint Public</div>
                  </div>
                  <div className='window-body'>
                    <p style={{ textAlign: "center", padding: "20px" }}>Buy in bulk to get the best deal. Price is dynamic so use <b>Slippage</b> if mint volume is high, we recommend 5%.</p>
                    <div className='field-row' style={{ justifyContent: "space-between" }}>

                      <input
                        style={{ width: "80px" }}
                        value={amountPublic}
                        onChange={(val) => setAmountPublic(Number(val.target.value))}
                        max={20}
                        min={1}
                        type='number'
                      />
                      <div style={{ display: "flex", gap: "2px", alignItems: "center"}}>
                      <span>Slippage: </span>
                      <input

                        type="number"
                        value={slippage}
                        min="0"
                        max="5"
                        step="1"
                        onChange={(e) => setSlippage(Number(e.target.value))}
                      />

                      <span>%</span>
                    </div>
                      <p> Price: {publicPrice.slice(0, 7)}</p>
                      <button disabled={isMintLoading} data-mint-loading={isMintLoading} onClick={purchasePublic}>
                        {isMintLoading && "Approving and "}
                        {isMintLoading && "Minting..."}
                        {!isMintLoading && "Mint Public"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
