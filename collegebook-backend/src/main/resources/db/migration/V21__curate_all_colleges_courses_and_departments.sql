-- Flyway Migration V21__curate_all_colleges_courses_and_departments.sql
-- 1. Update all colleges with accurate official email domains and details

UPDATE colleges SET email_domains = ARRAY['ddu.ac.in'] WHERE slug = 'dharmsinh-desai-university-nadiad';
UPDATE colleges SET email_domains = ARRAY['bvmengineering.ac.in', 'bvm.ac.in'] WHERE slug = 'birla-vishvakarma-mahavidyalaya-anand';
UPDATE colleges SET email_domains = ARRAY['gcet.ac.in', 'cvmu.edu.in'] WHERE slug = 'g-h-patel-college-of-engineering-technology';
UPDATE colleges SET email_domains = ARRAY['charusat.ac.in', 'charusat.edu.in'] WHERE slug = 'cspit-charusat-changa';
UPDATE colleges SET email_domains = ARRAY['charusat.ac.in', 'depstar.charusat.ac.in'] WHERE slug = 'depstar-charusat-changa';
UPDATE colleges SET email_domains = ARRAY['adit.ac.in', 'cvmu.edu.in'] WHERE slug = 'a-d-patel-institute-of-technology';
UPDATE colleges SET email_domains = ARRAY['mbit.edu.in', 'cvmu.edu.in'] WHERE slug = 'mbit-anand';
UPDATE colleges SET email_domains = ARRAY['nirmauni.ac.in'] WHERE slug = 'nirma-university-ahmedabad';
UPDATE colleges SET email_domains = ARRAY['ldce.ac.in'] WHERE slug = 'ld-college-of-engineering-ahmedabad';
UPDATE colleges SET email_domains = ARRAY['vgecg.ac.in'] WHERE slug = 'vishwakarma-government-engineering-college';
UPDATE colleges SET email_domains = ARRAY['daiict.ac.in'] WHERE slug = 'daiict-gandhinagar';
UPDATE colleges SET email_domains = ARRAY['iitgn.ac.in'] WHERE slug = 'iit-gandhinagar';
UPDATE colleges SET email_domains = ARRAY['pdeu.ac.in', 'pdpu.ac.in'] WHERE slug = 'pandit-deendayal-energy-university';
UPDATE colleges SET email_domains = ARRAY['ahduni.edu.in'] WHERE slug = 'seas-ahmedabad-university';
UPDATE colleges SET email_domains = ARRAY['indusuni.ac.in'] WHERE slug = 'indus-university-ahmedabad';
UPDATE colleges SET email_domains = ARRAY['silveroakuni.ac.in'] WHERE slug = 'silver-oak-university-ahmedabad';
UPDATE colleges SET email_domains = ARRAY['sal.edu.in'] WHERE slug = 'sal-institute-of-technology-ahmedabad';
UPDATE colleges SET email_domains = ARRAY['ljku.edu.in', 'ljiet.edu.in'] WHERE slug = 'lj-institute-of-engineering-technology';
UPDATE colleges SET email_domains = ARRAY['gecg28.ac.in'] WHERE slug = 'gec-gandhinagar';
UPDATE colleges SET email_domains = ARRAY['gecmodasa.ac.in'] WHERE slug = 'gec-modasa';
UPDATE colleges SET email_domains = ARRAY['msubaroda.ac.in'] WHERE slug = 'msu-baroda-faculty-of-tech-engg';
UPDATE colleges SET email_domains = ARRAY['svnit.ac.in'] WHERE slug = 'svnit-surat';
UPDATE colleges SET email_domains = ARRAY['iiitsurat.ac.in'] WHERE slug = 'iiit-surat';
UPDATE colleges SET email_domains = ARRAY['iiitvadodara.ac.in'] WHERE slug = 'iiit-vadodara';
UPDATE colleges SET email_domains = ARRAY['paruluniversity.ac.in'] WHERE slug = 'parul-university-vadodara';
UPDATE colleges SET email_domains = ARRAY['marwadiuniversity.ac.in'] WHERE slug = 'marwadi-university-rajkot';
UPDATE colleges SET email_domains = ARRAY['ssgec.ac.in'] WHERE slug = 'ssec-bhavnagar';
UPDATE colleges SET email_domains = ARRAY['lecm.ac.in'] WHERE slug = 'lukhdhirji-engineering-college-morbi';

