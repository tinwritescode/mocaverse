import { Alert, AlertTitle, AlertDescription } from '@mocaverse/ui';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function AlertMessage({
  error,
  success,
}: {
  error: string | null;
  success: boolean;
}) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your reservation has been submitted successfully!
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
