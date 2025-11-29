import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGroupMembers, updateMember } from '@/api/members';
import { updateUser } from '@/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const memberSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  phone: z.string().min(10, { message: 'Phone must be at least 10 digits' }),
  email: z.string().email().optional().or(z.literal('')),
  nomineeName: z.string().optional(),
  nomineePhone: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MemberEdit() {
  const { groupId, memberId } = useParams<{ groupId: string; memberId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
  });

  const member = members?.find((m) => m.id === memberId);

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

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.user.name,
        phone: member.user.phone,
        email: member.user.email || '',
        nomineeName: member.nominee_name || '',
        nomineePhone: member.nominee_phone || '',
      });
    }
  }, [member, form]);

  const updateMemberMutation = useMutation({
    mutationFn: (data: any) => updateMember(memberId!, data),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => updateUser(member!.user.id, data),
  });

  async function onSubmit(values: MemberFormValues) {
    if (!member) return;
    setIsSubmitting(true);
    try {
      // Update User details
      await updateUserMutation.mutateAsync({
        name: values.name,
        phone: values.phone,
        email: values.email,
      });

      // Update Member details (Nominee)
      await updateMemberMutation.mutateAsync({
        nominee_name: values.nomineeName,
        nominee_phone: values.nomineePhone,
      });

      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      toast.success('Member details updated successfully');
      navigate(`/groups/${groupId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (!member) {
    return <div>Member not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/groups/${groupId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Nominee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nomineeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominee Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Nominee Name" {...field} />
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
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
