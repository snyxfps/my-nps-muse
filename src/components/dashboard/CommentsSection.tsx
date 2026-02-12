import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Star, Calendar, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { NpsComment } from '@/hooks/useNpsComments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type CommentCategory = Database['public']['Enums']['comment_category'];
type CommentStatus = Database['public']['Enums']['comment_status'];

interface CommentsSectionProps {
  comments: NpsComment[];
  loading: boolean;
  onCategoryFilterChange: (category: string | null) => void;
  onSearchChange: (search: string) => void;
  onAddComment: (comment: Omit<NpsComment, 'id'>) => Promise<boolean>;
  onUpdateComment: (id: string, updates: Partial<NpsComment>) => Promise<boolean>;
  onDeleteComment: (id: string) => Promise<boolean>;
  month: number;
  year: number;
  categoryFilter: string | null;
  searchQuery: string;
}

const categoryLabels = {
  bug: 'Bug',
  elogio: 'Elogio',
  sugestao: 'Sugestão',
  rota: 'Rota',
  suporte: 'Suporte'
};

const categoryColors = {
  bug: 'bg-category-bug text-white',
  elogio: 'bg-category-praise text-white',
  sugestao: 'bg-category-suggestion text-white',
  rota: 'bg-category-route text-white',
  suporte: 'bg-category-support text-nps-neutral-foreground'
};

const statusLabels = {
  resolvido: 'Resolvido',
  em_analise: 'Em Análise',
  pendente: 'Pendente'
};

const statusColors = {
  resolvido: 'bg-status-resolved/20 text-status-resolved border-status-resolved/30',
  em_analise: 'bg-status-analysis/20 text-status-analysis border-status-analysis/30',
  pendente: 'bg-status-pending/20 text-status-pending border-status-pending/30'
};

function getScoreColor(score: number) {
  if (score >= 9) return 'text-nps-promoter';
  if (score >= 7) return 'text-nps-neutral';
  return 'text-nps-detractor';
}

export function CommentsSection({
  comments,
  loading,
  onCategoryFilterChange,
  onSearchChange,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  month,
  year,
  categoryFilter,
  searchQuery
}: CommentsSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<NpsComment | null>(null);
  const [formData, setFormData] = useState<{
    client_name: string;
    comment: string;
    nps_score: number;
    category: CommentCategory;
    status: CommentStatus;
    evaluation_date: string;
  }>({
    client_name: '',
    comment: '',
    nps_score: 8,
    category: 'sugestao',
    status: 'pendente',
    evaluation_date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleAddSubmit = async () => {
    const success = await onAddComment({
      ...formData,
      month,
      year
    });
    if (success) {
      setAddDialogOpen(false);
      setFormData({
        client_name: '',
        comment: '',
        nps_score: 8,
        category: 'sugestao',
        status: 'pendente',
        evaluation_date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!editingComment) return;
    const success = await onUpdateComment(editingComment.id, formData);
    if (success) {
      setEditingComment(null);
    }
  };

  const openEditDialog = (comment: NpsComment) => {
    setFormData({
      client_name: comment.client_name,
      comment: comment.comment,
      nps_score: comment.nps_score,
      category: comment.category,
      status: comment.status,
      evaluation_date: comment.evaluation_date
    });
    setEditingComment(comment);
  };

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR });

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comentários dos Clientes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{monthName}</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Comentário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Comentário</DialogTitle>
              </DialogHeader>
              <CommentForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddSubmit}
                onCancel={() => setAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter ?? 'all'}
            onValueChange={(value) => onCategoryFilterChange(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-muted rounded-lg p-4 h-24" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum comentário encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-foreground">{comment.client_name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(comment.evaluation_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-3">"{comment.comment}"</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={cn('flex items-center gap-1 text-sm font-medium', getScoreColor(comment.nps_score))}>
                        <Star className="h-4 w-4 fill-current" />
                        Nota: {comment.nps_score}
                      </div>
                      <Badge className={cn('text-xs', categoryColors[comment.category])}>
                        {categoryLabels[comment.category]}
                      </Badge>
                      <Badge variant="outline" className={cn('text-xs', statusColors[comment.status])}>
                        {statusLabels[comment.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(comment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingComment} onOpenChange={(open) => !open && setEditingComment(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Comentário</DialogTitle>
            </DialogHeader>
            <CommentForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingComment(null)}
              isEdit
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

type CommentFormData = {
  client_name: string;
  comment: string;
  nps_score: number;
  category: CommentCategory;
  status: CommentStatus;
  evaluation_date: string;
};

interface CommentFormProps {
  formData: CommentFormData;
  setFormData: React.Dispatch<React.SetStateAction<CommentFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

function CommentForm({ formData, setFormData, onSubmit, onCancel, isEdit }: CommentFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do Cliente</label>
          <Input
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
            placeholder="Nome do cliente"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Data</label>
          <Input
            type="date"
            value={formData.evaluation_date}
            onChange={(e) => setFormData(prev => ({ ...prev, evaluation_date: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Comentário</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          placeholder="Comentário do cliente..."
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nota (0-10)</label>
          <Input
            type="number"
            min="0"
            max="10"
            value={formData.nps_score}
            onChange={(e) => setFormData(prev => ({ ...prev, nps_score: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit}>{isEdit ? 'Salvar' : 'Adicionar'}</Button>
      </div>
    </div>
  );
}
