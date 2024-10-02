import { zodResolver } from '@hookform/resolvers/zod';
import {
  useConnectWallet,
  useIsEmailUsed,
  useIsWalletUsed,
  useReserve,
  useVerifyCode,
} from '@mocaverse/feature-home-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const inviteCodeSchema = z.object({
  inviteCode: z.string().min(6, 'Invite code must be at least 6 characters'),
});

const walletAndEmailSchema = z.object({
  walletAddress: z.string().min(42, 'Invalid wallet address'),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof inviteCodeSchema> &
  z.infer<typeof walletAndEmailSchema>;

export function useReservationForm(
  step: number,
  setStep: (step: number) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(step === 1 ? inviteCodeSchema : walletAndEmailSchema),
    mode: 'onChange',
  });

  const { openModal, isConnected, address } = useConnectWallet();

  const email = form.watch('email');

  const { mutateAsync: verifyCode } = useVerifyCode();
  const { mutateAsync: reserve } = useReserve();

  const { data: isEmailUsed } = useIsEmailUsed(email);
  const { data: isWalletUsed } = useIsWalletUsed(address);

  useEffect(() => {
    if (isEmailUsed?.error) {
      form.setError('email', { message: 'Email is already used' });
    }
    if (isWalletUsed?.error) {
      form.setError('walletAddress', { message: 'Wallet is already used' });
    }
  }, [isEmailUsed, isWalletUsed]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (step === 1) {
        const { isSuccess } = await verifyCode(data.inviteCode);

        if (isSuccess) {
          setStep(2);
          form.clearErrors();
        } else {
          setError('Invalid invite code');
        }
      } else {
        setIsSubmitting(true);
        setError(null);
        try {
          // await new Promise((resolve) => setTimeout(resolve, 2000));
          const { isSuccess } = await reserve({
            code: data.inviteCode,
            email: data.email,
            wallet: data.walletAddress,
            signature: '',
          });
          if (!isSuccess) {
            throw new Error('Failed to reserve');
          }

          setSuccess(true);
        } catch (err) {
          setError('An error occurred while submitting the form');
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [step, verifyCode, reserve]
  );

  const onConnectWallet = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    openModal();
    form.setFocus('email');
  }, [openModal, form]);

  useEffect(() => {
    if (isConnected && address) {
      form.setValue('walletAddress', address);

      // validate
      form.trigger('walletAddress');
    } else {
      form.setValue('walletAddress', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return {
    form,
    isSubmitting,
    error,
    success,
    onSubmit,
    onConnectWallet,
  };
}
