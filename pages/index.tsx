import React from 'react';
import ReactDOM from "react-dom";
import "98.css";
import Image from 'next/image';
import bg from '../public/background.png'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';

import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { abi } from '../contract-abi';

import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';

import type {
  UsePrepareContractWriteConfig,
  UseContractReadConfig,
  UseContractWriteConfig,
} from 'wagmi';

const contractConfig = {
  address: 'address',
  abi,
};

import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0);
  const { isConnected } = useAccount();

  const { config: contractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'mint',
  } as UsePrepareContractWriteConfig);

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(contractWriteConfig as UseContractWriteConfig);

  const { data: totalSupplyData }: any = useContractRead({
    ...contractConfig,
    functionName: 'totalSupply',
    watch: true,
  } as UseContractReadConfig);

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess;

  return (
    <div className="page" >
      <Head>
        <title>dadbro.</title>
        <meta name="description" content="Dad, on the Blockchain."/>
        <meta property="image" content="/dadvatarTrans.png"/>

        {/*<!-- Facebook Meta Tags -->*/}
        <meta property="og:url" content="https://www.dadbro.xyz/"/>
        <meta property="og:type" content="website"/>
        <meta property="og:title" content="dadbro."/>
        <meta property="og:description" content="Dad, on the Blockchain"/>
        <meta property="og:image" content="/dadvatarTrans.png"/>

        {/*<!-- Twitter Meta Tags -->*/}
        <meta name="twitter:card" content="summary_large_image"/>
        <meta property="twitter:domain" content="dadbro."/>
        <meta property="twitter:url" content="https://www.dadbro.xyz/"/>
        <meta name="twitter:title" content="dadbro."/>
        <meta name="twitter:description" content="https://www.dadbro.xyz/"/>
        <meta name="twitter:image" content="/dadvatarTrans.png"/>

      </Head>


      <div className="container">

      <div className="imageContainer">
          <FlipCard>
            <FrontCard isCardFlipped={isMinted}>
              <Image
                layout="responsive"
                src="/dadGif.gif"
                width="500"
                height="500"
                alt="Dadbro NFT"
              />
              <h1 style={{ marginTop: 24 }}>dadbro.</h1>
              <ConnectButton />
            </FrontCard>

            <BackCard isCardFlipped={isMinted}>
              <div className="mintedCard">
                <Image
                  src="/dadvatarTrans.png"
                  width="100"
                  height="100"
                  alt="dadbro NFT"
                  style={{ borderRadius: 8 }}
                />
                <h2 style={{ marginTop: 6, marginBottom: 6, color: 'green' }}>dad check.</h2>
                <p style={{ marginBottom: 24 }}>
                  Your dadbro will show up in your wallet in the next few minutes.
                </p>
                <p style={{ marginBottom: 6 }}>
                  View on{' '}
                  <a href={`https://rinkeby.etherscan.io/tx/${mintData?.hash}`}>
                    Etherscan
                  </a>
                </p>
                <p>
                  View on{' '}
                  <a
                    href={`https://testnets.opensea.io/assets/rinkeby/${txData?.to}/1`}
                  >
                    Opensea
                  </a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
          <h3 style={{ margin: '12px 0 24px' }}>
                {totalMinted} Dads minted.
          </h3>
          <div className="links">

              <div className="linkRow">
                <Image
                  src="/etherscan.png"
                  width="20"
                  height="20"
                  alt="etherscan"
                />
              <a target="_blank" href="https://www.etherscan.com" rel="noopener noreferrer">
                <h4 style={{paddingLeft: '10px'}}>Etherscan</h4>
              </a>

              </div>

            <div className="linkRow">
              <Image
                src="/opensea.png"
                width="20"
                height="20"
                alt="opensea"
              />
              <a target="_blank" href="https://www.opensea.io" rel="noopener noreferrer">
                <h4 style={{paddingLeft: '10px'}}>Opensea</h4>
              </a>
            </div>
            <div className="linkRow">
              <Image
                src="/sushi.png"
                width="20"
                height="20"
                alt="sushi"
              />
              <a target="_blank" href="https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0xdDc6625FEcA10438857DD8660C021Cd1088806FB&chainId=1" rel="noopener noreferrer">
                <h4 style={{paddingLeft: '10px'}}>Swap $Rad</h4>
              </a>
            </div>

          </div>
        </div>

        <div>
          <div>

            <div className='titlebox'>
              <h1><b>dadbro.</b></h1>
              <h2>Dad, on the Blockchain.</h2>
              <ConnectButton />
            </div>

            {mintError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {mintError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {txError.message}
              </p>
            )}

            {mounted && isConnected && !isMinted && (
              <div className="mintWindows">
                <div className='window' style={{marginTop: '10px', marginBottom: '10px', width: '100%', maxWidth: '400px'}}>
                  <div className="title-bar">
                    <div className="title-bar-text">
                      Mint Dadlist
                    </div>
                  </div>
                  <div className='window-body'>
                  <p style={{ textAlign: "center", padding: '20px' }}>Free mints for Milady, Remilio, Radbro & Schizoposter Holders</p>
                  <div className="field-row" style={{ justifyContent: "center" }}>

                  <button
                    disabled={!mint || isMintLoading || isMintStarted}
                    data-mint-loading={isMintLoading}
                    data-mint-started={isMintStarted}
                    onClick={() => mint?.()}
                  >
                    {isMintLoading && 'Waiting for approval'}
                    {isMintStarted && 'Minting...'}
                    {!isMintLoading && !isMintStarted && 'Mint Dadlist'}
                  </button>
                  </div>
                  </div>

                </div>

                <div className='window' style={{marginTop: '10px', marginBottom: '10px',  width: '100%', maxWidth: '400px'}}>
                  <div className="title-bar">
                    <div className="title-bar-text">
                      Mint Family
                    </div>
                  </div>
                  <div className='window-body'>
                  <p style={{ textAlign: "center", padding: '20px' }}>Discounted mints for friends. when you&apos;re here, you&apos;re Family.</p>
                  <div className="field-row" style={{ justifyContent: "center" }}>

                  <button
                    disabled={!mint || isMintLoading || isMintStarted}
                    data-mint-loading={isMintLoading}
                    data-mint-started={isMintStarted}
                    onClick={() => mint?.()}
                  >
                    {isMintLoading && 'Waiting for approval'}
                    {isMintStarted && 'Minting...'}
                    {!isMintLoading && !isMintStarted && 'Mint Family'}
                  </button>
                  </div>
                  </div>

                </div>

                <div className='window' style={{marginTop: '10px', marginBottom: '10px',  width: '100%', maxWidth: '400px'}}>
                  <div className="title-bar">
                    <div className="title-bar-text">
                      Mint Public
                    </div>
                  </div>
                  <div className='window-body'>
                  <p style={{ textAlign: "center", padding: '20px' }}>Buy in bulk to get the best deal.</p>
                  <div className="field-row" style={{ justifyContent: "center" }}>

                  <button
                    disabled={!mint || isMintLoading || isMintStarted}
                    data-mint-loading={isMintLoading}
                    data-mint-started={isMintStarted}
                    onClick={() => mint?.()}
                  >
                    {isMintLoading && 'Waiting for approval'}
                    {isMintStarted && 'Minting...'}
                    {!isMintLoading && !isMintStarted && 'Mint Public'}
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
