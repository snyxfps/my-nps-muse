-- Tabela para os cards de indicadores NPS (1 registro por card por mês)
CREATE TABLE public.nps_cards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    card_key TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '0',
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (card_key, month, year)
);

-- Tabela para NPS diário (1 registro por dia do mês)
CREATE TABLE public.nps_daily (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
    nps_value INTEGER NOT NULL DEFAULT 0,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (day, month, year)
);

-- Enum para categoria de comentário
CREATE TYPE public.comment_category AS ENUM ('bug', 'elogio', 'sugestao', 'rota', 'suporte');

-- Enum para status de comentário
CREATE TYPE public.comment_status AS ENUM ('resolvido', 'em_analise', 'pendente');

-- Tabela para comentários dos clientes
CREATE TABLE public.nps_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
    category comment_category NOT NULL DEFAULT 'sugestao',
    status comment_status NOT NULL DEFAULT 'pendente',
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (dados públicos para este dashboard)
ALTER TABLE public.nps_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (sem autenticação requerida)
CREATE POLICY "Allow public read on nps_cards" ON public.nps_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert on nps_cards" ON public.nps_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on nps_cards" ON public.nps_cards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on nps_cards" ON public.nps_cards FOR DELETE USING (true);

CREATE POLICY "Allow public read on nps_daily" ON public.nps_daily FOR SELECT USING (true);
CREATE POLICY "Allow public insert on nps_daily" ON public.nps_daily FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on nps_daily" ON public.nps_daily FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on nps_daily" ON public.nps_daily FOR DELETE USING (true);

CREATE POLICY "Allow public read on nps_comments" ON public.nps_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on nps_comments" ON public.nps_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on nps_comments" ON public.nps_comments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on nps_comments" ON public.nps_comments FOR DELETE USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nps_cards_updated_at
    BEFORE UPDATE ON public.nps_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nps_daily_updated_at
    BEFORE UPDATE ON public.nps_daily
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nps_comments_updated_at
    BEFORE UPDATE ON public.nps_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();