'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@mocaverse/ui';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useConnectWallet } from '../../../hooks/src/lib/useConnectWallet';

// Define the schema for each step
const inviteCodeSchema = z.object({
  inviteCode: z.string().min(6, 'Invite code must be at least 6 characters'),
});

const walletAndEmailSchema = z.object({
  walletAddress: z.string().min(42, 'Invalid wallet address'),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof inviteCodeSchema> &
  z.infer<typeof walletAndEmailSchema>;

export function Home() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(step === 1 ? inviteCodeSchema : walletAndEmailSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    if (step === 1) {
      // Validate invite code (you would typically do this on the server)
      if (data.inviteCode === '123456') {
        setStep(2);
      } else {
        setError('Invalid invite code');
      }
    } else {
      setIsSubmitting(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('Form submitted:', data);
        setSuccess(true);
      } catch (err) {
        setError('An error occurred while submitting the form');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const { openModal, isConnected, isConnecting, address } = useConnectWallet();

  const onConnectWallet = async () => {
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    openModal();

    // focus on email input
    form.setFocus('email');
  };

  useEffect(() => {
    if (isConnected && address) {
      form.setValue('walletAddress', address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Reservation Form</CardTitle>
          <CardDescription>Step {step} of 2</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter invite code" {...field} />
                      </FormControl>
                      <FormDescription>
                        Please enter your invite code to proceed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Connect wallet"
                              {...field}
                              readOnly
                            />
                            <Button type="button" onClick={onConnectWallet}>
                              Connect
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your reservation has been submitted successfully!
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || success}
            loading={isConnecting}
          >
            {isSubmitting ? 'Submitting...' : step === 1 ? 'Next' : 'Submit'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
