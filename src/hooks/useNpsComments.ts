import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type CommentCategory = Database['public']['Enums']['comment_category'];
type CommentStatus = Database['public']['Enums']['comment_status'];

export interface NpsComment {
  id: string;
  client_name: string;
  comment: string;
  evaluation_date: string;
  nps_score: number;
  category: CommentCategory;
  status: CommentStatus;
  month: number;
  year: number;
}

interface UseNpsCommentsOptions {
  month: number;
  year: number;
  categoryFilter?: CommentCategory | null;
  searchQuery?: string;
}

export function useNpsComments({ month, year, categoryFilter, searchQuery }: UseNpsCommentsOptions) {
  const [comments, setComments] = useState<NpsComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('nps_comments')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .order('evaluation_date', { ascending: false });

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('client_name', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
      return;
    }

    setComments(data || []);
    setLoading(false);
  }, [month, year, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (comment: Omit<NpsComment, 'id'>) => {
    const { error } = await supabase
      .from('nps_comments')
      .insert(comment);

    if (error) {
      console.error('Error adding comment:', error);
      return false;
    }

    await fetchComments();
    return true;
  };

  const updateComment = async (id: string, updates: Partial<NpsComment>) => {
    const { error } = await supabase
      .from('nps_comments')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating comment:', error);
      return false;
    }

    await fetchComments();
    return true;
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase
      .from('nps_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    await fetchComments();
    return true;
  };

  return { comments, loading, addComment, updateComment, deleteComment, refetch: fetchComments };
}
