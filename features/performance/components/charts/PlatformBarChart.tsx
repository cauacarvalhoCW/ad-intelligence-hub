"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

interface PlatformBarChartProps {
  data: Array<{
    platform: string;
    cost: number;
  }>;
}

const PLATFORM_COLORS: Record<string, string> = {
  meta: 'hsl(var(--chart-1))',
  google: 'hsl(var(--chart-2))',
  tiktok: 'hsl(var(--chart-3))',
  unknown: 'hsl(var(--muted))',
};

export function PlatformBarChart({ data }: PlatformBarChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    platformLabel: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custo por Plataforma</CardTitle>
        <CardDescription>Distribuição de investimento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="platformLabel" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'R$', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Custo']}
            />
            <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PLATFORM_COLORS[entry.platform] || PLATFORM_COLORS.unknown} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

