import { useMutation, useQuery } from '@tanstack/react-query';
import { getIsEmailUsed, getIsWalletUsed, reserve, verifyCode } from './api';

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: (code: string) => {
      return verifyCode({ code });
    },
  });
};

export const useIsEmailUsed = (email?: string) => {
  return useQuery({
    queryKey: ['isEmailUsed', email] as const,
    queryFn: ({ queryKey: [_, email] }) => {
      return getIsEmailUsed({ email: email as NonNullable<typeof email> });
    },
    enabled: !!email,
  });
};

export const useIsWalletUsed = (wallet?: string) => {
  return useQuery({
    queryKey: ['isWalletUsed', wallet] as const,
    queryFn: ({ queryKey: [_, wallet] }) => {
      return getIsWalletUsed({ wallet: wallet as NonNullable<typeof wallet> });
    },
    enabled: !!wallet,
  });
};

export const useReserve = () => {
  return useMutation({
    mutationFn: (props: {
      code: string;
      email: string;
      wallet: string;
      signature: string;
    }) => {
      return reserve(props);
    },
  });
};
