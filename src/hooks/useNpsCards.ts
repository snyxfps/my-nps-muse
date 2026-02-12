import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NpsCard {
  id: string;
  card_key: string;
  value: string;
  month: number;
  year: number;
}

const CARD_KEYS = [
  'promoters',
  'neutrals',
  'detractors',
  'total_responses',
  'nps_percentage',
  'nps_goal',
  'comparison',
  'trend'
] as const;

export type CardKey = typeof CARD_KEYS[number];

export function useNpsCards(month: number, year: number) {
  const [cards, setCards] = useState<Record<CardKey, NpsCard | null>>({
    promoters: null,
    neutrals: null,
    detractors: null,
    total_responses: null,
    nps_percentage: null,
    nps_goal: null,
    comparison: null,
    trend: null
  });
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nps_cards')
      .select('*')
      .eq('month', month)
      .eq('year', year);

    if (error) {
      console.error('Error fetching cards:', error);
      setLoading(false);
      return;
    }

    const cardMap: Record<CardKey, NpsCard | null> = {
      promoters: null,
      neutrals: null,
      detractors: null,
      total_responses: null,
      nps_percentage: null,
      nps_goal: null,
      comparison: null,
      trend: null
    };

    data?.forEach((card) => {
      if (CARD_KEYS.includes(card.card_key as CardKey)) {
        cardMap[card.card_key as CardKey] = card;
      }
    });

    setCards(cardMap);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const updateCard = async (cardKey: CardKey, value: string) => {
    const existingCard = cards[cardKey];

    if (existingCard) {
      const { error } = await supabase
        .from('nps_cards')
        .update({ value })
        .eq('id', existingCard.id);

      if (error) {
        console.error('Error updating card:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('nps_cards')
        .insert({
          card_key: cardKey,
          value,
          month,
          year
        });

      if (error) {
        console.error('Error inserting card:', error);
        return false;
      }
    }

    await fetchCards();
    return true;
  };

  return { cards, loading, updateCard, refetch: fetchCards };
}
