import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { Eye, PlayCircle } from "lucide-react";
import { getGroupCycles, createNextCycle } from "@/api/cycles";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";

interface CyclesListProps {
  groupId: string;
}

export default function CyclesList({ groupId }: CyclesListProps) {
  const queryClient = useQueryClient();
  const {
    data: cycles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cycles", groupId],
    queryFn: () => getGroupCycles(groupId),
  });

  const createMutation = useMutation({
    mutationFn: () => createNextCycle(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles", groupId] });
      toast.success("Next cycle created successfully");
    },
    onError: () => {
      toast.error("Failed to create next cycle");
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError) {
    return <div>Error loading cycles</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cycles History</h3>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          <PlayCircle className="mr-2 h-4 w-4" /> Create Next Cycle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cycle #</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead>Winning Bid</TableHead>
              <TableHead>Dividend</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles?.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell className="font-medium">
                  {cycle.cycleNumber}
                </TableCell>
                <TableCell>{cycle.month}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      cycle.status === "COMPLETED" ? "secondary" : "default"
                    }
                  >
                    {cycle.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {cycle.winnerId ? "Member " + cycle.winnerId : "-"}
                </TableCell>
                <TableCell>
                  {cycle.winningBid ? `₹ ${cycle.winningBid}` : "-"}
                </TableCell>
                <TableCell>
                  {cycle.dividendAmount ? `₹ ${cycle.dividendAmount}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/cycle/${cycle.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {cycles?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No cycles found. Start the first cycle!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
