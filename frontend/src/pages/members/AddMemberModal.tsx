import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMember } from '@/api/members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const memberSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  phone: z.string().min(10, { message: 'Phone must be at least 10 digits' }),
  email: z.string().email().optional().or(z.literal('')),
  nomineeName: z.string().optional(),
  nomineePhone: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface AddMemberModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ groupId, isOpen, onClose }: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      nomineeName: '',
      nomineePhone: '',
    },
  }); 

  const mutation = useMutation({
    mutationFn: (values: MemberFormValues) => addMember({ ...values, groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      toast.success('Member added successfully');
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add member');
      setIsLoading(false);
    },
  });

  function onSubmit(values: MemberFormValues) {
    setIsLoading(true);
    mutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Add a new member to this chit group.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
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
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="nomineeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nominee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="nomineePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominee Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Nominee Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