-- IITs
UPDATE colleges SET email_domains = ARRAY['iitb.ac.in'] WHERE slug = 'iit-bombay';
UPDATE colleges SET email_domains = ARRAY['iitd.ac.in'] WHERE slug = 'iit-delhi';
UPDATE colleges SET email_domains = ARRAY['iitm.ac.in'] WHERE slug = 'iit-madras';
UPDATE colleges SET email_domains = ARRAY['iitk.ac.in'] WHERE slug = 'iit-kanpur';
UPDATE colleges SET email_domains = ARRAY['iitkgp.ac.in'] WHERE slug = 'iit-kharagpur';
UPDATE colleges SET email_domains = ARRAY['iitr.ac.in'] WHERE slug = 'iit-roorkee';
UPDATE colleges SET email_domains = ARRAY['iitg.ac.in'] WHERE slug = 'iit-guwahati';
UPDATE colleges SET email_domains = ARRAY['iith.ac.in'] WHERE slug = 'iit-hyderabad';
UPDATE colleges SET email_domains = ARRAY['iitbhu.ac.in'] WHERE slug = 'iit-bhu-varanasi';
UPDATE colleges SET email_domains = ARRAY['iitism.ac.in'] WHERE slug = 'iit-ism-dhanbad';
UPDATE colleges SET email_domains = ARRAY['iiti.ac.in'] WHERE slug = 'iit-indore';
UPDATE colleges SET email_domains = ARRAY['iitrpr.ac.in'] WHERE slug = 'iit-ropar';
UPDATE colleges SET email_domains = ARRAY['iitp.ac.in'] WHERE slug = 'iit-patna';
UPDATE colleges SET email_domains = ARRAY['iitbbs.ac.in'] WHERE slug = 'iit-bhubaneswar';
UPDATE colleges SET email_domains = ARRAY['iitmandi.ac.in'] WHERE slug = 'iit-mandi';
UPDATE colleges SET email_domains = ARRAY['iitj.ac.in'] WHERE slug = 'iit-jodhpur';
UPDATE colleges SET email_domains = ARRAY['iittp.ac.in'] WHERE slug = 'iit-tirupati';
UPDATE colleges SET email_domains = ARRAY['iitpkd.ac.in'] WHERE slug = 'iit-palakkad';
UPDATE colleges SET email_domains = ARRAY['iitgoa.ac.in'] WHERE slug = 'iit-goa';
UPDATE colleges SET email_domains = ARRAY['iitdh.ac.in'] WHERE slug = 'iit-dharwad';
UPDATE colleges SET email_domains = ARRAY['iitbhilai.ac.in'] WHERE slug = 'iit-bhilai';
UPDATE colleges SET email_domains = ARRAY['iitjammu.ac.in'] WHERE slug = 'iit-jammu';

-- NITs
UPDATE colleges SET email_domains = ARRAY['nitt.edu'] WHERE slug = 'nit-trichy';
UPDATE colleges SET email_domains = ARRAY['nitk.edu.in', 'nitk.ac.in'] WHERE slug = 'nit-surathkal';
UPDATE colleges SET email_domains = ARRAY['nitw.ac.in'] WHERE slug = 'nit-warangal';
UPDATE colleges SET email_domains = ARRAY['nitc.ac.in'] WHERE slug = 'nit-calicut';
UPDATE colleges SET email_domains = ARRAY['nitrkl.ac.in'] WHERE slug = 'nit-rourkela';
UPDATE colleges SET email_domains = ARRAY['vnit.ac.in'] WHERE slug = 'vnit-nagpur';
UPDATE colleges SET email_domains = ARRAY['mnit.ac.in'] WHERE slug = 'mnit-jaipur';
UPDATE colleges SET email_domains = ARRAY['mnnit.ac.in'] WHERE slug = 'mnnit-allahabad';
UPDATE colleges SET email_domains = ARRAY['nitkkr.ac.in'] WHERE slug = 'nit-kurukshetra';
UPDATE colleges SET email_domains = ARRAY['nitdgp.ac.in'] WHERE slug = 'nit-durgapur';
UPDATE colleges SET email_domains = ARRAY['nits.ac.in'] WHERE slug = 'nit-silchar';
UPDATE colleges SET email_domains = ARRAY['manit.ac.in'] WHERE slug = 'manit-bhopal';
UPDATE colleges SET email_domains = ARRAY['nitj.ac.in'] WHERE slug = 'nit-jalandhar';
UPDATE colleges SET email_domains = ARRAY['nitp.ac.in'] WHERE slug = 'nit-patna';
UPDATE colleges SET email_domains = ARRAY['nitrr.ac.in'] WHERE slug = 'nit-raipur';

