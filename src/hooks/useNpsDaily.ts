import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NpsDaily {
  id: string;
  day: number;
  nps_value: number;
  month: number;
  year: number;
}

export function useNpsDaily(month: number, year: number) {
  const [dailyData, setDailyData] = useState<NpsDaily[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nps_daily')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .order('day', { ascending: true });

    if (error) {
      console.error('Error fetching daily data:', error);
      setLoading(false);
      return;
    }

    setDailyData(data || []);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const updateDailyNps = async (day: number, npsValue: number) => {
    const existingDay = dailyData.find(d => d.day === day);

    if (existingDay) {
      const { error } = await supabase
        .from('nps_daily')
        .update({ nps_value: npsValue })
        .eq('id', existingDay.id);

      if (error) {
        console.error('Error updating daily NPS:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('nps_daily')
        .insert({
          day,
          nps_value: npsValue,
          month,
          year
        });

      if (error) {
        console.error('Error inserting daily NPS:', error);
        return false;
      }
    }

    await fetchDailyData();
    return true;
  };

  return { dailyData, loading, updateDailyNps, refetch: fetchDailyData };
}
