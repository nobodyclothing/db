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
    accentColor: '...',
    accentColorForeground: '...',
    actionButtonBorder: '...',
    actionButtonBorderMobile: '...',
    actionButtonSecondaryBackground: '...',
    closeButton: '...',
    closeButtonBackground: '...',
    connectButtonBackground: '...',
    connectButtonBackgroundError: '...',
    connectButtonInnerBackground: '...',
    connectButtonText: '...',
    connectButtonTextError: '...',
    connectionIndicator: '...',
    downloadBottomCardBackground: '...',
    downloadTopCardBackground: '...',
    error: '...',
    generalBorder: '...',
    generalBorderDim: '...',
    menuItemBackground: '...',
    modalBackdrop: '...',
    modalBackground: '#c3c3c3',
    modalBorder: '...',
    modalText: '...',
    modalTextDim: '...',
    modalTextSecondary: '...',
    profileAction: '...',
    profileActionHover: '...',
    profileForeground: '...',
    selectedOptionBorder: '...',
    standby: '...',
  },
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo} theme={myCustomTheme}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