-- BITS
UPDATE colleges SET email_domains = ARRAY['pilani.bits-pilani.ac.in', 'bits-pilani.ac.in'] WHERE slug = 'bits-pilani';
UPDATE colleges SET email_domains = ARRAY['goa.bits-pilani.ac.in', 'bits-pilani.ac.in'] WHERE slug = 'bits-pilani-goa';
UPDATE colleges SET email_domains = ARRAY['hyderabad.bits-pilani.ac.in', 'bits-pilani.ac.in'] WHERE slug = 'bits-pilani-hyderabad';

-- IIITs
UPDATE colleges SET email_domains = ARRAY['iiit.ac.in'] WHERE slug = 'iiit-hyderabad';
UPDATE colleges SET email_domains = ARRAY['iiitb.ac.in'] WHERE slug = 'iiit-bangalore';
UPDATE colleges SET email_domains = ARRAY['iiitd.ac.in'] WHERE slug = 'iiit-delhi';
UPDATE colleges SET email_domains = ARRAY['iiita.ac.in'] WHERE slug = 'iiit-allahabad';
UPDATE colleges SET email_domains = ARRAY['iiitm.ac.in'] WHERE slug = 'iiitm-gwalior';
UPDATE colleges SET email_domains = ARRAY['iiitl.ac.in'] WHERE slug = 'iiit-lucknow';
UPDATE colleges SET email_domains = ARRAY['iiitdm.ac.in'] WHERE slug = 'iiitdm-kancheepuram';
UPDATE colleges SET email_domains = ARRAY['iiitdmj.ac.in'] WHERE slug = 'iiitdm-jabalpur';
UPDATE colleges SET email_domains = ARRAY['iiitp.ac.in'] WHERE slug = 'iiit-pune';

-- Premier
UPDATE colleges SET email_domains = ARRAY['dtu.ac.in'] WHERE slug = 'dtu-delhi';
UPDATE colleges SET email_domains = ARRAY['nsut.ac.in'] WHERE slug = 'nsut-delhi';
UPDATE colleges SET email_domains = ARRAY['coeptech.ac.in', 'coep.ac.in'] WHERE slug = 'coep-pune';
UPDATE colleges SET email_domains = ARRAY['vjti.ac.in'] WHERE slug = 'vjti-mumbai';
UPDATE colleges SET email_domains = ARRAY['vit.ac.in'] WHERE slug = 'vit-vellore';
UPDATE colleges SET email_domains = ARRAY['manipal.edu'] WHERE slug = 'manipal-institute-of-technology';
UPDATE colleges SET email_domains = ARRAY['srmist.edu.in'] WHERE slug = 'srmist-chennai';
UPDATE colleges SET email_domains = ARRAY['thapar.edu'] WHERE slug = 'thapar-university';
UPDATE colleges SET email_domains = ARRAY['psgtech.edu'] WHERE slug = 'psg-college-of-technology';
UPDATE colleges SET email_domains = ARRAY['rvce.edu.in'] WHERE slug = 'rv-college-of-engineering';
UPDATE colleges SET email_domains = ARRAY['bmsce.ac.in'] WHERE slug = 'bms-college-of-engineering';
UPDATE colleges SET email_domains = ARRAY['pes.edu'] WHERE slug = 'pes-university-bangalore';
UPDATE colleges SET email_domains = ARRAY['jadavpuruniversity.in'] WHERE slug = 'jadavpur-university';
UPDATE colleges SET email_domains = ARRAY['annauniv.edu'] WHERE slug = 'ceg-anna-university';


