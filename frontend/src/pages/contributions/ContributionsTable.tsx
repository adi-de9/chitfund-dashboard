import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getCycleContributions } from "@/api/contributions";
import type { Contribution } from "@/api/contributions";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import { IndianRupee, History, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentModal from "./PaymentModal";

export default function ContributionsTable() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const {
    data: contributions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contributions", cycleId],
    queryFn: () => getCycleContributions(cycleId!),
    enabled: !!cycleId,
  });

  const handlePayClick = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-semibold">Error loading contributions</p>
          <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Contributions
          </h1>
          <p className="text-muted-foreground mt-1">Cycle ID: {cycleId}</p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Member</TableHead>
              <TableHead className="font-semibold">Payable</TableHead>
              <TableHead className="font-semibold">Paid</TableHead>
              <TableHead className="font-semibold">Balance</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions?.map((contribution, index) => {
              const balance = contribution.amountPayable - contribution.amountPaid;
              return (
                <TableRow 
                  key={contribution.id}
                  className="hover:bg-accent/50 transition-colors border-b border-border/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {contribution.memberName.charAt(0)}
                        </span>
                      </div>
                      {contribution.memberName}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{contribution.amountPayable.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      contribution.amountPaid > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}>
                      ₹{contribution.amountPaid.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      balance > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    )}>
                      ₹{balance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        contribution.status === "PAID"
                          ? "default"
                          : contribution.status === "OVERDUE"
                          ? "destructive"
                          : "secondary"
                      }
                      className={cn(
                        "font-semibold shadow-sm flex items-center gap-1 w-fit",
                        contribution.status === "PAID" && "gradient-success border-0 text-primary-foreground",
                        contribution.status === "OVERDUE" && "gradient-danger"
                      )}
                    >
                      {getStatusIcon(contribution.status)}
                      {contribution.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {contribution.status !== "PAID" && (
                        <Button
                          size="sm"
                          onClick={() => handlePayClick(contribution)}
                          className="hover-lift shadow-sm"
                        >
                          <IndianRupee className="mr-1 h-3 w-3" /> Pay
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="hover-lift">
                        <History className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {contributions?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="font-semibold">No contributions found</p>
                    <p className="text-sm mt-1">No contributions for this cycle yet</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <PaymentModal
        contribution={selectedContribution}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}

