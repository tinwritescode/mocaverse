import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@mocaverse/ui';

export function ReservationCard({
  step,
  onSubmit,
  isSubmitting,
  success,
  children,
}: {
  step: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  success: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Reservation Form</CardTitle>
        <CardDescription>Step {step} of 2</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          {children}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting || success}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : step === 1 ? 'Next' : 'Submit'}
        </Button>
      </CardFooter>
    </Card>
  );
}
