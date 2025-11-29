import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGroup, updateGroup } from "@/api/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date",
  }),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GroupEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id!),
    enabled: !!id,
  });

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema) as any,
    defaultValues: {
      name: "",
      chitValue: 0,
      totalMembers: 0,
      durationMonths: 0,
      startDate: "",
    },
  });

  // Reset form when group data is loaded
  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        chitValue: group.chitValue,
        totalMembers: group.totalMembers,
        durationMonths: group.durationMonths,
        startDate: new Date(group.startDate).toISOString().split("T")[0],
      });
    }
  }, [group, form]);

  const mutation = useMutation({
    mutationFn: (values: GroupFormValues) => updateGroup(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast.success("Group updated successfully");
      navigate("/groups");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update group");
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: GroupFormValues) {
    setIsSubmitting(true);
    mutation.mutate(values);
  }

  if (isLoadingGroup) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Group</CardTitle>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
