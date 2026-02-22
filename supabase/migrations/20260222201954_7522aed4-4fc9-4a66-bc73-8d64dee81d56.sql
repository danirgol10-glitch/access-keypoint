
-- Create universities table
CREATE TABLE public.universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'Colombia',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Universities are publicly readable
CREATE POLICY "Universities are publicly readable"
  ON public.universities FOR SELECT
  USING (true);

-- Add university_id to users
ALTER TABLE public.users
  ADD COLUMN university_id UUID REFERENCES public.universities(id);

-- Allow city users to see university_id via existing SELECT policies (already permissive on users)

-- Seed some Colombian universities
INSERT INTO public.universities (name) VALUES
  ('Universidad de los Andes'),
  ('Universidad Nacional de Colombia'),
  ('Pontificia Universidad Javeriana'),
  ('Universidad del Rosario'),
  ('Universidad Externado de Colombia'),
  ('Universidad de Antioquia'),
  ('Universidad del Valle'),
  ('Universidad del Norte'),
  ('Universidad EAFIT'),
  ('Universidad de La Sabana'),
  ('Universidad Pontificia Bolivariana'),
  ('Universidad ICESI'),
  ('Universidad de Medellín'),
  ('Universidad Sergio Arboleda'),
  ('Universidad EAN'),
  ('Universidad de La Salle'),
  ('Universidad Santo Tomás'),
  ('Universidad Autónoma de Bucaramanga'),
  ('Universidad Industrial de Santander'),
  ('Universidad del Cauca');
