import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieIcon } from 'lucide-react';

interface NpsDistributionChartProps {
  promoters: number;
  neutrals: number;
  detractors: number;
  loading?: boolean;
}

const COLORS = {
  promoters: 'hsl(152, 60%, 45%)',
  neutrals: 'hsl(45, 90%, 50%)',
  detractors: 'hsl(0, 72%, 51%)'
};

export function NpsDistributionChart({ promoters, neutrals, detractors, loading }: NpsDistributionChartProps) {
  const data = [
    { name: 'Promotores', value: promoters, color: COLORS.promoters },
    { name: 'Neutros', value: neutrals, color: COLORS.neutrals },
    { name: 'Detratores', value: detractors, color: COLORS.detractors }
  ];

  const total = promoters + neutrals + detractors;

  return (
    <Card className="border bg-white/70 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-primary" />
          Distribuição NPS
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="w-full space-y-3">
              <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
              <div className="h-[220px] bg-slate-200/40 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : total === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={({ percent }) => (percent > 0 ? `${(percent * 100).toFixed(0)}%` : '')}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(15,23,42,0.12)',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{String(value)}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
