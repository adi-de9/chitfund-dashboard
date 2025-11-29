import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getCycle } from "@/api/cycles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Gavel, IndianRupee, Calendar } from "lucide-react";

export default function CycleSummary() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const {
    data: cycle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cycle", cycleId],
    queryFn: () => getCycle(cycleId!),
    enabled: !!cycleId,
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (isError || !cycle) {
    return <div>Error loading cycle details</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cycle #{cycle.cycleNumber}
          </h1>
          <p className="text-muted-foreground">
            Month: {cycle.month} • Status:{" "}
            <Badge variant="outline">{cycle.status}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/cycle/${cycleId}/contributions`}>
              <IndianRupee className="mr-2 h-4 w-4" /> Contributions
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/cycle/${cycleId}/auction`}>
              <Gavel className="mr-2 h-4 w-4" /> Go to Auction
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Winning Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cycle.winningBid
                ? `₹ ${cycle.winningBid.toLocaleString()}`
                : "Not Auctioned"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Dividend per Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cycle.dividendAmount
                ? `₹ ${cycle.dividendAmount.toLocaleString()}`
                : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cycle.payableAmount
                ? `₹ ${cycle.payableAmount.toLocaleString()}`
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Auction Date</span>
            <span>
              {cycle.auctionDate
                ? new Date(cycle.auctionDate).toLocaleDateString()
                : "Not Scheduled"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Payment Due Date</span>
            <span>
              {cycle.dueDate
                ? new Date(cycle.dueDate).toLocaleDateString()
                : "Not Set"}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-medium">Winner</span>
            <span>
              {cycle.winnerId
                ? `Member ID: ${cycle.winnerId}`
                : "No Winner Yet"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
