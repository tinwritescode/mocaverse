import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  FormDescription,
  FormMessage,
} from '@mocaverse/ui';
import { useFormContext } from 'react-hook-form';

export function InviteCodeStep() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
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
  );
}
