'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

interface EngineDetail {
  _id: string;
  FASId: string;
  CreatedAt: string;
  LastAccessed: string;
  Message: string;
  Meta: {
    IsMini: boolean;
    IsMain: boolean;
    Engine: string;
    SearchType: string;
    Supplier: string;
  };
  SearchId: string;
  Status: string;
  CompletedAt: string;
  Results: string;
}

export default function SearchDetails({ params }: { params: { id: string } }) {
  const [engineDetails, setEngineDetails] = useState<EngineDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEngineDetails = async () => {
      try {
        const response = await fetch(`/api/search-engines/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEngineDetails(data);
      } catch (error) {
        console.error('Error fetching engine details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngineDetails();
  }, [params.id]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold">
            Search {params.id.slice(0, 8)}...
          </h1>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[120px]">Engine</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[180px]">Created</TableHead>
                  <TableHead className="w-[180px]">Completed</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engineDetails.map((detail) => (
                  <TableRow key={detail._id} className="h-12">
                    <TableCell className="py-2">
                      <span className="font-medium">{detail.Meta.Engine}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                          detail.Status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {detail.Status}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {format(new Date(detail.CreatedAt), 'PP p')}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {detail.CompletedAt
                        ? format(new Date(detail.CompletedAt), 'PP p')
                        : '-'}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-xs">
                        <span className="inline-flex items-center space-x-1">
                          <span className={detail.Meta.IsMini ? 'text-blue-600' : 'text-gray-600'}>Mini</span>
                          <span className="text-muted-foreground">/</span>
                          <span className={detail.Meta.IsMain ? 'text-purple-600' : 'text-gray-600'}>Main</span>
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {detail.Meta.SearchType} - {detail.Meta.Supplier}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}