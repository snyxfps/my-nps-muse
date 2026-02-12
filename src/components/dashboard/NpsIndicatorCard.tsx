import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NpsIndicatorCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  variant: 'promoter' | 'neutral' | 'detractor' | 'default' | 'nps' | 'goal' | 'comparison' | 'trend';
  onSave: (value: string) => Promise<boolean>;
  loading?: boolean;
  suffix?: string;
  prefix?: string;
}

const ringStyles: Record<NpsIndicatorCardProps['variant'], string> = {
  promoter: 'ring-1 ring-nps-promoter/20',
  neutral: 'ring-1 ring-nps-neutral/20',
  detractor: 'ring-1 ring-nps-detractor/20',
  default: 'ring-1 ring-slate-500/10',
  nps: 'ring-1 ring-primary/15',
  goal: 'ring-1 ring-violet-500/15',
  comparison: 'ring-1 ring-cyan-500/15',
  trend: 'ring-1 ring-indigo-500/15'
};

const iconStyles: Record<NpsIndicatorCardProps['variant'], string> = {
  promoter: 'text-nps-promoter',
  neutral: 'text-nps-neutral',
  detractor: 'text-nps-detractor',
  default: 'text-muted-foreground',
  nps: 'text-primary',
  goal: 'text-violet-600',
  comparison: 'text-cyan-700',
  trend: 'text-muted-foreground'
};

export function NpsIndicatorCard({
  title,
  value,
  icon,
  variant,
  onSave,
  loading,
  suffix = '',
  prefix = ''
}: NpsIndicatorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) setEditValue(value);
  }, [value, isEditing]);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(editValue);
    setSaving(false);
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const trendLabel = useMemo(() => {
    if (value === 'up' || value === '↑') return 'Subiu';
    if (value === 'down' || value === '↓') return 'Caiu';
    return 'Estável';
  }, [value]);

  const TrendIcon = useMemo(() => {
    if (variant !== 'trend') return null;
    if (value === 'up' || value === '↑') return <TrendingUp className="h-6 w-6 text-nps-promoter" />;
    if (value === 'down' || value === '↓') return <TrendingDown className="h-6 w-6 text-nps-detractor" />;
    return <Minus className="h-6 w-6 text-muted-foreground" />;
  }, [variant, value]);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border bg-white/70 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl',
        ringStyles[variant],
        loading && 'animate-pulse opacity-80'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1 truncate">{title}</p>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-9 text-lg font-semibold bg-white/70 backdrop-blur border"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-nps-promoter hover:text-nps-promoter hover:bg-nps-promoter/10"
                  onClick={handleSave}
                  disabled={saving}
                  title="Salvar"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-nps-detractor hover:text-nps-detractor hover:bg-nps-detractor/10"
                  onClick={handleCancel}
                  disabled={saving}
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {variant === 'trend' ? (
                  <div className="flex items-center gap-2">
                    {TrendIcon}
                    <span className="text-2xl font-bold text-foreground">{trendLabel}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-foreground">
                    {prefix}
                    {value || '0'}
                    {suffix}
                  </span>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-60 hover:opacity-100 hover:bg-white/60"
                  onClick={() => setIsEditing(true)}
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div
            className={cn(
              'p-2 rounded-lg bg-white/60 border border-white/40 shadow-sm backdrop-blur',
              iconStyles[variant]
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
