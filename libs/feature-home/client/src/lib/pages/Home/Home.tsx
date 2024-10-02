'use client';

import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useReservationForm } from '../../hooks/useReservationForm';
import { AlertMessage } from './components/AlertMessage';
import { InviteCodeStep } from './components/InviteCodeStep';
import { ReservationCard } from './components/ReservationCard';
import { WalletAndEmailStep } from './components/WalletAndEmailStep';

export function Page() {
  const [step, setStep] = useState(1);
  const { form, isSubmitting, error, success, onSubmit, onConnectWallet } =
    useReservationForm(step, setStep);

  return (
    <FormProvider {...form}>
      <div className="h-screen container mt-4">
        <ReservationCard
          step={step}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          success={success}
        >
          {step === 1 && <InviteCodeStep />}
          {step === 2 && (
            <WalletAndEmailStep onConnectWallet={onConnectWallet} />
          )}
          <AlertMessage error={error} success={success} />
        </ReservationCard>
      </div>
    </FormProvider>
  );
}
