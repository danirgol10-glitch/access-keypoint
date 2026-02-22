
-- 1) Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  group_letter text NOT NULL,
  is_placeholder boolean NOT NULL DEFAULT false
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are publicly readable"
  ON public.teams FOR SELECT
  USING (true);

-- 2) Add new columns to stickers (keep old ones for now, add new)
ALTER TABLE public.stickers
  ADD COLUMN IF NOT EXISTS scope text,
  ADD COLUMN IF NOT EXISTS team_code text,
  ADD COLUMN IF NOT EXISTS team_name text,
  ADD COLUMN IF NOT EXISTS group_letter text,
  ADD COLUMN IF NOT EXISTS number_in_team integer,
  ADD COLUMN IF NOT EXISTS display_name text;

-- 3) Clear old sticker data and user_stickers to start fresh
DELETE FROM public.trade_request_items;
DELETE FROM public.user_stickers;
DELETE FROM public.stickers;

-- 4) Seed teams
INSERT INTO public.teams (code, name, group_letter, is_placeholder) VALUES
  -- Group A
  ('MEX', 'Mexico', 'A', false),
  ('RSA', 'South Africa', 'A', false),
  ('KOR', 'Korea Republic', 'A', false),
  ('POD', 'UEFA Play-Off D Winner', 'A', true),
  -- Group B
  ('CAN', 'Canada', 'B', false),
  ('POA', 'UEFA Play-Off A Winner', 'B', true),
  ('QAT', 'Qatar', 'B', false),
  ('SUI', 'Switzerland', 'B', false),
  -- Group C
  ('BRA', 'Brazil', 'C', false),
  ('MAR', 'Morocco', 'C', false),
  ('HAI', 'Haiti', 'C', false),
  ('SCO', 'Scotland', 'C', false),
  -- Group D
  ('USA', 'United States', 'D', false),
  ('PAR', 'Paraguay', 'D', false),
  ('AUS', 'Australia', 'D', false),
  ('POC', 'UEFA Play-Off C Winner', 'D', true),
  -- Group E
  ('GER', 'Germany', 'E', false),
  ('CUW', 'Curaçao', 'E', false),
  ('CIV', 'Côte d''Ivoire', 'E', false),
  ('ECU', 'Ecuador', 'E', false),
  -- Group F
  ('NED', 'Netherlands', 'F', false),
  ('JPN', 'Japan', 'F', false),
  ('POB', 'UEFA Play-Off B Winner', 'F', true),
  ('TUN', 'Tunisia', 'F', false),
  -- Group G
  ('BEL', 'Belgium', 'G', false),
  ('EGY', 'Egypt', 'G', false),
  ('IRN', 'IR Iran', 'G', false),
  ('NZL', 'New Zealand', 'G', false),
  -- Group H
  ('ESP', 'Spain', 'H', false),
  ('CPV', 'Cabo Verde', 'H', false),
  ('KSA', 'Saudi Arabia', 'H', false),
  ('URU', 'Uruguay', 'H', false),
  -- Group I
  ('FRA', 'France', 'I', false),
  ('SEN', 'Senegal', 'I', false),
  ('FPT2', 'FIFA Play-Off Tournament Winner 2', 'I', true),
  ('NOR', 'Norway', 'I', false),
  -- Group J
  ('ARG', 'Argentina', 'J', false),
  ('ALG', 'Algeria', 'J', false),
  ('AUT', 'Austria', 'J', false),
  ('JOR', 'Jordan', 'J', false),
  -- Group K
  ('POR', 'Portugal', 'K', false),
  ('FPT1', 'FIFA Play-Off Tournament Winner 1', 'K', true),
  ('UZB', 'Uzbekistan', 'K', false),
  ('COL', 'Colombia', 'K', false),
  -- Group L
  ('ENG', 'England', 'L', false),
  ('CRO', 'Croatia', 'L', false),
  ('GHA', 'Ghana', 'L', false),
  ('PAN', 'Panama', 'L', false);

-- 5) Generate FWC stickers (68)
INSERT INTO public.stickers (code, scope, team_code, team_name, group_letter, number_in_team, display_name)
SELECT
  'FWC ' || LPAD(i::text, 2, '0'),
  'FWC',
  NULL,
  NULL,
  NULL,
  NULL,
  'FWC ' || LPAD(i::text, 2, '0')
FROM generate_series(0, 67) AS i
ON CONFLICT (code) DO NOTHING;

-- 6) Generate TEAM stickers (48 teams * 19 = 912)
INSERT INTO public.stickers (code, scope, team_code, team_name, group_letter, number_in_team, display_name)
SELECT
  t.code || ' ' || LPAD(n::text, 2, '0'),
  'TEAM',
  t.code,
  t.name,
  t.group_letter,
  n,
  t.code || ' ' || LPAD(n::text, 2, '0')
FROM public.teams t
CROSS JOIN generate_series(1, 19) AS n
ON CONFLICT (code) DO NOTHING;

-- 7) Update album_config to 980
UPDATE public.album_config SET total_stickers = 980 WHERE id = 1;
