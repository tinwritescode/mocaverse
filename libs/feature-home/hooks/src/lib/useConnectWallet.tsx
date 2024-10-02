'use client';
import { useModal } from 'connectkit';
import { useAccount, useDisconnect } from 'wagmi';

export const useConnectWallet = () => {
  const { setOpen } = useModal();
  const { isConnected, isConnecting } = useAccount();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const openModal = () => {
    setOpen(true);
  };

  return { openModal, isConnected, isConnecting, address, disconnect };
};
