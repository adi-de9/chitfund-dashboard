import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getGroup } from '@/api/groups';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import MembersList from '../members/MembersList';

import CyclesList from '../cycles/CyclesList';

// Placeholder components for tabs
const AuctionsTab = () => <div>Auctions List (Coming Soon)</div>;

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (isError || !group) {
    return <div>Error loading group details</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">
            ID: {group.id} • Started: {new Date(group.startDate).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
          {group.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chit Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {group.chitValue?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Installment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {group.installmentAmount?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.durationMonths} Months</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full bg-background">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4 px-4">
          <MembersList groupId={id!} />
        </TabsContent>
        <TabsContent value="cycles" className="mt-4 px-4">
          <CyclesList groupId={id!} />
        </TabsContent>
        <TabsContent value="auctions" className="mt-4 px-4">
          <AuctionsTab />
        </TabsContent>
        <TabsContent value="summary" className="mt-4 px-4">
          <Card>
            <CardContent className="pt-6">
              <p>Additional summary details can go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
