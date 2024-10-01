'use client';
import { useModal } from 'connectkit';
import { useAccount } from 'wagmi';

export const useConnectWallet = () => {
  const { setOpen } = useModal();
  const { isConnected, isConnecting } = useAccount();
  const { address } = useAccount();

  const openModal = () => {
    setOpen(true);
  };

  return { openModal, isConnected, isConnecting, address };
};
