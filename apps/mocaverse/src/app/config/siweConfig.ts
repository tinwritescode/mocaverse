import { SIWEConfig } from 'connectkit';
import { SiweMessage } from 'siwe';

export const siweConfig: SIWEConfig = {
  getNonce: async () => {
    // Mock implementation
    return 'mock-nonce-' + Math.random().toString(36).substring(2, 15);
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      version: '1',
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      statement: 'Sign in With Ethereum to Mocaverse.',
    }).prepareMessage();
  },
  verifyMessage: async ({ message, signature }) => {
    // Mock implementation
    console.log('Verifying message:', message, signature);
    return true;
  },
  getSession: async () => {
    // Mock implementation
    return {
      address: '0x0dade918adb44f2cba379032e537677d3f264f41', // TODO: get from wallet
      chainId: 1,
    };
  },
  signOut: async () => {
    // Mock implementation
    console.log('Signing out');
    return true;
  },
};
