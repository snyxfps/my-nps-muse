import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Save, CalendarDays } from 'lucide-react';

interface DailyData {
  day: number;
  nps_value: number;
}

interface NpsDailyChartProps {
  data: DailyData[];
  onUpdateDay: (day: number, value: number) => Promise<boolean>;
  loading?: boolean;
  month: number;
  year: number;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function NpsDailyChart({ data, onUpdateDay, loading, month, year }: NpsDailyChartProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const daysInMonth = useMemo(() => getDaysInMonth(month, year), [month, year]);

  const chartData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const existing = data.find(d => d.day === day);
      const rawValue = existing?.nps_value ?? 0;
      const nps = Math.max(0, Math.min(100, rawValue));
      return { day, nps };
    });
  }, [data, daysInMonth]);

  const handleEditClick = (day: number) => {
    const existing = chartData.find(d => d.day === day);
    setEditingDay(day);
    setEditValue(String(existing?.nps ?? 0));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingDay === null) return;
    setSaving(true);
    const clampedValue = Math.max(0, Math.min(100, parseInt(editValue) || 0));
    const success = await onUpdateDay(editingDay, clampedValue);
    setSaving(false);
    if (success) {
      setDialogOpen(false);
      setEditingDay(null);
    }
  };

  const getBarColor = (value: number) => {
    if (value <= 50) return 'hsl(45, 90%, 50%)';
    return 'hsl(152, 60%, 45%)';
  };

  return (
    <Card className="border bg-white/70 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            NPS Diário
          </CardTitle>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-white/70 backdrop-blur hover:bg-white/90 shadow-sm">
                <Pencil className="h-4 w-4" />
                Editar Dia
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-md border">
              <DialogHeader>
                <DialogTitle>Editar NPS do Dia</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dia</label>
                  <select
                    value={editingDay ?? ''}
                    onChange={(e) => {
                      const day = parseInt(e.target.value);
                      setEditingDay(day);
                      const existing = chartData.find(d => d.day === day);
                      setEditValue(String(existing?.nps ?? 0));
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-white/70 backdrop-blur px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Selecione</option>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Dia {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor NPS (0 a 100%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="0"
                    className="bg-white/70 backdrop-blur"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-white/70 backdrop-blur hover:bg-white/90">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving || editingDay === null} className="gap-2 shadow-md">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="w-full space-y-3">
              <div className="h-4 w-32 bg-slate-200/70 rounded animate-pulse" />
              <div className="h-[260px] bg-slate-200/40 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 25, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.10)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: 'rgba(100,116,139,1)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(15,23,42,0.10)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: 'rgba(100,116,139,1)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(15,23,42,0.10)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(15,23,42,0.12)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value: number) => [`${value}%`, 'NPS']}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Bar
                  dataKey="nps"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(payload) => handleEditClick(payload.day)}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.nps)} />
                  ))}
                  <LabelList
                    dataKey="nps"
                    position="top"
                    offset={6}
                    formatter={(value: number) => `${value}%`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: 'rgba(15,23,42,0.85)'
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <p className="text-xs text-muted-foreground text-center mt-2">
              Clique em uma barra ou use o botão &quot;Editar Dia&quot; para alterar valores
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
