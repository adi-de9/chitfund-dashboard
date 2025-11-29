import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordPayment, type Contribution } from '../../api/contributions';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, { message: 'Amount must be greater than 0' }),
  paymentMode: z.string().min(1, { message: 'Select a payment mode' }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  contribution: Contribution | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ contribution, isOpen, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as unknown as Resolver<PaymentFormValues>,
    defaultValues: {
      amount: 0,
      paymentMode: 'CASH',
      transactionId: '',
      notes: '',
    },
  });

  // Update default amount when contribution changes
  if (contribution && form.getValues('amount') === 0) {
    const remaining = contribution.amountPayable - contribution.amountPaid;
    form.setValue('amount', remaining);
  }

  const mutation = useMutation({
    mutationFn: (values: PaymentFormValues) => recordPayment(contribution!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      toast.success('Payment recorded successfully');
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
      setIsLoading(false);
    },
  });

  function onSubmit(values: PaymentFormValues) {
    if (!contribution) return;
    setIsLoading(true);
    mutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {contribution?.memberName}.
            <br />
            Remaining Balance: ₹ {(contribution?.amountPayable || 0) - (contribution?.amountPaid || 0)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="UPI Ref / Cheque No" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
