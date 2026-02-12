import { useState } from 'react';
import { useNpsCards, CardKey } from '@/hooks/useNpsCards';
import { useNpsDaily } from '@/hooks/useNpsDaily';
import { useNpsComments } from '@/hooks/useNpsComments';
import { useAuth } from '@/contexts/AuthContext';

import { NpsIndicatorCard } from '@/components/dashboard/NpsIndicatorCard';
import { NpsDistributionChart } from '@/components/dashboard/NpsDistributionChart';
import { NpsDailyChart } from '@/components/dashboard/NpsDailyChart';
import { CommentsSection } from '@/components/dashboard/CommentsSection';
import { MonthSelector } from '@/components/dashboard/MonthSelector';

import {
  ThumbsUp,
  Meh,
  ThumbsDown,
  Users,
  Percent,
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  LogOut,
  Shield,
  User as UserIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Index() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAuth();

  const { cards, loading: cardsLoading, updateCard, refetch: refetchCards } = useNpsCards(month, year);
  const { dailyData, loading: dailyLoading, updateDailyNps, refetch: refetchDaily } = useNpsDaily(month, year);
  const {
    comments,
    loading: commentsLoading,
    addComment,
    updateComment,
    deleteComment,
    refetch: refetchComments
  } = useNpsComments({
    month,
    year,
    categoryFilter: categoryFilter as any,
    searchQuery
  });

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleRefreshAll = async () => {
    await Promise.all([refetchCards(), refetchDaily(), refetchComments()]);
    toast({
      title: 'Dados atualizados',
      description: 'Todos os dados foram recarregados com sucesso.'
    });
  };

  const handleCardUpdate = async (cardKey: CardKey, value: string) => {
    const success = await updateCard(cardKey, value);
    if (success) {
      toast({
        title: 'Card atualizado',
        description: 'O valor foi salvo com sucesso.'
      });
    }
    return success;
  };

  const promoters = parseInt(cards.promoters?.value || '0');
  const neutrals = parseInt(cards.neutrals?.value || '0');
  const detractors = parseInt(cards.detractors?.value || '0');

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* grid sutil */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-48 right-[-10%] h-[620px] w-[620px] rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      {/* Header premium */}
      <header className="sticky top-0 z-40 border-b bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-slate-800">NPS Dashboard</span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Dashboard NPS
              </h1>
              <p className="text-slate-600 mt-1">
                Acompanhamento de indicadores e feedback dos clientes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MonthSelector month={month} year={year} onMonthChange={handleMonthChange} />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshAll}
                className="shrink-0 bg-white/70 backdrop-blur hover:bg-white/90 shadow-sm"
                title="Atualizar dados"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User info bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200/70 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <UserIcon className="h-4 w-4 text-slate-500" />
              <span className="truncate max-w-[260px] sm:max-w-none">{user?.email}</span>
              {isAdmin && (
                <Badge variant="secondary" className="ml-2 gap-1 bg-white/70 backdrop-blur border shadow-sm">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="justify-start sm:justify-center text-slate-700 hover:text-slate-900 hover:bg-white/60"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Indicator Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <NpsIndicatorCard
            title="Promotores"
            value={cards.promoters?.value || '0'}
            icon={<ThumbsUp className="h-5 w-5" />}
            variant="promoter"
            onSave={(value) => handleCardUpdate('promoters', value)}
            loading={cardsLoading}
          />
          <NpsIndicatorCard
            title="Neutros"
            value={cards.neutrals?.value || '0'}
            icon={<Meh className="h-5 w-5" />}
            variant="neutral"
            onSave={(value) => handleCardUpdate('neutrals', value)}
            loading={cardsLoading}
          />
          <NpsIndicatorCard
            title="Detratores"
            value={cards.detractors?.value || '0'}
            icon={<ThumbsDown className="h-5 w-5" />}
            variant="detractor"
            onSave={(value) => handleCardUpdate('detractors', value)}
            loading={cardsLoading}
          />
          <NpsIndicatorCard
            title="Total de Respostas"
            value={cards.total_responses?.value || '0'}
            icon={<Users className="h-5 w-5" />}
            variant="default"
            onSave={(value) => handleCardUpdate('total_responses', value)}
            loading={cardsLoading}
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <NpsIndicatorCard
            title="% NPS"
            value={cards.nps_percentage?.value || '0'}
            icon={<Percent className="h-5 w-5" />}
            variant="nps"
            onSave={(value) => handleCardUpdate('nps_percentage', value)}
            loading={cardsLoading}
            suffix="%"
          />
          <NpsIndicatorCard
            title="Meta do NPS"
            value={cards.nps_goal?.value || '0'}
            icon={<Target className="h-5 w-5" />}
            variant="goal"
            onSave={(value) => handleCardUpdate('nps_goal', value)}
            loading={cardsLoading}
            suffix="%"
          />
          <NpsIndicatorCard
            title="Comparação (Mês Anterior)"
            value={cards.comparison?.value || '0'}
            icon={<BarChart3 className="h-5 w-5" />}
            variant="comparison"
            onSave={(value) => handleCardUpdate('comparison', value)}
            loading={cardsLoading}
            prefix={parseInt(cards.comparison?.value || '0') >= 0 ? '+' : ''}
            suffix="%"
          />
          <NpsIndicatorCard
            title="Tendência"
            value={cards.trend?.value || 'stable'}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="trend"
            onSave={(value) => handleCardUpdate('trend', value)}
            loading={cardsLoading}
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="lg:col-span-1">
            <NpsDistributionChart
              promoters={promoters}
              neutrals={neutrals}
              detractors={detractors}
              loading={cardsLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <NpsDailyChart
              data={dailyData}
              onUpdateDay={updateDailyNps}
              loading={dailyLoading}
              month={month}
              year={year}
            />
          </div>
        </section>

        {/* Comments */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CommentsSection
            comments={comments}
            loading={commentsLoading}
            onCategoryFilterChange={setCategoryFilter}
            onSearchChange={setSearchQuery}
            onAddComment={addComment}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
            month={month}
            year={year}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
          />
        </section>
      </main>
    </div>
  );
}
