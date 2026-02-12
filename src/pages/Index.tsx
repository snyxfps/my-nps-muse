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
  User
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
      description: 'Todos os dados foram recarregados com sucesso.',
    });
  };

  const handleCardUpdate = async (cardKey: CardKey, value: string) => {
    const success = await updateCard(cardKey, value);
    if (success) {
      toast({
        title: 'Card atualizado',
        description: 'O valor foi salvo com sucesso.',
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
      description: 'Você foi desconectado com sucesso.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header text-primary-foreground py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Dashboard NPS
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Acompanhamento de indicadores e feedback dos clientes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MonthSelector month={month} year={year} onMonthChange={handleMonthChange} />
              <Button 
                variant="secondary" 
                size="icon"
                onClick={handleRefreshAll}
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* User info bar */}
          <div className="mt-4 flex items-center justify-between border-t border-primary-foreground/20 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
              {isAdmin && (
                <Badge variant="secondary" className="ml-2 gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
