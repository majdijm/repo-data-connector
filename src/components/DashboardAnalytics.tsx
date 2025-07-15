
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

const DashboardAnalytics = () => {
  const { stats, recentJobs } = useSupabaseData();

  // Real job status data from actual stats
  const jobStatusData = [
    { name: 'Pending', value: stats.pendingJobs, color: '#f59e0b' },
    { name: 'In Progress', value: stats.totalJobs - stats.pendingJobs - stats.completedJobs, color: '#3b82f6' },
    { name: 'Completed', value: stats.completedJobs, color: '#10b981' }
  ].filter(item => item.value > 0); // Only show categories with data

  // Real job type data from recent jobs
  const jobTypeData = recentJobs.reduce((acc, job) => {
    const type = job.type.replace('_', ' ');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobTypeChartData = Object.entries(jobTypeData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));

  // Only show analytics if there's actual data
  if (stats.totalJobs === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">Analytics will appear once you have jobs and data in your system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics - Real Data Only */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From completed projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs - stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Jobs completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Jobs awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Temporary Chart Placeholders */}
        {jobStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Job Status Distribution</CardTitle>
              <CardDescription>Current job status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Types Distribution */}
        {jobTypeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Job Types Distribution</CardTitle>
              <CardDescription>Projects by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobTypeChartData.map((item, index) => {
                  const maxCount = jobTypeChartData.reduce((max, d) => Math.max(max, Number(d.count) || 0), 1);
                  const percentage = (Number(item.count) / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-full bg-purple-500 rounded" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-sm">{Number(item.count)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardAnalytics;