-- 2. Standardize degree courses
-- Insert clean degree courses for all colleges if not present
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Technology', 'B.Tech', 4
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Technology', 'M.Tech', 2
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

-- BCA & MCA for colleges that have Computer Applications
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Computer Applications', 'BCA', 3
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'cspit-charusat-changa', 'depstar-charusat-changa',
    'nirma-university-ahmedabad', 'indus-university-ahmedabad', 'silveroakuni.ac.in',
    'silver-oak-university-ahmedabad', 'parul-university-vadodara', 'marwadi-university-rajkot',
    'lj-institute-of-engineering-technology'
)
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Computer Applications', 'MCA', 2
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'cspit-charusat-changa', 'depstar-charusat-changa',
    'nirma-university-ahmedabad', 'ld-college-of-engineering-ahmedabad', 'vishwakarma-government-engineering-college',
    'indus-university-ahmedabad', 'silver-oak-university-ahmedabad', 'parul-university-vadodara',
    'marwadi-university-rajkot', 'lj-institute-of-engineering-technology', 'msu-baroda-faculty-of-tech-engg',
    'nit-trichy', 'nit-surathkal', 'nit-warangal', 'nit-calicut', 'nit-rourkela', 'mnnit-allahabad', 'mnit-jaipur'
)
ON CONFLICT (college_id, name) DO NOTHING;

-- BBA & MBA for colleges offering Management
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Business Administration', 'BBA', 3
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'cspit-charusat-changa',
    'pandit-deendayal-energy-university', 'indus-university-ahmedabad', 'silver-oak-university-ahmedabad',
    'parul-university-vadodara', 'marwadi-university-rajkot'
)
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Business Administration', 'MBA', 2
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'cspit-charusat-changa',
    'pandit-deendayal-energy-university', 'indus-university-ahmedabad', 'silver-oak-university-ahmedabad',
    'parul-university-vadodara', 'marwadi-university-rajkot', 'iit-bombay', 'iit-delhi', 'iit-madras',
    'iit-kharagpur', 'iit-roorkee', 'bits-pilani', 'nit-trichy', 'dtu-delhi'
)
ON CONFLICT (college_id, name) DO NOTHING;

