import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "@/api/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const groupSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Group name must be at least 3 characters" }),
  chitValue: z.coerce
    .number()
    .min(1000, { message: "Chit value must be at least 1000" }),
  totalMembers: z.coerce
    .number()
    .min(2, { message: "Must have at least 2 members" }),
  durationMonths: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 month" }),
  startDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Start date must be in the future",
  }),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GroupCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      chitValue: 0,
      totalMembers: 0,
      durationMonths: 0,
      startDate: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group created successfully");
      navigate("/groups");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create group");
      setIsLoading(false);
    },
  });

  function onSubmit(values: GroupFormValues) {
    setIsLoading(true);
    console.log(values);
    
    mutation.mutate({ ...values, startDate: new Date(values.startDate + "T00:00:00Z").toISOString()});
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Gold Chit 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chitValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chit Value (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Members</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
