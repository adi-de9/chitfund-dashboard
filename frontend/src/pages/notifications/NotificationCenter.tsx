import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, sendNotification, SendNotificationData } from '@/api/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const notificationSchema = z.object({
  userIds: z.string().min(1, { message: 'Enter at least one User ID' }), // Comma separated for simplicity
  type: z.enum(['EMAIL', 'SMS', 'WHATSAPP']),
  message: z.string().min(5, { message: 'Message must be at least 5 characters' }),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationCenter() {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      userIds: '',
      type: 'EMAIL',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: NotificationFormValues) => {
      const userIdsArray = values.userIds.split(',').map(id => id.trim());
      return sendNotification({ ...values, userIds: userIdsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
      form.reset();
      setIsSending(false);
    },
    onError: () => {
      toast.error('Failed to send notification');
      setIsSending(false);
    },
  });

  function onSubmit(values: NotificationFormValues) {
    setIsSending(true);
    mutation.mutate(values);
  }

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (isError) {
    return <div>Error loading notifications</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notification Center</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User IDs (Comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="user1, user2, user3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your message here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSending}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? 'Sending...' : 'Send Notification'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications?.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge variant="outline">{notification.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={notification.message}>
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.status === 'SENT' ? 'default' : 'destructive'}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(notification.sentAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {notifications?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No notifications sent yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
