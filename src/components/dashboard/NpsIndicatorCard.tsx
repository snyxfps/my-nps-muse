import { useState } from 'react';
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

const variantStyles = {
  promoter: 'bg-nps-promoter-light border-nps-promoter/20',
  neutral: 'bg-nps-neutral-light border-nps-neutral/20',
  detractor: 'bg-nps-detractor-light border-nps-detractor/20',
  default: 'bg-card border-border',
  nps: 'bg-primary/5 border-primary/20',
  goal: 'bg-accent border-accent-foreground/10',
  comparison: 'bg-secondary border-secondary-foreground/10',
  trend: 'bg-muted border-muted-foreground/10',
};

const iconStyles = {
  promoter: 'text-nps-promoter',
  neutral: 'text-nps-neutral',
  detractor: 'text-nps-detractor',
  default: 'text-muted-foreground',
  nps: 'text-primary',
  goal: 'text-accent-foreground',
  comparison: 'text-secondary-foreground',
  trend: 'text-muted-foreground',
};

export function NpsIndicatorCard({
  title,
  value,
  icon,
  variant,
  onSave,
  loading,
  suffix = '',
  prefix = '',
}: NpsIndicatorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

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

  const getTrendIcon = () => {
    if (variant !== 'trend') return null;
    if (value === 'up' || value === '↑') return <TrendingUp className="h-6 w-6 text-nps-promoter" />;
    if (value === 'down' || value === '↓') return <TrendingDown className="h-6 w-6 text-nps-detractor" />;
    return <Minus className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-card-hover border-2',
        variantStyles[variant],
        loading && 'animate-pulse'
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
                  className="h-8 text-lg font-bold"
                  autoFocus
                />

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-nps-promoter hover:text-nps-promoter hover:bg-nps-promoter-light"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Check className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-nps-detractor hover:text-nps-detractor hover:bg-nps-detractor-light"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {variant === 'trend' ? (
                  <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <span className="text-2xl font-bold text-foreground">
                      {value === 'up' ? 'Subiu' : value === 'down' ? 'Caiu' : 'Estável'}
                    </span>
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
                  className="h-7 w-7 opacity-60 hover:opacity-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className={cn('p-2 rounded-lg bg-background/50', iconStyles[variant])}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
