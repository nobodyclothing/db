import {useEffect, useState} from "react";
import type { NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import {
  useAccount,
  useSigner,
} from "wagmi";
import "98.css";
import FlipCard, { BackCard, FrontCard } from "../components/FlipCard";
import {
  getProofFree,
  getProofFriends,
  getValidAmountFree,
  getValidAmountFriends,
  OmniElementsContract,
} from "../services/utils";

const Home: NextPage = () => {
  // https://nextjs.org/docs/messages/react-hydration-error
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [freeWlCount, setFreeWlCount] = useState(0);
  const [friendsWlCount, setFriendsWlCount] = useState(0);
  const [amount, setAmount] = useState(1);
  const [isMintLoading, setIsMintLoading] = useState(false);
  const [isMintSuccess, setIsMintSuccess] = useState(false);
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [publicPrice, setPublicPrice] = useState("");
  const [friendsPrice, setFriendsPrice] = useState("");
  const [totalMinted, setTotalMinted] = useState("0");

  const { data: signer, isError, isLoading } = useSigner();
  const { address, isConnected } = useAccount();

  const getCurrentPriceFriends = async (amount: number) => {
    const contract = OmniElementsContract(signer as ethers.Signer);
    const price = await contract.getPriceInfo(2, amount);
    setFriendsPrice(ethers.utils.formatEther(price[1]).toString());
    return price[1].toString();
  };
  const getCurrentPricePublic = async (amount: number) => {
    const contract = OmniElementsContract(signer as ethers.Signer);

    const price = await contract.getPriceInfo(3, amount);
    setPublicPrice(ethers.utils.formatEther(price[1]).toString());
    return price[1].toString();
  };

  const mintFree = async (amount: number) => {
    const contract = OmniElementsContract(signer as ethers.Signer);

    let proofFree;

    if (freeWlCount === 0) {
      alert("You are not on the whitelist");
      return;
    } else {
      try {
        setIsMintLoading(true);
        proofFree = getProofFree(
          (address as string).toLowerCase(),
          freeWlCount
        );
        const tx = await (
          await contract.mint(amount, 1, proofFree, friendsWlCount)
        ).wait();
        setIsMintLoading(false);
        const reciept = await signer?.provider?.getTransactionReceipt(
          tx.transactionHash
        );
        if (reciept?.status === 1) {
          setIsMintSuccess(true);

          setHash(tx.transactionHash);
          totalSupply();
        }
      } catch (e) {
        alert((e as any).message);

        setIsMintLoading(false);
      }
    }
  };

  const purchasePublic = async (amount: number) => {
    const contract = OmniElementsContract(signer as ethers.Signer);

    const price = await getCurrentPricePublic(amount);
    const proofPublic = [ethers.utils.formatBytes32String("0")];
    try {
      setIsMintLoading(true);
      const tx = await (
        await contract.mint(amount, 3, proofPublic, 0, { value: price })
      ).wait();
      setIsMintLoading(false);
      const reciept = await signer?.provider?.getTransactionReceipt(
        tx.transactionHash
      );
      if (reciept?.status === 1) {
        getCurrentPricePublic(amount);
        totalSupply();
        setIsMintSuccess(true);
        setHash(tx.transactionHash);
      }
    } catch (e) {
      alert((e as any).message);
      setIsMintLoading(false);
    }
  };
  const purchaseFriends = async (amount: number) => {
    const contract = OmniElementsContract(signer as ethers.Signer);

    let proofFriends;
    let price;

    if (friendsWlCount === 0) {
      alert("You are not on the whitelist");
      return;
    } else {
      try {
        setIsMintLoading(true);
        proofFriends = getProofFriends(
          (address as string).toLowerCase(),
          friendsWlCount
        );
        price = await getCurrentPriceFriends(amount);
        const tx = await (
          await contract.mint(amount, 2, proofFriends, friendsWlCount, {
            value: price,
          })
        ).wait();
        setIsMintLoading(false);
        const reciept = await signer?.provider?.getTransactionReceipt(
          tx.transactionHash
        );
        if (reciept?.status === 1) {
          getCurrentPriceFriends(amount);
          totalSupply();
          setIsMintSuccess(true);
          setHash(tx.transactionHash);
        }
      } catch (e) {
        alert((e as any).message);

        setIsMintLoading(false);
      }
    }
  };
  useEffect(() => {
    // Define a function that updates the data

    // Call the function immediately

    // Call the function every 10 minutes
    const interval = setInterval(() => {
      getCurrentPriceFriends(amount);
      getCurrentPricePublic(amount);
    }, 600000);

    // Clean up the interval when the component unmounts
  }, []);

  useEffect(() => {
    if (signer) {
      const wlFree = getValidAmountFree((address as string).toLowerCase());
      const wlFriends = getValidAmountFriends(
        (address as string).toLowerCase()
      );
      setFreeWlCount(wlFree);
      setFriendsWlCount(wlFriends);
    }
  }, [signer, address]);

  const totalSupply = async () => {
    const contract = OmniElementsContract(signer as ethers.Signer);
    const freeSupply = await contract.freeSupply();
    const friendsSupply = await contract.friendsAndPublicSupply();
    const supply = freeSupply + friendsSupply;
    setTotalMinted(supply.toString());
    return supply.toString();
  };

  const changedAmount = (newAmount: number) => {
    console.log(newAmount);
    setAmount(newAmount);
    getCurrentPriceFriends(newAmount);
    getCurrentPricePublic(newAmount);
  };

  useEffect(() => {
    if (signer) {
      totalSupply();
      getCurrentPriceFriends(amount);
      getCurrentPricePublic(amount);
    }
  }, [signer]);

  return (
    <div className="page">
      <Head>
        <title>dadbro.</title>
        <meta name="description" content="Dad, on the Blockchain." />
        <meta property="image" content="/dadvatarTrans.png" />

        {/*<!-- Facebook Meta Tags -->*/}
        <meta property="og:url" content="https://www.dadbro.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="dadbro." />
        <meta property="og:description" content="Dad, on the Blockchain" />
        <meta property="og:image" content="/dadvatarTrans.png" />

        {/*<!-- Twitter Meta Tags -->*/}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="dadbro." />
        <meta property="twitter:url" content="https://www.dadbro.xyz/" />
        <meta name="twitter:title" content="dadbro." />
        <meta name="twitter:description" content="https://www.dadbro.xyz/" />
        <meta name="twitter:image" content="/dadvatarTrans.png" />
      </Head>

      <div className="container">
        <div className="imageContainer">
          <FlipCard>
            <FrontCard isCardFlipped={isMintSuccess && !isMintLoading}>
              <Image
                layout="responsive"
                src="/dadGif.gif"
                width="500"
                height="500"
                alt="Dadbro NFT"
                priority={true}
              />
              <h1 style={{ marginTop: 24 }}>dadbro.</h1>
              <ConnectButton />
            </FrontCard>

            <BackCard isCardFlipped={isMintSuccess && !isMintLoading}>
              <div className="mintedCard">
                <Image
                  src="/dadvatarTrans.png"
                  width="90"
                  height="90"
                  alt="dadbro NFT"
                  style={{ borderRadius: 8 }}
                />
                <h3 style={{ marginTop: 6, marginBottom: 6, color: "green" }}>
                  dad check.
                </h3>
                <p style={{ marginBottom: 24 }}>
                  Your dadbro will show up in your wallet in the next few
                  minutes.
                </p>
                <p style={{ marginBottom: 6 }}>
                  View on{" "}
                  <a href={`https://etherscan.io/tx/${hash}`}>Etherscan</a>
                </p>
                <p>
                  View on <a href={`https://opensea.io/tx/${hash}`}>Opensea</a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
          <h3 style={{ margin: "12px 0 24px" }}>{totalMinted} Dads minted.</h3>
          <div className="links">
            <div className="linkRow">
              <Image
                src="/etherscan.png"
                width="20"
                height="20"
                alt="etherscan"
              />
              <a
                target="_blank"
                href="https://www.etherscan.com"
                rel="noopener noreferrer"
              >
                <h4 style={{ paddingLeft: "10px" }}>Etherscan</h4>
              </a>
            </div>

            <div className="linkRow">
              <Image src="/opensea.png" width="20" height="20" alt="opensea" />
              <a
                target="_blank"
                href="https://www.opensea.io"
                rel="noopener noreferrer"
              >
                <h4 style={{ paddingLeft: "10px" }}>Opensea</h4>
              </a>
            </div>
            <div className="linkRow">
              <Image src="/sushi.png" width="20" height="20" alt="sushi" />
              <a
                target="_blank"
                href="https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0xdDc6625FEcA10438857DD8660C021Cd1088806FB&chainId=1"
                rel="noopener noreferrer"
              >
                <h4 style={{ paddingLeft: "10px" }}>Swap $Rad</h4>
              </a>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div className="titlebox">
              <div className="topbox">
                <h1>
                  <b>dadbro.</b>
                </h1>
                <h2>Dad, on the Blockchain.</h2>
              </div>

              <div className="connect-line">
                <ConnectButton />
              </div>
            </div>

            {error && (
              <p style={{ marginTop: 24, color: "#FF6257" }}>Error: {error}</p>
            )}
            {error && (
              <p style={{ marginTop: 24, color: "#FF6257" }}>Error: {error}</p>
            )}

            {mounted && isConnected && (
              <div className="mintWindows">
                <div
                  className="window"
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                >
                  <div className="title-bar">
                    <div className="title-bar-text">Mint Dadlist</div>
                  </div>
                  <div className="window-body">
                    <p> you have {freeWlCount} TOTAL free mints</p>
                    <p style={{ textAlign: "center", padding: "20px" }}>
                      Free mints for Milady, Remilio, Radbro & Schizoposter
                      Holders
                    </p>
                    <div
                      className="field-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <input
                        style={{ width: "80px" }}
                        onChange={(val) =>
                          changedAmount(Number(val.target.value))
                        }
                        type="number"
                        max={4}
                        min={1}
                        value={amount}
                      ></input>
                      <button
                        disabled={isMintLoading}
                        data-mint-loading={isMintLoading}
                        onClick={() => mintFree(amount)}
                      >
                        {isMintLoading && "Approving and"}
                        {isMintLoading && "Minting..."}
                        {!isMintLoading && "Mint Dadlist"}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="window"
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                >
                  <div className="title-bar">
                    <div className="title-bar-text">Mint Family</div>
                  </div>
                  <div className="window-body">
                    <p> you have {friendsWlCount} TOTAL family mints</p>

                    <p style={{ textAlign: "center", padding: "20px" }}>
                      Discounted mints for friends. when you&apos;re here,
                      you&apos;re Family.
                    </p>
                    <div
                      className="field-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <input
                        style={{ width: "80px" }}
                        value={amount}
                        onChange={(val) =>
                          changedAmount(Number(val.target.value))
                        }
                        max={5}
                        min={1}
                        type="number"
                      ></input>
                      <p> Price: {friendsPrice.slice(0, 7)}</p>
                      <button
                        disabled={isMintLoading}
                        data-mint-loading={isMintLoading}
                        onClick={() => purchaseFriends(amount)}
                      >
                        {isMintLoading && "Approving and"}
                        {isMintLoading && "Minting..."}
                        {!isMintLoading && "Mint Family"}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="window"
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                >
                  <div className="title-bar">
                    <div className="title-bar-text">Mint Public</div>
                  </div>
                  <div className="window-body">
                    <p style={{ textAlign: "center", padding: "20px" }}>
                      Buy in bulk to get the best deal.
                    </p>
                    <div
                      className="field-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <input
                        style={{ width: "80px" }}
                        value={amount}
                        onChange={(val) =>
                          changedAmount(Number(val.target.value))
                        }
                        max={20}
                        min={1}
                        type="number"
                      ></input>
                      <p> Price: {publicPrice.slice(0, 7)}</p>
                      <button
                        disabled={isMintLoading}
                        data-mint-loading={isMintLoading}
                        onClick={() => purchasePublic(amount)}
                      >
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
