"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import type { PerformanceMetrics } from '../../types';

interface ConversionFunnelChartProps {
  metrics: PerformanceMetrics;
}

export function ConversionFunnelChart({ metrics }: ConversionFunnelChartProps) {
  const funnelData = [
    { 
      stage: 'Impressões', 
      value: metrics.totalImpressions,
      rate: 100,
      color: 'hsl(var(--chart-1))',
    },
    { 
      stage: 'Cliques', 
      value: metrics.totalClicks,
      rate: metrics.ctr,
      color: 'hsl(var(--chart-2))',
    },
    { 
      stage: 'Signups', 
      value: metrics.totalSignups,
      rate: metrics.signupRate,
      color: 'hsl(var(--chart-3))',
    },
    { 
      stage: 'Ativações', 
      value: metrics.totalActivations,
      rate: metrics.activationRate,
      color: 'hsl(var(--chart-4))',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>Jornada do usuário com taxas de conversão</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={funnelData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="stage"
              className="text-xs"
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number, name: string, props: any) => {
                const { stage, rate } = props.payload;
                return [
                  `${value.toLocaleString('pt-BR')} (${rate.toFixed(2)}%)`,
                  stage
                ];
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 8, 8, 0]}
            >
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Taxa de conversão total */}
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Taxa de Conversão Total</div>
          <div className="text-lg font-bold">
            {((metrics.totalActivations / metrics.totalImpressions) * 100).toFixed(4)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            De impressões para ativações
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

