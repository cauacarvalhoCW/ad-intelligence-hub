"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

interface TimeSeriesChartProps {
  data: Array<{
    date: string;
    cost: number;
    impressions: number;
    clicks: number;
    signups: number;
    activations: number;
  }>;
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  // Formatar data para exibição (DD/MM)
  const formattedData = data.map(item => ({
    ...item,
    dateFormatted: new Date(item.date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Temporal</CardTitle>
        <CardDescription>Métricas ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="dateFormatted" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'R$ / Unidades', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Conversões', angle: 90, position: 'insideRight', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'cost') return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Custo'];
                if (name === 'impressions') return [value.toLocaleString('pt-BR'), 'Impressões'];
                if (name === 'clicks') return [value.toLocaleString('pt-BR'), 'Cliques'];
                if (name === 'signups') return [value.toLocaleString('pt-BR'), 'Signups'];
                if (name === 'activations') return [value.toLocaleString('pt-BR'), 'Ativações'];
                return [value, name];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                if (value === 'cost') return 'Custo';
                if (value === 'impressions') return 'Impressões';
                if (value === 'clicks') return 'Cliques';
                if (value === 'signups') return 'Signups';
                if (value === 'activations') return 'Ativações';
                return value;
              }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cost" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="impressions" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="clicks" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="signups" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="activations" 
              stroke="hsl(var(--chart-4))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