-- Pharmacy & Dental
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Pharmacy', 'B.Pharm', 4
FROM colleges c
WHERE c.slug IN ('dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'parul-university-vadodara', 'bits-pilani')
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Dental Surgery', 'BDS', 5
FROM colleges c
WHERE c.slug IN ('dharmsinh-desai-university-nadiad')
ON CONFLICT (college_id, name) DO NOTHING;

-- PhD
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Doctor of Philosophy', 'PhD', 5
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;


-- 3. Reset existing departments table and reseed with exact authentic departments per institution
-- Temporarily nullify foreign key references from profiles so departments can be cleanly reset
UPDATE profiles SET department_id = NULL;
DELETE FROM departments;

-- =========================================================================
-- DDU Nadiad (Dharmsinh Desai University)
-- =========================================================================
-- DDU B.Tech Departments: IT, CE, EC, Chemical, Civil, Mechanical, IC
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Information Technology', 'IT'),
        ('Computer Engineering', 'CE'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Chemical Engineering', 'Chemical'),
        ('Civil Engineering', 'Civil'),
        ('Mechanical Engineering', 'Mechanical'),
        ('Instrumentation & Control Engineering', 'IC')
) AS d(name, short_name)
WHERE col.slug = 'dharmsinh-desai-university-nadiad' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- DDU M.Tech Departments
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Information Technology', 'IT'),
        ('Computer Engineering', 'CE'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Chemical Engineering', 'Chemical'),
        ('Civil Engineering', 'Civil')
) AS d(name, short_name)
WHERE col.slug = 'dharmsinh-desai-university-nadiad' AND c.short_name = 'M.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- DA-IICT Gandhinagar (Dhirubhai Ambani Institute of ICT)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Information and Communication Technology', 'ICT'),
        ('ICT with Minor in Computational Science', 'ICT-CS'),
        ('Mathematics and Computing', 'MnC'),
        ('Electronics and VLSI Design', 'EVD')
) AS d(name, short_name)
WHERE col.slug = 'daiict-gandhinagar' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- BVM Anand (Birla Vishvakarma Mahavidyalaya)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Engineering', 'CE'),
        ('Information Technology', 'IT'),
        ('Electronics Engineering', 'EL'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Production Engineering', 'Production'),
        ('Structural Engineering', 'Structural')
) AS d(name, short_name)
WHERE col.slug = 'birla-vishvakarma-mahavidyalaya-anand' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- GCET Anand (G H Patel College of Engineering & Technology)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Engineering', 'CE'),
        ('Information Technology', 'IT'),
        ('Computer Science & Design', 'CSD'),
        ('Computer Science & Engineering (IoT)', 'CSE-IoT'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Mechatronics Engineering', 'Mechatronics')
) AS d(name, short_name)
WHERE col.slug = 'g-h-patel-college-of-engineering-technology' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- CHARUSAT (CSPIT & DEPSTAR, Changa)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Engineering', 'CE'),
        ('Information Technology', 'IT'),
        ('Computer Science & Engineering', 'CSE'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil')
) AS d(name, short_name)
WHERE col.slug = 'cspit-charusat-changa' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Information Technology', 'IT'),
        ('Computer Engineering', 'CE')
) AS d(name, short_name)
WHERE col.slug = 'depstar-charusat-changa' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- Nirma University - Ahmedabad
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Artificial Intelligence & Machine Learning', 'AI-ML'),
        ('Information Technology', 'IT'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical')
) AS d(name, short_name)
WHERE col.slug = 'nirma-university-ahmedabad' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- LDCE - Ahmedabad (L.D. College of Engineering)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Engineering', 'CE'),
        ('Information Technology', 'IT'),
        ('Artificial Intelligence & Data Science', 'AI-DS'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Biomedical Engineering', 'Biomedical'),
        ('Instrumentation & Control Engineering', 'IC'),
        ('Automobile Engineering', 'Automobile'),
        ('Environmental Engineering', 'Environmental'),
        ('Textile Technology', 'Textile'),
        ('Rubber Technology', 'Rubber'),
        ('Plastic Technology', 'Plastic')
) AS d(name, short_name)
WHERE col.slug = 'ld-college-of-engineering-ahmedabad' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- VGEC - Chandkheda (Vishwakarma Govt Engg College)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Engineering', 'CE'),
        ('Information Technology', 'IT'),
        ('Computer Science & Engineering', 'CSE'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Instrumentation & Control Engineering', 'IC'),
        ('Power Electronics', 'Power Electronics')
) AS d(name, short_name)
WHERE col.slug = 'vishwakarma-government-engineering-college' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- PDEU - Gandhinagar (Pandit Deendayal Energy University)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Information & Communication Technology', 'ICT'),
        ('Electronics & Communication Engineering', 'EC'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Petroleum Engineering', 'Petroleum')
) AS d(name, short_name)
WHERE col.slug = 'pandit-deendayal-energy-university' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- SVNIT Surat
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Artificial Intelligence', 'AI'),
        ('Electronics & Communication Engineering', 'ECE'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical')
) AS d(name, short_name)
WHERE col.slug = 'svnit-surat' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- IIIT Surat & IIIT Vadodara
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Electronics & Communication Engineering', 'ECE')
) AS d(name, short_name)
WHERE col.slug = 'iiit-surat' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Information Technology', 'IT')
) AS d(name, short_name)
WHERE col.slug = 'iiit-vadodara' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- MSU Baroda (Faculty of Tech & Engg)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Metallurgical Engineering', 'Metallurgy'),
        ('Textile Engineering', 'Textile Engg'),
        ('Textile Technology', 'Textile Tech'),
        ('Textile Chemistry', 'Textile Chem')
) AS d(name, short_name)
WHERE col.slug = 'msu-baroda-faculty-of-tech-engg' AND c.short_name = 'B.Tech'
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- IITs (Standard Engineering & Science Departments for all 23 IITs)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Data Science & Artificial Intelligence', 'DSAI'),
        ('Electrical Engineering', 'EE'),
        ('Electronics & Communication Engineering', 'ECE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Aerospace Engineering', 'Aerospace'),
        ('Materials Science & Metallurgical Engineering', 'Materials'),
        ('Biotechnology & Biochemical Engineering', 'Biotech'),
        ('Engineering Physics', 'EP'),
        ('Mathematics & Computing', 'MnC')
) AS d(name, short_name)
WHERE col.slug LIKE 'iit-%' AND c.short_name IN ('B.Tech', 'M.Tech')
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- NITs (Standard Departments for Top NITs)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Artificial Intelligence & Machine Learning', 'AI-ML'),
        ('Electronics & Communication Engineering', 'ECE'),
        ('Electrical & Electronics Engineering', 'EEE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Metallurgical & Materials Engineering', 'Metallurgy'),
        ('Biotechnology', 'Biotech'),
        ('Production Engineering', 'Production')
) AS d(name, short_name)
WHERE (col.slug LIKE 'nit-%' OR col.slug IN ('vnit-nagpur', 'mnit-jaipur', 'mnnit-allahabad', 'manit-bhopal'))
  AND c.short_name IN ('B.Tech', 'M.Tech')
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- BITS Pilani Campuses
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science', 'CS'),
        ('Electronics & Communication', 'ECE'),
        ('Electrical & Electronics', 'EEE'),
        ('Electronics & Instrumentation', 'ENI'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Manufacturing Engineering', 'Manufacturing')
) AS d(name, short_name)
WHERE col.slug LIKE 'bits-%' AND c.short_name IN ('B.Tech', 'M.Tech')
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- Top IIITs (Hyderabad, Bangalore, Delhi, Allahabad, Gwalior, Lucknow, Pune)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Electronics & Communication Engineering', 'ECE'),
        ('Information Technology', 'IT'),
        ('Artificial Intelligence & Data Science', 'AI-DS')
) AS d(name, short_name)
WHERE col.slug LIKE 'iiit%' AND c.short_name IN ('B.Tech', 'M.Tech')
ON CONFLICT (course_id, name) DO NOTHING;

