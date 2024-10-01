import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { env } from '../../env';

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${env.VITE_ALCHEMY_ID}`
      ),
    },

    // Required API Keys
    walletConnectProjectId: env.VITE_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: 'Mocaverse',

    // Optional App Info
    appDescription: 'Mocaverse',
    appUrl: 'https://mocaverse.xyz', // your app's url
    appIcon: 'https://mocaverse.xyz/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);
