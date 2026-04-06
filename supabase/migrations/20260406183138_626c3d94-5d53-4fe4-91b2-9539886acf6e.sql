
-- Translate remaining team names to Spanish
UPDATE teams SET name = 'Argelia' WHERE code = 'ALG';
UPDATE teams SET name = 'Alemania' WHERE code = 'GER';
UPDATE teams SET name = 'Bélgica' WHERE code = 'BEL';
UPDATE teams SET name = 'Brasil' WHERE code = 'BRA';
UPDATE teams SET name = 'Croacia' WHERE code = 'CRO';
UPDATE teams SET name = 'Egipto' WHERE code = 'EGY';
UPDATE teams SET name = 'Inglaterra' WHERE code = 'ENG';
UPDATE teams SET name = 'Francia' WHERE code = 'FRA';
UPDATE teams SET name = 'Canadá' WHERE code = 'CAN';
UPDATE teams SET name = 'Escocia' WHERE code = 'SCO';
UPDATE teams SET name = 'Japón' WHERE code = 'JPN';
UPDATE teams SET name = 'Jordania' WHERE code = 'JOR';
UPDATE teams SET name = 'Corea del Sur' WHERE code = 'KOR';
UPDATE teams SET name = 'México' WHERE code = 'MEX';
UPDATE teams SET name = 'Marruecos' WHERE code = 'MAR';
UPDATE teams SET name = 'Países Bajos' WHERE code = 'NED';
UPDATE teams SET name = 'Nueva Zelanda' WHERE code = 'NZL';
UPDATE teams SET name = 'Noruega' WHERE code = 'NOR';
UPDATE teams SET name = 'Panamá' WHERE code = 'PAN';
UPDATE teams SET name = 'Arabia Saudita' WHERE code = 'KSA';
UPDATE teams SET name = 'Sudáfrica' WHERE code = 'RSA';
UPDATE teams SET name = 'España' WHERE code = 'ESP';
UPDATE teams SET name = 'Suiza' WHERE code = 'SUI';
UPDATE teams SET name = 'Túnez' WHERE code = 'TUN';
UPDATE teams SET name = 'Estados Unidos' WHERE code = 'USA';
UPDATE teams SET name = 'Uzbekistán' WHERE code = 'UZB';
UPDATE teams SET name = 'Haití' WHERE code = 'HAI';
UPDATE teams SET name = 'Irán' WHERE code = 'IRN';
UPDATE teams SET name = 'Senegal' WHERE code = 'SEN';
UPDATE teams SET name = 'Ghana' WHERE code = 'GHA';
UPDATE teams SET name = 'Australia' WHERE code = 'AUS';
UPDATE teams SET name = 'Austria' WHERE code = 'AUT';

-- Now sync stickers table team_name
UPDATE stickers SET team_name = t.name FROM teams t WHERE stickers.team_code = t.code AND stickers.team_name != t.name;
