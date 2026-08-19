-- Flyway Migration V12__comprehensive_colleges_and_college_requests.sql
-- 1. College Requests table for unlisted colleges
CREATE TABLE IF NOT EXISTS college_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    requester_email VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert comprehensive list of colleges: Gujarat (Ahmedabad, Nadiad, Anand, etc.), IITs, NITs, BITS, IIITs, Premier Colleges
INSERT INTO colleges (name, short_name, slug, city, state, email_domains)
VALUES
    -- Nadiad & Anand / Vallabh Vidyanagar / Changa
    ('Dharmsinh Desai University - Nadiad', 'DDU', 'dharmsinh-desai-university-nadiad', 'Nadiad', 'Gujarat', ARRAY['ddu.ac.in']),
    ('Birla Vishvakarma Mahavidyalaya - Anand', 'BVM', 'birla-vishvakarma-mahavidyalaya-anand', 'Anand', 'Gujarat', ARRAY['bvmengineering.ac.in', 'bvm.ac.in']),
    ('G H Patel College of Engineering & Technology - Anand', 'GCET', 'g-h-patel-college-of-engineering-technology', 'Anand', 'Gujarat', ARRAY['gcet.ac.in']),
    ('Chandubhai S Patel Institute of Technology (CHARUSAT) - Changa', 'CSPIT', 'cspit-charusat-changa', 'Anand', 'Gujarat', ARRAY['charusat.ac.in']),
    ('Devang Patel Institute of Advance Technology and Research (CHARUSAT)', 'DEPSTAR', 'depstar-charusat-changa', 'Anand', 'Gujarat', ARRAY['charusat.ac.in', 'depstar.charusat.ac.in']),
    ('A D Patel Institute of Technology - New Vallabh Vidyanagar', 'ADIT', 'a-d-patel-institute-of-technology', 'Anand', 'Gujarat', ARRAY['adit.ac.in', 'cvmu.edu.in']),
    ('Madhuben and Bhanubhai Patel Institute of Technology - Anand', 'MBIT', 'mbit-anand', 'Anand', 'Gujarat', ARRAY['mbit.edu.in', 'cvmu.edu.in']),

    -- Ahmedabad & Gandhinagar
    ('Nirma University (Institute of Technology) - Ahmedabad', 'Nirma', 'nirma-university-ahmedabad', 'Ahmedabad', 'Gujarat', ARRAY['nirmauni.ac.in']),
    ('L.D. College of Engineering - Ahmedabad', 'LDCE', 'ld-college-of-engineering-ahmedabad', 'Ahmedabad', 'Gujarat', ARRAY['ldce.ac.in']),
    ('Vishwakarma Government Engineering College - Chandkheda', 'VGEC', 'vishwakarma-government-engineering-college', 'Ahmedabad', 'Gujarat', ARRAY['vgecg.ac.in']),
    ('Dhirubhai Ambani Institute of Information and Communication Technology - Gandhinagar', 'DA-IICT', 'daiict-gandhinagar', 'Gandhinagar', 'Gujarat', ARRAY['daiict.ac.in']),
    ('Indian Institute of Technology Gandhinagar', 'IIT-GN', 'iit-gandhinagar', 'Gandhinagar', 'Gujarat', ARRAY['iitgn.ac.in']),
    ('Pandit Deendayal Energy University - Gandhinagar', 'PDEU', 'pandit-deendayal-energy-university', 'Gandhinagar', 'Gujarat', ARRAY['pdeu.ac.in', 'pdpu.ac.in']),
    ('School of Engineering and Applied Science (Ahmedabad University)', 'SEAS-AU', 'seas-ahmedabad-university', 'Ahmedabad', 'Gujarat', ARRAY['ahduni.edu.in']),
    ('Indus University - Ahmedabad', 'Indus', 'indus-university-ahmedabad', 'Ahmedabad', 'Gujarat', ARRAY['indusuni.ac.in']),
    ('Silver Oak University - Ahmedabad', 'Silver Oak', 'silver-oak-university-ahmedabad', 'Ahmedabad', 'Gujarat', ARRAY['silveroakuni.ac.in']),
    ('SAL Institute of Technology & Engineering Research - Ahmedabad', 'SAL', 'sal-institute-of-technology-ahmedabad', 'Ahmedabad', 'Gujarat', ARRAY['sal.edu.in']),
    ('L.J. Institute of Engineering and Technology - Ahmedabad', 'LJ-IET', 'lj-institute-of-engineering-technology', 'Ahmedabad', 'Gujarat', ARRAY['ljku.edu.in', 'ljiet.edu.in']),
    ('Government Engineering College - Gandhinagar', 'GEC-G', 'gec-gandhinagar', 'Gandhinagar', 'Gujarat', ARRAY['gecg28.ac.in']),
    ('Government Engineering College - Modasa', 'GEC-Modasa', 'gec-modasa', 'Modasa', 'Gujarat', ARRAY['gecmodasa.ac.in']),

    -- Top Gujarat Universities
    ('Maharaja Sayajirao University of Baroda (FTE) - Vadodara', 'MSU', 'msu-baroda-faculty-of-tech-engg', 'Vadodara', 'Gujarat', ARRAY['msubaroda.ac.in']),
    ('Sardar Vallabhbhai National Institute of Technology - Surat', 'SVNIT', 'svnit-surat', 'Surat', 'Gujarat', ARRAY['svnit.ac.in']),
    ('Indian Institute of Information Technology Surat', 'IIIT-Surat', 'iiit-surat', 'Surat', 'Gujarat', ARRAY['iiitsurat.ac.in']),
    ('Indian Institute of Information Technology Vadodara', 'IIIT-Vadodara', 'iiit-vadodara', 'Gandhinagar', 'Gujarat', ARRAY['iiitvadodara.ac.in']),
    ('Parul Institute of Engineering and Technology - Vadodara', 'Parul', 'parul-university-vadodara', 'Vadodara', 'Gujarat', ARRAY['paruluniversity.ac.in']),
    ('Marwadi University - Rajkot', 'Marwadi', 'marwadi-university-rajkot', 'Rajkot', 'Gujarat', ARRAY['marwadiuniversity.ac.in']),
    ('Shantilal Shah Engineering College - Bhavnagar', 'SSEC', 'ssec-bhavnagar', 'Bhavnagar', 'Gujarat', ARRAY['ssgec.ac.in']),
    ('Lukhdhirji Engineering College - Morbi', 'LE-Morbi', 'lukhdhirji-engineering-college-morbi', 'Morbi', 'Gujarat', ARRAY['lecm.ac.in']),

    -- All 23 Indian Institutes of Technology (IITs)
    ('Indian Institute of Technology Bombay', 'IIT-B', 'iit-bombay', 'Mumbai', 'Maharashtra', ARRAY['iitb.ac.in']),
    ('Indian Institute of Technology Delhi', 'IIT-D', 'iit-delhi', 'New Delhi', 'Delhi', ARRAY['iitd.ac.in']),
    ('Indian Institute of Technology Madras', 'IIT-M', 'iit-madras', 'Chennai', 'Tamil Nadu', ARRAY['iitm.ac.in']),
    ('Indian Institute of Technology Kanpur', 'IIT-K', 'iit-kanpur', 'Kanpur', 'Uttar Pradesh', ARRAY['iitk.ac.in']),
    ('Indian Institute of Technology Kharagpur', 'IIT-KGP', 'iit-kharagpur', 'Kharagpur', 'West Bengal', ARRAY['iitkgp.ac.in']),
    ('Indian Institute of Technology Roorkee', 'IIT-R', 'iit-roorkee', 'Roorkee', 'Uttarakhand', ARRAY['iitr.ac.in']),
    ('Indian Institute of Technology Guwahati', 'IIT-G', 'iit-guwahati', 'Guwahati', 'Assam', ARRAY['iitg.ac.in']),
    ('Indian Institute of Technology Hyderabad', 'IIT-H', 'iit-hyderabad', 'Hyderabad', 'Telangana', ARRAY['iith.ac.in']),
    ('Indian Institute of Technology (BHU) Varanasi', 'IIT-BHU', 'iit-bhu-varanasi', 'Varanasi', 'Uttar Pradesh', ARRAY['iitbhu.ac.in']),
    ('Indian Institute of Technology (ISM) Dhanbad', 'IIT-ISM', 'iit-ism-dhanbad', 'Dhanbad', 'Jharkhand', ARRAY['iitism.ac.in']),
    ('Indian Institute of Technology Indore', 'IIT-Indore', 'iit-indore', 'Indore', 'Madhya Pradesh', ARRAY['iiti.ac.in']),
    ('Indian Institute of Technology Ropar', 'IIT-Ropar', 'iit-ropar', 'Rupnagar', 'Punjab', ARRAY['iitrpr.ac.in']),
    ('Indian Institute of Technology Patna', 'IIT-Patna', 'iit-patna', 'Patna', 'Bihar', ARRAY['iitp.ac.in']),
    ('Indian Institute of Technology Bhubaneswar', 'IIT-BBS', 'iit-bhubaneswar', 'Bhubaneswar', 'Odisha', ARRAY['iitbbs.ac.in']),
    ('Indian Institute of Technology Mandi', 'IIT-Mandi', 'iit-mandi', 'Mandi', 'Himachal Pradesh', ARRAY['iitmandi.ac.in']),
    ('Indian Institute of Technology Jodhpur', 'IIT-Jodhpur', 'iit-jodhpur', 'Jodhpur', 'Rajasthan', ARRAY['iitj.ac.in']),
    ('Indian Institute of Technology Tirupati', 'IIT-Tirupati', 'iit-tirupati', 'Tirupati', 'Andhra Pradesh', ARRAY['iittp.ac.in']),
    ('Indian Institute of Technology Palakkad', 'IIT-Palakkad', 'iit-palakkad', 'Palakkad', 'Kerala', ARRAY['iitpkd.ac.in']),
    ('Indian Institute of Technology Goa', 'IIT-Goa', 'iit-goa', 'Ponda', 'Goa', ARRAY['iitgoa.ac.in']),
    ('Indian Institute of Technology Dharwad', 'IIT-Dharwad', 'iit-dharwad', 'Dharwad', 'Karnataka', ARRAY['iitdh.ac.in']),
    ('Indian Institute of Technology Bhilai', 'IIT-Bhilai', 'iit-bhilai', 'Bhilai', 'Chhattisgarh', ARRAY['iitbhilai.ac.in']),
    ('Indian Institute of Technology Jammu', 'IIT-Jammu', 'iit-jammu', 'Jammu', 'Jammu and Kashmir', ARRAY['iitjammu.ac.in']),

    -- Top NITs
    ('National Institute of Technology Tiruchirappalli', 'NIT-T', 'nit-trichy', 'Tiruchirappalli', 'Tamil Nadu', ARRAY['nitt.edu']),
    ('National Institute of Technology Karnataka Surathkal', 'NIT-K', 'nit-surathkal', 'Surathkal', 'Karnataka', ARRAY['nitk.edu.in', 'nitk.ac.in']),
    ('National Institute of Technology Warangal', 'NIT-W', 'nit-warangal', 'Warangal', 'Telangana', ARRAY['nitw.ac.in']),
    ('National Institute of Technology Calicut', 'NIT-C', 'nit-calicut', 'Calicut', 'Kerala', ARRAY['nitc.ac.in']),
    ('National Institute of Technology Rourkela', 'NIT-RKL', 'nit-rourkela', 'Rourkela', 'Odisha', ARRAY['nitrkl.ac.in']),
    ('Visvesvaraya National Institute of Technology - Nagpur', 'VNIT', 'vnit-nagpur', 'Nagpur', 'Maharashtra', ARRAY['vnit.ac.in']),
    ('Malaviya National Institute of Technology Jaipur', 'MNIT', 'mnit-jaipur', 'Jaipur', 'Rajasthan', ARRAY['mnit.ac.in']),
    ('Motilal Nehru National Institute of Technology Allahabad', 'MNNIT', 'mnnit-allahabad', 'Prayagraj', 'Uttar Pradesh', ARRAY['mnnit.ac.in']),
    ('National Institute of Technology Kurukshetra', 'NIT-KKR', 'nit-kurukshetra', 'Kurukshetra', 'Haryana', ARRAY['nitkkr.ac.in']),
    ('National Institute of Technology Durgapur', 'NIT-DGP', 'nit-durgapur', 'Durgapur', 'West Bengal', ARRAY['nitdgp.ac.in']),
    ('National Institute of Technology Silchar', 'NIT-Silchar', 'nit-silchar', 'Silchar', 'Assam', ARRAY['nits.ac.in']),
    ('Maulana Azad National Institute of Technology Bhopal', 'MANIT', 'manit-bhopal', 'Bhopal', 'Madhya Pradesh', ARRAY['manit.ac.in']),
    ('Dr B R Ambedkar National Institute of Technology Jalandhar', 'NITJ', 'nit-jalandhar', 'Jalandhar', 'Punjab', ARRAY['nitj.ac.in']),
    ('National Institute of Technology Patna', 'NIT-Patna', 'nit-patna', 'Patna', 'Bihar', ARRAY['nitp.ac.in']),
    ('National Institute of Technology Raipur', 'NIT-Raipur', 'nit-raipur', 'Raipur', 'Chhattisgarh', ARRAY['nitrr.ac.in']),

    -- BITS Pilani Campuses
    ('Birla Institute of Technology and Science Pilani', 'BITS-P', 'bits-pilani', 'Pilani', 'Rajasthan', ARRAY['pilani.bits-pilani.ac.in', 'bits-pilani.ac.in']),
    ('BITS Pilani - K K Birla Goa Campus', 'BITS-Goa', 'bits-pilani-goa', 'Zuarinagar', 'Goa', ARRAY['goa.bits-pilani.ac.in', 'bits-pilani.ac.in']),
    ('BITS Pilani - Hyderabad Campus', 'BITS-Hyd', 'bits-pilani-hyderabad', 'Hyderabad', 'Telangana', ARRAY['hyderabad.bits-pilani.ac.in', 'bits-pilani.ac.in']),

    -- Top IIITs
    ('International Institute of Information Technology Hyderabad', 'IIIT-H', 'iiit-hyderabad', 'Hyderabad', 'Telangana', ARRAY['iiit.ac.in']),
    ('International Institute of Information Technology Bangalore', 'IIIT-B', 'iiit-bangalore', 'Bangalore', 'Karnataka', ARRAY['iiitb.ac.in']),
    ('Indraprastha Institute of Information Technology Delhi', 'IIIT-D', 'iiit-delhi', 'New Delhi', 'Delhi', ARRAY['iiitd.ac.in']),
    ('Indian Institute of Information Technology Allahabad', 'IIIT-A', 'iiit-allahabad', 'Prayagraj', 'Uttar Pradesh', ARRAY['iiita.ac.in']),
    ('ABV - Indian Institute of Information Technology and Management Gwalior', 'IIITM-G', 'iiitm-gwalior', 'Gwalior', 'Madhya Pradesh', ARRAY['iiitm.ac.in']),
    ('Indian Institute of Information Technology Lucknow', 'IIIT-L', 'iiit-lucknow', 'Lucknow', 'Uttar Pradesh', ARRAY['iiitl.ac.in']),
    ('IIITDM Kancheepuram', 'IIITDM-K', 'iiitdm-kancheepuram', 'Chennai', 'Tamil Nadu', ARRAY['iiitdm.ac.in']),
    ('IIITDM Jabalpur', 'IIITDM-J', 'iiitdm-jabalpur', 'Jabalpur', 'Madhya Pradesh', ARRAY['iiitdmj.ac.in']),
    ('Indian Institute of Information Technology Pune', 'IIIT-Pune', 'iiit-pune', 'Pune', 'Maharashtra', ARRAY['iiitp.ac.in']),

    -- Top Famous Universities and Engineering Institutes
    ('Delhi Technological University', 'DTU', 'dtu-delhi', 'New Delhi', 'Delhi', ARRAY['dtu.ac.in']),
    ('Netaji Subhas University of Technology - Delhi', 'NSUT', 'nsut-delhi', 'New Delhi', 'Delhi', ARRAY['nsut.ac.in']),
    ('COEP Technological University - Pune', 'COEP', 'coep-pune', 'Pune', 'Maharashtra', ARRAY['coeptech.ac.in', 'coep.ac.in']),
    ('Veermata Jijabai Technological Institute - Mumbai', 'VJTI', 'vjti-mumbai', 'Mumbai', 'Maharashtra', ARRAY['vjti.ac.in']),
    ('Vellore Institute of Technology - Vellore', 'VIT', 'vit-vellore', 'Vellore', 'Tamil Nadu', ARRAY['vit.ac.in']),
    ('Manipal Institute of Technology - Manipal', 'MIT-Manipal', 'manipal-institute-of-technology', 'Manipal', 'Karnataka', ARRAY['manipal.edu']),
    ('SRM Institute of Science and Technology - Chennai', 'SRM', 'srmist-chennai', 'Chennai', 'Tamil Nadu', ARRAY['srmist.edu.in']),
    ('Thapar Institute of Engineering and Technology - Patiala', 'TIET', 'thapar-university', 'Patiala', 'Punjab', ARRAY['thapar.edu']),
    ('PSG College of Technology - Coimbatore', 'PSG Tech', 'psg-college-of-technology', 'Coimbatore', 'Tamil Nadu', ARRAY['psgtech.edu']),
    ('R.V. College of Engineering - Bangalore', 'RVCE', 'rv-college-of-engineering', 'Bangalore', 'Karnataka', ARRAY['rvce.edu.in']),
    ('B.M.S. College of Engineering - Bangalore', 'BMSCE', 'bms-college-of-engineering', 'Bangalore', 'Karnataka', ARRAY['bmsce.ac.in']),
    ('PES University - Bangalore', 'PESU', 'pes-university-bangalore', 'Bangalore', 'Karnataka', ARRAY['pes.edu']),
    ('Jadavpur University - Faculty of Engg & Tech', 'JU', 'jadavpur-university', 'Kolkata', 'West Bengal', ARRAY['jadavpuruniversity.in']),
    ('College of Engineering Guindy (Anna University) - Chennai', 'CEG', 'ceg-anna-university', 'Chennai', 'Tamil Nadu', ARRAY['annauniv.edu'])
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    email_domains = EXCLUDED.email_domains;

