import { useState } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuction, getBids, placeBid, endAuction } from "@/api/auctions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Gavel, TrendingUp, Trophy, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuctionInterface() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [memberId, setMemberId] = useState<string>(""); // In real app, select from dropdown

  // Polling for real-time updates (simplified)
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", cycleId],
    queryFn: () => getAuction(cycleId!),
    refetchInterval: 2000,
  });

  const { data: bids } = useQuery({
    queryKey: ["bids", auction?.id],
    queryFn: () => getBids(auction!.id),
    enabled: !!auction?.id,
    refetchInterval: 2000,
  });

  const bidMutation = useMutation({
    mutationFn: () => placeBid(auction!.id, memberId, bidAmount),
    onSuccess: () => {
      toast.success("Bid placed successfully");
      setBidAmount(0);
      queryClient.invalidateQueries({ queryKey: ["bids"] });
    },
    onError: () => toast.error("Failed to place bid"),
  });

  const endAuctionMutation = useMutation({
    mutationFn: () => endAuction(auction!.id),
    onSuccess: () => {
      toast.success("Auction ended successfully");
      queryClient.invalidateQueries({ queryKey: ["auction"] });
    },
  });

  if (isLoading || !auction) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const isLive = auction.status === "LIVE";

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Gavel className="h-8 w-8 text-primary" />
            Live Auction
          </h1>
          <p className="text-muted-foreground mt-1">Real-time bidding interface</p>
        </div>
        <Badge
          className={cn(
            "text-lg px-4 py-2 font-semibold shadow-lg flex items-center gap-2",
            isLive ? "gradient-danger animate-pulse" : "gradient-success"
          )}
        >
          {isLive && <Zap className="h-4 w-4 animate-pulse" />}
          {auction.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bidding Card */}
        <Card className="hover-lift border-border/50 relative overflow-hidden">
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1 transition-all",
            isLive && "gradient-primary animate-pulse"
          )} />
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Place Bid
            </CardTitle>
            <CardDescription>Submit your competitive bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 relative overflow-hidden">
              {isLive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse-slow" />
              )}
              <div className="relative z-10">
                <p className="text-sm text-muted-foreground mb-2">Current Highest Bid</p>
                <p className="text-5xl font-bold text-primary flex items-center justify-center gap-2">
                  ₹{auction.currentBid || 0}
                  {isLive && <TrendingUp className="h-8 w-8 text-green-600 animate-bounce" />}
                </p>
              </div>
            </div>

            {isLive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Member ID</label>
                    <Input
                      placeholder="Enter ID"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="bg-background/50 border-border/50 focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Bid Amount</label>
                    <Input
                      type="number"
                      placeholder="₹ Amount"
                      value={bidAmount || ""}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="bg-background/50 border-border/50 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
                <Button
                  className="w-full gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover-lift h-11"
                  onClick={() => bidMutation.mutate()}
                  disabled={bidMutation.isPending || !bidAmount || !memberId}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Place Bid
                </Button>
                <Button
                  variant="destructive"
                  className="w-full font-semibold shadow-md hover-lift h-11"
                  onClick={() => endAuctionMutation.mutate()}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  End Auction
                </Button>
              </div>
            ) : (
              <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500/50">
                <Trophy className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="font-bold text-lg text-green-700 dark:text-green-400">Auction Completed!</p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">Winner: Member {auction.winnerId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid History */}
        <Card className="hover-lift border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Bid History
            </CardTitle>
            <CardDescription>Latest bids in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Member</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids?.map((bid, index) => (
                    <TableRow 
                      key={bid.id}
                      className={cn(
                        "hover:bg-accent/50 transition-colors",
                        index === 0 && "bg-primary/5"
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="h-4 w-4 text-yellow-600" />}
                          {bid.memberName}
                        </div>
                      </TableCell>
                      <TableCell className={cn(
                        "font-bold",
                        index === 0 ? "text-primary text-lg" : ""
                      )}>
                        ₹{bid.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!bids || bids?.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Gavel className="h-10 w-10 mb-2 opacity-40" />
                          <p className="font-semibold">No bids yet</p>
                          <p className="text-sm mt-1">Be the first to place a bid!</p>
                        </div>
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

