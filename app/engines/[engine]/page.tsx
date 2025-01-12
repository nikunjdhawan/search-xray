'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Activity, Timer, ArrowLeft, Search, CheckCircle2, Clock } from 'lucide-react';

interface EngineDetail {
  engine: string;
  totalSearches: number;
  completedSearches: number;
  averageResponseTime: number;
  successRate: number;
  mainSearches: number;
  nearbySearches: number;
  alternateSearches: number;
  hourlyStats: {
    hour: number;
    searches: number;
    successRate: number;
    avgResponseTime: number;
  }[];
  recentSearches: {
    id: string;
    timestamp: string;
    type: string;
    status: string;
    responseTime: number | null;
  }[];
}

export default function EngineDashboard({ params }: { params: { engine: string } }) {
  const [engineDetail, setEngineDetail] = useState<EngineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const engineName = decodeURIComponent(params.engine);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/engine-stats/${engineName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEngineDetail(data);
      } catch (error) {
        console.error('Error fetching engine details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [engineName]);

  if (isLoading || !engineDetail) {
    return <div className="min-h-screen bg-background p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Overview</span>
          </button>
          <h1 className="text-4xl font-bold text-foreground">{engineDetail.engine}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground ml-auto">
            <Activity className="h-5 w-5" />
            <span>Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium">Total Searches</h3>
            </div>
            <p className="text-2xl font-bold">{engineDetail.totalSearches}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-sm font-medium">Success Rate</h3>
            </div>
            <Progress value={engineDetail.successRate} className="h-2 mb-2" />
            <p className="text-2xl font-bold">{engineDetail.successRate.toFixed(1)}%</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium">Avg Response Time</h3>
            </div>
            <p className="text-2xl font-bold">{engineDetail.averageResponseTime.toFixed(2)}s</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium">Search Types</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Main</div>
                <div className="font-bold">{engineDetail.mainSearches}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Nearby</div>
                <div className="font-bold">{engineDetail.nearbySearches}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Alt</div>
                <div className="font-bold">{engineDetail.alternateSearches}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">24-Hour Performance</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={engineDetail.hourlyStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value: number, name: string) => [
                      value.toFixed(2),
                      name === 'searches' ? 'Searches' : name === 'successRate' ? 'Success Rate (%)' : 'Avg Response Time (s)'
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="searches"
                    name="Searches"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineDetail.recentSearches.map((search) => (
                    <TableRow key={search.id}>
                      <TableCell>{format(new Date(search.timestamp), 'HH:mm:ss')}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          search.type === 'Main'
                            ? 'bg-blue-100 text-blue-800'
                            : search.type === 'Nearby'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {search.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          search.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {search.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {search.responseTime ? `${search.responseTime.toFixed(2)}s` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}