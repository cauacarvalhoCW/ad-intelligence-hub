"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

interface ProductPieChartProps {
  data: Array<{
    product: string;
    cost: number;
  }>;
}

const PRODUCT_COLORS: Record<string, string> = {
  POS: 'hsl(var(--chart-1))',
  TAP: 'hsl(var(--chart-2))',
  LINK: 'hsl(var(--chart-3))',
  JIM: 'hsl(var(--chart-4))',
  unknown: 'hsl(var(--muted))',
};

export function ProductPieChart({ data }: ProductPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.cost, 0);

  const formattedData = data.map(item => ({
    ...item,
    percentage: ((item.cost / total) * 100).toFixed(1),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custo por Produto</CardTitle>
        <CardDescription>Distribuição percentual</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ product, percentage }) => `${product} (${percentage}%)`}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="cost"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PRODUCT_COLORS[entry.product] || PRODUCT_COLORS.unknown} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number, name: string, props: any) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${props.payload.percentage}%)`,
                props.payload.product
              ]}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry: any) => `${entry.payload.product} - R$ ${entry.payload.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

