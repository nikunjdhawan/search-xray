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
import { Activity, Timer, CheckCircle2, Search, ExternalLink } from 'lucide-react';

interface EngineStats {
  engine: string;
  totalSearches: number;
  completedSearches: number;
  averageResponseTime: number;
  successRate: number;
  mainSearches: number;
  nearbySearches: number;
  alternateSearches: number;
}

export default function EnginesDashboard() {
  const [stats, setStats] = useState<EngineStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/engine-stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching engine stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalSearches = stats.reduce((acc, curr) => acc + curr.totalSearches, 0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Engine Analytics</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Activity className="h-5 w-5" />
            <span>Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.slice(0, 3).map((engine) => (
            <Card key={engine.engine} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{engine.engine}</h3>
                  <p className="text-sm text-muted-foreground">
                    {((engine.totalSearches / totalSearches) * 100).toFixed(1)}% of
                    total traffic
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/engines/${encodeURIComponent(engine.engine)}`)}
                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium">{engine.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={engine.successRate} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Main</div>
                  <div className="text-lg font-semibold">{engine.mainSearches}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Nearby</div>
                  <div className="text-lg font-semibold">{engine.nearbySearches}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Alternate</div>
                  <div className="text-lg font-semibold">{engine.alternateSearches}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Engine Performance</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="engine" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="successRate"
                  name="Success Rate (%)"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageResponseTime"
                  name="Avg Response Time (s)"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Statistics</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engine</TableHead>
                  <TableHead className="text-right">Total Searches</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                  <TableHead className="text-right">Avg Response Time</TableHead>
                  <TableHead className="text-right">Main</TableHead>
                  <TableHead className="text-right">Nearby</TableHead>
                  <TableHead className="text-right">Alternate</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((engine) => (
                  <TableRow key={engine.engine}>
                    <TableCell className="font-medium">{engine.engine}</TableCell>
                    <TableCell className="text-right">{engine.totalSearches}</TableCell>
                    <TableCell className="text-right">
                      {engine.successRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {engine.averageResponseTime.toFixed(2)}s
                    </TableCell>
                    <TableCell className="text-right">{engine.mainSearches}</TableCell>
                    <TableCell className="text-right">{engine.nearbySearches}</TableCell>
                    <TableCell className="text-right">{engine.alternateSearches}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => router.push(`/engines/${encodeURIComponent(engine.engine)}`)}
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}