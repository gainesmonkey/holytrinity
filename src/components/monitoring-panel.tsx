"use client"

import { useState, useEffect } from 'react';
import { Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Cpu, MemoryStick, Database, ShieldCheck } from 'lucide-react';

const generateData = () => Array.from({ length: 10 }, (_, i) => ({
  time: i.toString(),
  value: Math.floor(Math.random() * 50) + 20,
}));

const chartConfig = {
  value: {
    label: "Usage",
    color: "hsl(var(--primary))",
  },
};

const StatusItem = ({ title, value, variant }: { title: string; value: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Badge variant={variant}>
            {value}
        </Badge>
    </div>
);

export function MonitoringPanel() {
  const [cpuData, setCpuData] = useState(generateData());
  const [memoryData, setMemoryData] = useState(generateData());
  const [storageData, setStorageData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = () => Math.floor(Math.random() * 50) + 20;
      setCpuData(prev => [...prev.slice(1), { time: 'now', value: newValue() }]);
      setMemoryData(prev => [...prev.slice(1), { time: 'now', value: Math.floor(Math.random() * 40) + 40 }]);
      setStorageData(prev => [...prev.slice(1), { time: 'now', value: Math.floor(Math.random() * 10) + 75 }]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const renderChart = (data: any[], gradientId: string) => (
    <div className="h-[100px] -mx-4">
      <ChartContainer config={chartConfig}>
        <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>System Status</span>
            </CardTitle>
            <CardDescription>Live metrics and deployment status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
            <StatusItem title="Deployment" value="Stable" variant="secondary" />
            <StatusItem title="Last Backup" value="Just now" variant="secondary" />
            <StatusItem title="Version" value="v1.2.3" variant="outline" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Cpu className="w-5 h-5 text-muted-foreground" /> CPU Usage
          </CardTitle>
          <span className="text-2xl font-bold font-mono">{cpuData.length > 0 ? `${cpuData[cpuData.length - 1].value}%` : '...'}</span>
        </CardHeader>
        <CardContent>{renderChart(cpuData, 'fillCpu')}</CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <MemoryStick className="w-5 h-5 text-muted-foreground" /> Memory
          </CardTitle>
           <span className="text-2xl font-bold font-mono">{memoryData.length > 0 ? `${memoryData[memoryData.length - 1].value}%` : '...'}</span>
        </CardHeader>
        <CardContent>{renderChart(memoryData, 'fillMemory')}</CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Database className="w-5 h-5 text-muted-foreground" /> Storage
          </CardTitle>
           <span className="text-2xl font-bold font-mono">{storageData.length > 0 ? `${storageData[storageData.length - 1].value}%` : '...'}</span>
        </CardHeader>
        <CardContent>{renderChart(storageData, 'fillStorage')}</CardContent>
      </Card>
    </div>
  );
}
