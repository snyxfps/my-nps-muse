import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribuição NPS</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Distribuição NPS</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
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
                label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
