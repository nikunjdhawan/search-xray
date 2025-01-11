'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import {
  Activity,
  Search,
  CheckCircle2,
  Clock,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface SearchLog {
  _id: string;
  SearchId: string;
  CreatedAt: string;
  CompletedAt: string;
  LastAccessed: string;
  CompletedEngines: number;
  TotalEngines: number;
  Status: 'Completed' | 'In Progress';
}

interface DashboardStats {
  totalSearches: number;
  completedSearches: number;
  averageCompletionTime: number;
  completionRate: number;
}

export default function Dashboard() {
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSearches: 0,
    completedSearches: 0,
    averageCompletionTime: 0,
    completionRate: 0,
  });
  const router = useRouter();

  const fetchData = async () => {
    try {
      // Fetch search logs
      const logsResponse = await fetch('/api/search-logs');
      if (!logsResponse.ok) {
        throw new Error(`HTTP error! status: ${logsResponse.status}`);
      }
      const logsData = await logsResponse.json();
      setSearchLogs(logsData);

      // Fetch stats
      const statsResponse = await fetch('/api/stats');
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = searchLogs.map((log) => ({
    searchId: log.SearchId.slice(0, 8),
    completionTime:
      (new Date(log.CompletedAt).getTime() -
        new Date(log.CreatedAt).getTime()) /
      1000,
  }));

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">
            Search Logs Dashboard
          </h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
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
            <p className="text-2xl font-bold">{stats.totalSearches}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-sm font-medium">Completed Searches</h3>
            </div>
            <p className="text-2xl font-bold">{stats.completedSearches}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium">Avg. Completion Time</h3>
            </div>
            <p className="text-2xl font-bold">
              {stats.averageCompletionTime.toFixed(2)}s
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium">Completion Rate</h3>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
            <p className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Search Completion Times</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 50, right: 20, bottom: 40, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="searchId"
                  label={{ value: 'Search ID', position: 'bottom', offset: 20 }}
                />
                <YAxis
                  label={{
                    value: 'Completion Time (s)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -40
                  }}
                />
                <Tooltip />
                <Bar
                  dataKey="completionTime"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Search ID</th>
                  <th className="text-left p-2">Created At</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Progress</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchLogs.slice(0, 5).map((log) => (
                  <tr key={log._id} className="border-b">
                    <td className="p-2 font-mono text-sm">
                      {log.SearchId.slice(0, 8)}...
                    </td>
                    <td className="p-2">
                      {format(new Date(log.CreatedAt), 'PPp')}
                    </td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.Status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {log.Status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={(log.CompletedEngines / log.TotalEngines) * 100}
                          className="h-2 w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          {log.CompletedEngines}/{log.TotalEngines}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => router.push(`/search/${log.SearchId}`)}
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}