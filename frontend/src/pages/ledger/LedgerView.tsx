import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLedger, exportLedger } from '@/api/ledger';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function LedgerView() {
  const [groupId, setGroupId] = useState('');
  
  const { data: ledger, isLoading, isError } = useQuery({
    queryKey: ['ledger', groupId],
    queryFn: () => getLedger(groupId || undefined),
  });
console.log(ledger);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await exportLedger(groupId || undefined, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Ledger exported successfully');
    } catch (error) {
      toast.error('Failed to export ledger');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (isError) {
    return <div>Error loading ledger</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ledger</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by Group ID" 
            className="pl-8" 
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <span className={entry.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                    {entry.type}
                  </span>
                </TableCell>
                <TableCell className="text-right">₹ {entry.amount?.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">₹ {entry.balance?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {ledger?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
