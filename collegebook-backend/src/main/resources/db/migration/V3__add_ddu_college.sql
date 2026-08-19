-- Flyway Migration V3__add_ddu_college.sql
-- Add Dharmsinh Desai University - Nadiad

INSERT INTO colleges (name, short_name, slug, city, state, email_domains)
VALUES (
    'Dharmsinh Desai University - Nadiad',
    'DDU',
    'dharmsinh-desai-university-nadiad',
    'Nadiad',
    'Gujarat',
    ARRAY['ddu.ac.in']
)
ON CONFLICT (slug) DO NOTHING;
