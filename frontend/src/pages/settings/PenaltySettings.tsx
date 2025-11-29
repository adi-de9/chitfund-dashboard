import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPenaltyRules,
  updatePenaltyRules,
  PenaltyRule,
} from "@/api/penalties";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const settingsSchema = z.object({
  penaltyType: z.enum(["FIXED", "DAILY", "PERCENTAGE"]),
  amount: z.coerce.number().min(0),
  gracePeriodDays: z.coerce.number().min(0),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function PenaltySettings() {
  const { groupId } = useParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: rules } = useQuery({
    queryKey: ["penaltyRules", groupId],
    queryFn: () => getPenaltyRules(groupId!),
    enabled: !!groupId,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      penaltyType: "FIXED",
      amount: 0,
      gracePeriodDays: 3,
    },
  });

  useEffect(() => {
    if (rules) {
      form.reset({
        penaltyType: rules.penaltyType,
        amount: rules.amount,
        gracePeriodDays: rules.gracePeriodDays,
      });
    }
  }, [rules, form]);

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      updatePenaltyRules(groupId!, { ...values, groupId: groupId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penaltyRules", groupId] });
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
      setIsLoading(false);
    },
  });

  function onSubmit(values: SettingsFormValues) {
    setIsLoading(true);
    mutation.mutate(values);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Penalty Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="penaltyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="DAILY">Daily Amount</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gracePeriodDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grace Period (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
