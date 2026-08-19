-- Update DA-IICT to DAU (Dhirubhai Ambani University)
UPDATE colleges 
SET name = 'Dhirubhai Ambani University - Gandhinagar',
    short_name = 'DAU',
    slug = 'dau-gandhinagar',
    email_domains = ARRAY['dau.ac.in', 'daiict.ac.in']
WHERE slug = 'daiict-gandhinagar' OR short_name = 'DA-IICT';