-- =========================================================================
-- Premier State & Private Universities (DTU, NSUT, COEP, VJTI, VIT, MIT Manipal, etc.)
-- =========================================================================
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, d.name, d.short_name
FROM courses c
JOIN colleges col ON c.college_id = col.id
CROSS JOIN (
    VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Information Technology', 'IT'),
        ('Artificial Intelligence & Machine Learning', 'AI-ML'),
        ('Electronics & Communication Engineering', 'ECE'),
        ('Electrical Engineering', 'EE'),
        ('Mechanical Engineering', 'ME'),
        ('Civil Engineering', 'Civil'),
        ('Chemical Engineering', 'Chemical'),
        ('Biotechnology', 'Biotech')
) AS d(name, short_name)
WHERE col.slug IN (
    'dtu-delhi', 'nsut-delhi', 'coep-pune', 'vjti-mumbai', 'vit-vellore',
    'manipal-institute-of-technology', 'srmist-chennai', 'thapar-university',
    'psg-college-of-technology', 'rv-college-of-engineering', 'bms-college-of-engineering',
    'pes-university-bangalore', 'jadavpur-university', 'ceg-anna-university',
    'a-d-patel-institute-of-technology', 'mbit-anand', 'indus-university-ahmedabad',
    'silver-oak-university-ahmedabad', 'sal-institute-of-technology-ahmedabad',
    'lj-institute-of-engineering-technology', 'parul-university-vadodara',
    'marwadi-university-rajkot', 'gec-gandhinagar', 'gec-modasa', 'ssec-bhavnagar',
    'lukhdhirji-engineering-college-morbi', 'seas-ahmedabad-university'
) AND c.short_name IN ('B.Tech', 'M.Tech')
ON CONFLICT (course_id, name) DO NOTHING;

-- Fix any profiles that have a course but no department assigned yet by matching first available department
UPDATE profiles p
SET department_id = (
    SELECT d.id FROM departments d WHERE d.course_id = p.course_id ORDER BY d.created_at ASC LIMIT 1
)
WHERE p.course_id IS NOT NULL AND p.department_id IS NULL
  AND EXISTS (SELECT 1 FROM departments d WHERE d.course_id = p.course_id);