-- 3. Seed extensive engineering courses across colleges
-- Computer Science / Engineering / IT (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Computer Science & Engineering', 'B.Tech CSE', 4
FROM colleges c
ON CONFLICT DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Information Technology', 'B.Tech IT', 4
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'birla-vishvakarma-mahavidyalaya-anand', 'g-h-patel-college-of-engineering-technology',
    'cspit-charusat-changa', 'depstar-charusat-changa', 'a-d-patel-institute-of-technology', 'mbit-anand',
    'nirma-university-ahmedabad', 'ld-college-of-engineering-ahmedabad', 'vishwakarma-government-engineering-college',
    'daiict-gandhinagar', 'pandit-deendayal-energy-university', 'indus-university-ahmedabad', 'silver-oak-university-ahmedabad',
    'sal-institute-of-technology-ahmedabad', 'lj-institute-of-engineering-technology', 'msu-baroda-faculty-of-tech-engg',
    'svnit-surat', 'iiit-surat', 'iiit-vadodara', 'parul-university-vadodara', 'marwadi-university-rajkot',
    'nit-trichy', 'nit-surathkal', 'nit-warangal', 'iiit-hyderabad', 'iiit-bangalore', 'iiit-delhi', 'iiit-allahabad',
    'dtu-delhi', 'nsut-delhi', 'vit-vellore', 'manipal-institute-of-technology', 'rv-college-of-engineering'
)
ON CONFLICT DO NOTHING;

