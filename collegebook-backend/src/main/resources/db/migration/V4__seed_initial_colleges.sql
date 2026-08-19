-- Flyway Migration V4__seed_initial_colleges.sql
-- Seed initial colleges including DDU, Nirma, DA-IICT, and premier Indian institutes

INSERT INTO colleges (name, short_name, slug, city, state, email_domains)
VALUES 
    ('Dharmsinh Desai University - Nadiad', 'DDU', 'dharmsinh-desai-university-nadiad', 'Nadiad', 'Gujarat', ARRAY['ddu.ac.in']),
    ('Nirma University - Ahmedabad', 'Nirma', 'nirma-university-ahmedabad', 'Ahmedabad', 'Gujarat', ARRAY['nirmauni.ac.in']),
    ('Dhirubhai Ambani Institute of Information and Communication Technology - Gandhinagar', 'DA-IICT', 'daiict-gandhinagar', 'Gandhinagar', 'Gujarat', ARRAY['daiict.ac.in']),
    ('Indian Institute of Technology Delhi', 'IIT-D', 'iit-delhi', 'New Delhi', 'Delhi', ARRAY['iitd.ac.in']),
    ('Indian Institute of Technology Bombay', 'IIT-B', 'iit-bombay', 'Mumbai', 'Maharashtra', ARRAY['iitb.ac.in']),
    ('Indian Institute of Technology Madras', 'IIT-M', 'iit-madras', 'Chennai', 'Tamil Nadu', ARRAY['iitm.ac.in']),
    ('Indian Institute of Technology Kanpur', 'IIT-K', 'iit-kanpur', 'Kanpur', 'Uttar Pradesh', ARRAY['iitk.ac.in']),
    ('Birla Institute of Technology and Science Pilani', 'BITS-P', 'bits-pilani', 'Pilani', 'Rajasthan', ARRAY['pilani.bits-pilani.ac.in', 'bits-pilani.ac.in']),
    ('National Institute of Technology Tiruchirappalli', 'NIT-T', 'nit-trichy', 'Tiruchirappalli', 'Tamil Nadu', ARRAY['nitt.edu']),
    ('International Institute of Information Technology Hyderabad', 'IIIT-H', 'iiit-hyderabad', 'Hyderabad', 'Telangana', ARRAY['iiit.ac.in']),
    ('Delhi Technological University', 'DTU', 'dtu-delhi', 'New Delhi', 'Delhi', ARRAY['dtu.ac.in']),
    ('Vellore Institute of Technology', 'VIT', 'vit-vellore', 'Vellore', 'Tamil Nadu', ARRAY['vit.ac.in'])
ON CONFLICT (slug) DO NOTHING;

-- Seed default courses for newly added colleges
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Computer Engineering', 'B.Tech CE', 4
FROM colleges c WHERE c.slug IN ('dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'daiict-gandhinagar')
ON CONFLICT DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Information Technology', 'B.Tech IT', 4
FROM colleges c WHERE c.slug IN ('dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'daiict-gandhinagar')
ON CONFLICT DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Computer Science', 'B.Tech CSE', 4
FROM colleges c WHERE c.slug NOT IN ('dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'daiict-gandhinagar')
ON CONFLICT DO NOTHING;
