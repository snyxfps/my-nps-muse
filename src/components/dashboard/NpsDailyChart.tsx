import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Save, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DailyData {
  day: number;
  nps_value: number;
}

interface NpsDailyChartProps {
  data: DailyData[];
  onUpdateDay: (day: number, value: number) => Promise<boolean>;
  loading?: boolean;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function NpsDailyChart({ data, onUpdateDay, loading }: NpsDailyChartProps) {
  const { isAdmin } = useAuth();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get current month/year for days calculation
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  // Fill all days with data or 0, ensuring values are between 0 and 100
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const existing = data.find(d => d.day === day);
    const rawValue = existing?.nps_value ?? 0;
    // Clamp value between 0 and 100
    const nps = Math.max(0, Math.min(100, rawValue));
    return {
      day,
      nps
    };
  });

  const handleEditClick = (day: number) => {
    if (!isAdmin) return;
    const existing = chartData.find(d => d.day === day);
    setEditingDay(day);
    setEditValue(String(existing?.nps ?? 0));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingDay === null) return;
    setSaving(true);
    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, parseInt(editValue) || 0));
    const success = await onUpdateDay(editingDay, clampedValue);
    setSaving(false);
    if (success) {
      setDialogOpen(false);
      setEditingDay(null);
    }
  };

  const getBarColor = (value: number) => {
    if (value <= 50) return 'hsl(45, 90%, 50%)'; // Amarelo para ≤50%
    return 'hsl(152, 60%, 45%)'; // Verde para >50%
  };


  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">NPS Diário</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">NPS Diário</CardTitle>
              {isAdmin ? (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar Dia
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || editingDay === null} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    ) : (
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-4 w-4" />
        Somente administradores podem editar
      </div>
    )}
  </div>
</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 25, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
              formatter={(value: number) => [`${value}%`, 'NPS']}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Bar
              dataKey="nps"
              radius={[4, 4, 0, 0]}
              cursor={isAdmin ? "pointer" : "default"}
              onClick={(data) => isAdmin && handleEditClick(data.day)}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.nps)} 
                />
              ))}
              <LabelList
                dataKey="nps"
                position="top"
                offset={5}
                formatter={(value: number) => `${value}%`}
                style={{ 
                  fontSize: 11, 
                  fontWeight: 600,
                  fill: 'hsl(0, 0%, 0%)' 
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {isAdmin ? 'Clique em uma barra ou use o botão "Editar Dia" para alterar valores' : 'Somente administradores podem alterar valores do NPS diário'}
        </p>
      </CardContent>
    </Card>
  );
}