-- Artificial Intelligence & Machine Learning / Data Science (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Artificial Intelligence & Machine Learning', 'B.Tech AI-ML', 4
FROM colleges c
ON CONFLICT DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Data Science & Analytics', 'B.Tech Data Science', 4
FROM colleges c
ON CONFLICT DO NOTHING;

-- Electronics & Communication (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Electronics & Communication Engineering', 'B.Tech EC', 4
FROM colleges c
ON CONFLICT DO NOTHING;

-- Electrical Engineering (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Electrical Engineering', 'B.Tech EE', 4
FROM colleges c
ON CONFLICT DO NOTHING;

-- Mechanical Engineering (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Mechanical Engineering', 'B.Tech ME', 4
FROM colleges c
ON CONFLICT DO NOTHING;

-- Civil Engineering (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Civil Engineering', 'B.Tech CE', 4
FROM colleges c
ON CONFLICT DO NOTHING;

-- Chemical Engineering (4 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'B.Tech Chemical Engineering', 'B.Tech Chemical', 4
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'nirma-university-ahmedabad', 'ld-college-of-engineering-ahmedabad',
    'vishwakarma-government-engineering-college', 'pandit-deendayal-energy-university', 'msu-baroda-faculty-of-tech-engg',
    'svnit-surat', 'iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur', 'iit-roorkee', 'iit-guwahati',
    'nit-trichy', 'nit-surathkal', 'nit-warangal', 'nit-rourkela', 'bits-pilani', 'dtu-delhi'
)
ON CONFLICT DO NOTHING;

-- Master Degrees (2 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'M.Tech Computer Science & Engineering', 'M.Tech CSE', 2
FROM colleges c
ON CONFLICT DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'M.Tech VLSI Design & Embedded Systems', 'M.Tech VLSI', 2
FROM colleges c
ON CONFLICT DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Computer Applications (MCA)', 'MCA', 2
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'birla-vishvakarma-mahavidyalaya-anand', 'g-h-patel-college-of-engineering-technology',
    'cspit-charusat-changa', 'nirma-university-ahmedabad', 'ld-college-of-engineering-ahmedabad', 'vishwakarma-government-engineering-college',
    'daiict-gandhinagar', 'indus-university-ahmedabad', 'silver-oak-university-ahmedabad', 'sal-institute-of-technology-ahmedabad',
    'lj-institute-of-engineering-technology', 'msu-baroda-faculty-of-tech-engg', 'parul-university-vadodara', 'marwadi-university-rajkot',
    'nit-trichy', 'nit-surathkal', 'nit-warangal', 'mnnit-allahabad', 'vit-vellore'
)
ON CONFLICT DO NOTHING;

-- Bachelor of Computer Applications (3 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Computer Applications (BCA)', 'BCA', 3
FROM colleges c
WHERE c.slug IN (
    'dharmsinh-desai-university-nadiad', 'cspit-charusat-changa', 'nirma-university-ahmedabad', 'indus-university-ahmedabad',
    'silver-oak-university-ahmedabad', 'lj-institute-of-engineering-technology', 'parul-university-vadodara', 'marwadi-university-rajkot'
)
ON CONFLICT DO NOTHING;

-- PhD / Research (5 years)
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Doctor of Philosophy (PhD) in Engineering / Computing', 'PhD', 5
FROM colleges c
ON CONFLICT DO NOTHING;
