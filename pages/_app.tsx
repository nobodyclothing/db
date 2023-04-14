import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli, mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Toaster } from "react-hot-toast";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : [])],
  [publicProvider()]
);
const demoAppInfo = {
  appName: "Dadbro NFT"
};

const { connectors } = getDefaultWallets({
  appName: "Dadbro NFT",
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: "#c3c3c3",
          accentColorForeground: "black",
          borderRadius: "small",
          fontStack: "system",
          overlayBlur: "small"
        })}
        chains={chains}
        appInfo={demoAppInfo}
      >
        <Component {...pageProps} />
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
