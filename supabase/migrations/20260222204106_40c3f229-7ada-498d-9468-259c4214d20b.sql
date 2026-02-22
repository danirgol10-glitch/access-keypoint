
-- Step 1: Add city column with default
ALTER TABLE public.universities ADD COLUMN city text NOT NULL DEFAULT 'Bogotá';

-- Step 2: Drop old name-only unique constraint
ALTER TABLE public.universities DROP CONSTRAINT universities_name_key;

-- Step 3: Add new (name, city) unique constraint
ALTER TABLE public.universities ADD CONSTRAINT universities_name_city_unique UNIQUE (name, city);

-- Step 4: Clear references and re-seed
UPDATE public.users SET university_id = NULL WHERE university_id IS NOT NULL;
DELETE FROM public.universities;

INSERT INTO public.universities (name, city, country, is_active) VALUES
('Universidad de los Andes', 'Bogotá', 'Colombia', true),
('Universidad Nacional de Colombia', 'Bogotá', 'Colombia', true),
('Pontificia Universidad Javeriana', 'Bogotá', 'Colombia', true),
('Universidad del Rosario', 'Bogotá', 'Colombia', true),
('Universidad Externado de Colombia', 'Bogotá', 'Colombia', true),
('Universidad de La Sabana', 'Bogotá', 'Colombia', true),
('Universidad Jorge Tadeo Lozano', 'Bogotá', 'Colombia', true),
('Universidad Sergio Arboleda', 'Bogotá', 'Colombia', true),
('Universidad EAN', 'Bogotá', 'Colombia', true),
('Universidad Militar Nueva Granada', 'Bogotá', 'Colombia', true),
('Universidad de Antioquia', 'Medellín', 'Colombia', true),
('Universidad EAFIT', 'Medellín', 'Colombia', true),
('Universidad Nacional de Colombia', 'Medellín', 'Colombia', true),
('Universidad Pontificia Bolivariana', 'Medellín', 'Colombia', true),
('Universidad de Medellín', 'Medellín', 'Colombia', true),
('Universidad del Valle', 'Cali', 'Colombia', true),
('Universidad Icesi', 'Cali', 'Colombia', true),
('Pontificia Universidad Javeriana', 'Cali', 'Colombia', true),
('Universidad Autónoma de Occidente', 'Cali', 'Colombia', true),
('Universidad del Norte', 'Barranquilla', 'Colombia', true),
('Universidad del Atlántico', 'Barranquilla', 'Colombia', true),
('Universidad Simón Bolívar', 'Barranquilla', 'Colombia', true),
('Universidad de Cartagena', 'Cartagena', 'Colombia', true),
('Universidad Tecnológica de Bolívar', 'Cartagena', 'Colombia', true),
('Universidad Industrial de Santander', 'Bucaramanga', 'Colombia', true),
('Universidad Autónoma de Bucaramanga', 'Bucaramanga', 'Colombia', true),
('Universidad Tecnológica de Pereira', 'Pereira', 'Colombia', true),
('Universidad de Caldas', 'Manizales', 'Colombia', true),
('Universidad Nacional de Colombia', 'Manizales', 'Colombia', true);
