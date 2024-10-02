import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  FormMessage,
  Button,
} from '@mocaverse/ui';
import { useFormContext } from 'react-hook-form';
import { useConnectWallet } from '@mocaverse/feature-home-hooks';

export function WalletAndEmailStep({
  onConnectWallet,
}: {
  onConnectWallet: () => void;
}) {
  const { isConnected, disconnect } = useConnectWallet();
  const { control } = useFormContext();
  return (
    <>
      <div>
        <FormField
          control={control}
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
                    disabled={isConnected}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              if (isConnected) {
                disconnect();
              } else {
                onConnectWallet();
              }
            }}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>
      <FormField
        control={control}
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
  );
}
