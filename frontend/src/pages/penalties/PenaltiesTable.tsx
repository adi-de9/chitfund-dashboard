import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getCyclePenalties } from "@/api/penalties";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PenaltiesTable() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const {
    data: penalties,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["penalties", cycleId],
    queryFn: () => getCyclePenalties(cycleId!),
    enabled: !!cycleId,
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (isError) {
    return <div>Error loading penalties</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Penalties</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {penalties?.map((penalty) => (
              <TableRow key={penalty.id}>
                <TableCell className="font-medium">
                  {penalty.memberName}
                </TableCell>
                <TableCell>₹ {penalty.amount}</TableCell>
                <TableCell>{penalty.reason}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      penalty.status === "PAID" ? "default" : "destructive"
                    }
                  >
                    {penalty.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {penalties?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No penalties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
