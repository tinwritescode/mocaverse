'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  useToast,
} from '@mocaverse/ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ReservePage() {
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isWalletValid, setIsWalletValid] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      // Redirect to home if no code is provided
      navigate('/');
    }
  }, [code, navigate]);

  const validateEmail = async () => {
    if (!email) return false;
    try {
      const response = await fetch(`/api/isEmailUsed?email=${email}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating email:', error);
      return false;
    }
  };

  const validateWallet = async () => {
    if (!wallet) return false;
    try {
      const response = await fetch(`/api/isWalletUsed?wallet=${wallet}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating wallet:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true);

    const emailValid = await validateEmail();
    const walletValid = await validateWallet();

    setIsEmailValid(emailValid);
    setIsWalletValid(walletValid);

    if (!emailValid || !walletValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          email,
          wallet,
          signature: 'dummy-signature', // In a real app, this would be generated client-side
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your reservation has been submitted successfully!',
        });
      } else if (response.status === 400) {
        toast({
          title: 'Error',
          description:
            'Invalid reservation data. Please check your inputs and try again.',
          variant: 'destructive',
        });
      } else if (response.status === 429) {
        toast({
          title: 'Error',
          description: 'Too many requests. Please try again later.',
          variant: 'destructive',
        });
      } else {
        throw new Error('Unexpected error');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Reservation</CardTitle>
          <CardDescription>
            Connect your wallet and enter your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={!isEmailValid ? 'border-red-500' : ''}
                />
                {!isEmailValid && (
                  <p className="text-red-500 text-sm mt-1">
                    This email is already in use.
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Enter your wallet address"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  required
                  className={!isWalletValid ? 'border-red-500' : ''}
                />
                {!isWalletValid && (
                  <p className="text-red-500 text-sm mt-1">
                    This wallet address is already in use.
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Reservation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
