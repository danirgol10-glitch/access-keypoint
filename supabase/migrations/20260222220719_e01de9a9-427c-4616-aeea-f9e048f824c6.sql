
-- Add ordering columns to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS group_team_order integer;

-- Add ordering columns to stickers
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS sort_scope integer;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS sort_group integer;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS sort_team integer;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS sort_number integer;

-- Set group_team_order for teams (order matches the seed list)
UPDATE public.teams SET group_team_order = CASE code
  -- Group A
  WHEN 'MEX' THEN 1 WHEN 'RSA' THEN 2 WHEN 'KOR' THEN 3 WHEN 'PO_D' THEN 4
  -- Group B
  WHEN 'CAN' THEN 1 WHEN 'PO_A' THEN 2 WHEN 'QAT' THEN 3 WHEN 'SUI' THEN 4
  -- Group C
  WHEN 'BRA' THEN 1 WHEN 'MAR' THEN 2 WHEN 'HAI' THEN 3 WHEN 'SCO' THEN 4
  -- Group D
  WHEN 'USA' THEN 1 WHEN 'PAR' THEN 2 WHEN 'AUS' THEN 3 WHEN 'PO_C' THEN 4
  -- Group E
  WHEN 'GER' THEN 1 WHEN 'CUW' THEN 2 WHEN 'CIV' THEN 3 WHEN 'ECU' THEN 4
  -- Group F
  WHEN 'NED' THEN 1 WHEN 'JPN' THEN 2 WHEN 'PO_B' THEN 3 WHEN 'TUN' THEN 4
  -- Group G
  WHEN 'BEL' THEN 1 WHEN 'EGY' THEN 2 WHEN 'IRN' THEN 3 WHEN 'NZL' THEN 4
  -- Group H
  WHEN 'ESP' THEN 1 WHEN 'CPV' THEN 2 WHEN 'KSA' THEN 3 WHEN 'URU' THEN 4
  -- Group I
  WHEN 'FRA' THEN 1 WHEN 'SEN' THEN 2 WHEN 'FPT2' THEN 3 WHEN 'NOR' THEN 4
  -- Group J
  WHEN 'ARG' THEN 1 WHEN 'ALG' THEN 2 WHEN 'AUT' THEN 3 WHEN 'JOR' THEN 4
  -- Group K
  WHEN 'POR' THEN 1 WHEN 'FPT1' THEN 2 WHEN 'UZB' THEN 3 WHEN 'COL' THEN 4
  -- Group L
  WHEN 'ENG' THEN 1 WHEN 'CRO' THEN 2 WHEN 'GHA' THEN 3 WHEN 'PAN' THEN 4
END;

-- Populate sort fields for FWC stickers
UPDATE public.stickers SET
  sort_scope = 0,
  sort_group = NULL,
  sort_team = NULL,
  sort_number = CAST(SUBSTRING(code FROM 5) AS integer)
WHERE scope = 'FWC';

-- Populate sort fields for TEAM stickers
UPDATE public.stickers s SET
  sort_scope = 1,
  sort_group = CASE s.group_letter
    WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 WHEN 'D' THEN 4
    WHEN 'E' THEN 5 WHEN 'F' THEN 6 WHEN 'G' THEN 7 WHEN 'H' THEN 8
    WHEN 'I' THEN 9 WHEN 'J' THEN 10 WHEN 'K' THEN 11 WHEN 'L' THEN 12
  END,
  sort_team = t.group_team_order,
  sort_number = s.number_in_team
FROM public.teams t
WHERE s.scope = 'TEAM' AND s.team_code = t.code;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_stickers_sort ON public.stickers (sort_scope, sort_group NULLS LAST, sort_team NULLS LAST, sort_number);
