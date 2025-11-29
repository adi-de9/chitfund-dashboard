import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { getGroupMembers, deleteMember } from '@/api/members';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AddMemberModal from './AddMemberModal';

interface MembersListProps {
  groupId: string;
}

export default function MembersList({ groupId }: MembersListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: members, isLoading, isError } = useQuery({
    queryKey: ['members', groupId],
    queryFn: () => getGroupMembers(groupId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      toast.success('Member removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    },
  });


  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError) {
    return <div>Error loading members</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Group Members</h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.length > 0 ? members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.user.name}</TableCell>
                <TableCell>{member.user.phone}</TableCell>
                <TableCell>{new Date(member.join_date).toLocaleDateString("en-GB")}</TableCell>
                <TableCell>
                  <Badge variant={member.user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {member.user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/groups/${groupId}/members/${member.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this member?')) {
                            deleteMutation.mutate(member.id);
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )):<TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No members found. Add one to get started.
              </TableCell>
            </TableRow>}
  
          </TableBody>
        </Table>
      </div>

      <AddMemberModal
        groupId={groupId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
