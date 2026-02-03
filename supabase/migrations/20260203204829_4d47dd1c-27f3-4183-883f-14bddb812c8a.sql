-- Create album_config table
CREATE TABLE public.album_config (
  id INTEGER PRIMARY KEY,
  total_stickers INTEGER NOT NULL
);

-- Enable RLS on album_config (public read access)
ALTER TABLE public.album_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read album config
CREATE POLICY "Album config is publicly readable"
ON public.album_config
FOR SELECT
USING (true);

-- Insert the single config row
INSERT INTO public.album_config (id, total_stickers) VALUES (1, 980);

-- Create stickers table
CREATE TABLE public.stickers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  team TEXT,
  section TEXT,
  number INTEGER,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on stickers (public read access)
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stickers
CREATE POLICY "Stickers are publicly readable"
ON public.stickers
FOR SELECT
USING (true);

-- Seed stickers table with 45 dummy stickers
INSERT INTO public.stickers (code, team, section, number, name) VALUES
  ('MEX 01', 'Mexico', 'Group A', 1, 'Team Logo'),
  ('MEX 02', 'Mexico', 'Group A', 2, 'Guillermo Ochoa'),
  ('MEX 03', 'Mexico', 'Group A', 3, 'César Montes'),
  ('MEX 04', 'Mexico', 'Group A', 4, 'Hirving Lozano'),
  ('MEX 05', 'Mexico', 'Group A', 5, 'Raúl Jiménez'),
  ('ARG 01', 'Argentina', 'Group C', 1, 'Team Logo'),
  ('ARG 02', 'Argentina', 'Group C', 2, 'Emiliano Martínez'),
  ('ARG 03', 'Argentina', 'Group C', 3, 'Nicolás Otamendi'),
  ('ARG 04', 'Argentina', 'Group C', 4, 'Lionel Messi'),
  ('ARG 05', 'Argentina', 'Group C', 5, 'Ángel Di María'),
  ('BRA 01', 'Brazil', 'Group G', 1, 'Team Logo'),
  ('BRA 02', 'Brazil', 'Group G', 2, 'Alisson'),
  ('BRA 03', 'Brazil', 'Group G', 3, 'Thiago Silva'),
  ('BRA 04', 'Brazil', 'Group G', 4, 'Neymar Jr'),
  ('BRA 05', 'Brazil', 'Group G', 5, 'Vinícius Jr'),
  ('GER 01', 'Germany', 'Group E', 1, 'Team Logo'),
  ('GER 02', 'Germany', 'Group E', 2, 'Manuel Neuer'),
  ('GER 03', 'Germany', 'Group E', 3, 'Antonio Rüdiger'),
  ('GER 04', 'Germany', 'Group E', 4, 'Joshua Kimmich'),
  ('GER 05', 'Germany', 'Group E', 5, 'Kai Havertz'),
  ('FRA 01', 'France', 'Group D', 1, 'Team Logo'),
  ('FRA 02', 'France', 'Group D', 2, 'Hugo Lloris'),
  ('FRA 03', 'France', 'Group D', 3, 'Raphaël Varane'),
  ('FRA 04', 'France', 'Group D', 4, 'Kylian Mbappé'),
  ('FRA 05', 'France', 'Group D', 5, 'Antoine Griezmann'),
  ('ESP 01', 'Spain', 'Group E', 1, 'Team Logo'),
  ('ESP 02', 'Spain', 'Group E', 2, 'Unai Simón'),
  ('ESP 03', 'Spain', 'Group E', 3, 'Aymeric Laporte'),
  ('ESP 04', 'Spain', 'Group E', 4, 'Pedri'),
  ('ESP 05', 'Spain', 'Group E', 5, 'Gavi'),
  ('ENG 01', 'England', 'Group B', 1, 'Team Logo'),
  ('ENG 02', 'England', 'Group B', 2, 'Jordan Pickford'),
  ('ENG 03', 'England', 'Group B', 3, 'Harry Maguire'),
  ('ENG 04', 'England', 'Group B', 4, 'Jude Bellingham'),
  ('ENG 05', 'England', 'Group B', 5, 'Harry Kane'),
  ('POR 01', 'Portugal', 'Group H', 1, 'Team Logo'),
  ('POR 02', 'Portugal', 'Group H', 2, 'Diogo Costa'),
  ('POR 03', 'Portugal', 'Group H', 3, 'Rúben Dias'),
  ('POR 04', 'Portugal', 'Group H', 4, 'Bruno Fernandes'),
  ('POR 05', 'Portugal', 'Group H', 5, 'Cristiano Ronaldo'),
  ('NED 01', 'Netherlands', 'Group A', 1, 'Team Logo'),
  ('NED 02', 'Netherlands', 'Group A', 2, 'Justin Bijlow'),
  ('NED 03', 'Netherlands', 'Group A', 3, 'Virgil van Dijk'),
  ('NED 04', 'Netherlands', 'Group A', 4, 'Frenkie de Jong'),
  ('NED 05', 'Netherlands', 'Group A', 5, 'Memphis Depay');