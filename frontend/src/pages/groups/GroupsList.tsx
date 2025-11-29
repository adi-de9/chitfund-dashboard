import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Plus, MoreHorizontal, Eye, Edit, TrendingUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { getGroups } from "@/api/groups";
import { cn } from "@/lib/utils";

import { deleteGroup } from "@/api/groups"; // Added deleteGroup
import { toast } from "sonner"; // Added toast
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Added useMutation, useQueryClient

export default function GroupsList() {
  const queryClient = useQueryClient();
  
  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete group");
    },
  });

  // const handleDelete = (id: string) => {
  //   if (confirm("Are you sure you want to delete this group?")) {
  //     deleteMutation.mutate(id);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Card className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-semibold">Error loading groups</p>
          <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Groups
          </h1>
          <p className="text-muted-foreground mt-1">Manage your chit fund groups</p>
        </div>
        <Button asChild className="hover-lift shadow-md">
          <Link to="/groups/create">
            <Plus className="mr-2 h-4 w-4" /> Create Group
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Chit Value</TableHead>
              <TableHead className="font-semibold">Installment</TableHead>
              <TableHead className="font-semibold">Members</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups?.map((group, index) => (
              <TableRow 
                key={group.id}
                className="hover:bg-accent/50 transition-colors cursor-pointer group border-b border-border/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse-slow" />
                    {group.name}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  ₹{group.chitValue?.toLocaleString()}
                </TableCell>
                <TableCell>₹{group.installmentAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-medium">{group.totalMembers}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {group.durationMonths} Months
                </TableCell>
                <TableCell>
                  <Badge
                    variant={group.status === "ACTIVE" ? "default" : "secondary"}
                    className={cn(
                      "font-semibold shadow-sm",
                      group.status === "ACTIVE" && "gradient-primary border-0 text-primary-foreground"
                    )}
                  >
                    {group.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100 transition-opacity hover-lift"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to={`/groups/${group.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/groups/${group.id}/edit`} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit Group
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Group
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {groups?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="font-semibold">No groups found</p>
                    <p className="text-sm mt-1">Create your first group to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

