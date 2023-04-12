import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, connectorsForWallets, Theme
} from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);
const demoAppInfo = {
  appName: 'Dadbro NFT',
};

const { connectors } = getDefaultWallets({
  appName: 'Dadbro NFT',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const myCustomTheme: Theme = {
  colors: {
    accentColor: '#c3c3c3',
    accentColorForeground: 'black',
    actionButtonBorder: 'grey',
    actionButtonBorderMobile: '#c3c3c3',
    actionButtonSecondaryBackground: '#c3c3c3',
    closeButton: 'black',
    closeButtonBackground: 'transparent',
    connectButtonBackground: '#c3c3c3',
    connectButtonBackgroundError: '#c3c3c3',
    connectButtonInnerBackground: '#c3c3c3',
    connectButtonText: 'black',
    connectButtonTextError: 'black',
    connectionIndicator: '#c3c3c3',
    downloadBottomCardBackground: '#c3c3c3',
    downloadTopCardBackground: '#c3c3c3',
    error: '#c3c3c3',
    generalBorder: 'transparent',
    generalBorderDim: 'transparent',
    menuItemBackground: '#c3c3c3',
    modalBackdrop: 'transparent',
    modalBackground: '#c3c3c3',
    modalBorder: 'black',
    modalText: 'black',
    modalTextDim: 'black',
    modalTextSecondary: 'black',
    profileAction: '#c3c3c3',
    profileActionHover: '#c3c3c3',
    profileForeground: '#c3c3c3',
    selectedOptionBorder: 'grey',
    standby: '#c3c3c3',
  },
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
      // theme={myCustomTheme}
      chains={chains}
      appInfo={demoAppInfo} >
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
