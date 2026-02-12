import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onMonthChange }: MonthSelectorProps) {
  const goToPrevious = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const goToNext = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const goToCurrent = () => {
    const now = new Date();
    onMonthChange(now.getMonth() + 1, now.getFullYear());
  };

  const date = new Date(year, month - 1);
  const monthName = format(date, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg min-w-[180px] justify-center">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-medium capitalize text-foreground">{monthName}</span>
      </div>
      <Button variant="outline" size="icon" onClick={goToNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={goToCurrent} className="ml-2">
        Hoje
      </Button>
    </div>
  );
}
