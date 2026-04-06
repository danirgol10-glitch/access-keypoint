
-- Update team names to Spanish
UPDATE teams SET name = 'República Checa' WHERE code = 'CZE';
UPDATE teams SET name = 'Bosnia y Herzegovina' WHERE code = 'BIH';
UPDATE teams SET name = 'Turquía' WHERE code = 'TUR';
UPDATE teams SET name = 'Suecia' WHERE code = 'SWE';
UPDATE teams SET name = 'Irak' WHERE code = 'IRQ';
UPDATE teams SET name = 'República Democrática del Congo' WHERE code = 'COD';

-- Update sticker team_name to Spanish
UPDATE stickers SET team_name = 'República Checa' WHERE team_code = 'CZE';
UPDATE stickers SET team_name = 'Bosnia y Herzegovina' WHERE team_code = 'BIH';
UPDATE stickers SET team_name = 'Turquía' WHERE team_code = 'TUR';
UPDATE stickers SET team_name = 'Suecia' WHERE team_code = 'SWE';
UPDATE stickers SET team_name = 'Irak' WHERE team_code = 'IRQ';
UPDATE stickers SET team_name = 'República Democrática del Congo' WHERE team_code = 'COD';
