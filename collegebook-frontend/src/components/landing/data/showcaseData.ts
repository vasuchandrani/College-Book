export interface ShowcaseComment {
  id: string;
  author: string;
  handle: string;
  college?: string;
  body: string;
  time: string;
}

export const initialCommentsMap: Record<string, ShowcaseComment[]> = {
  vatsal_post: [
    // 5 DDU Students
    {
      id: "v_c1",
      author: "Het Patel",
      handle: "hetpatel",
      college: "DDU",
      body: "The degree time-bound concept is revolutionary! No lifelong digital clutter, just pure college memories 🎓✨",
      time: "8m ago",
    },
    {
      id: "v_c2",
      author: "Devanshi Shah",
      handle: "devanshishah",
      college: "DDU",
      body: "Collab Hub already helped our team find a frontend dev for the upcoming SIH hackathon! 💻🔥",
      time: "7m ago",
    },
    {
      id: "v_c3",
      author: "Yash Joshi",
      handle: "yashjoshi",
      college: "DDU",
      body: "Can't wait for our digital Memory Book at convocation! Truly authentic campus vibes ❤️",
      time: "5m ago",
    },
    {
      id: "v_c4",
      author: "Priyanshi Mehta",
      handle: "priyanshimehta",
      college: "DDU",
      body: "Campus feed without random algorithmic noise is such a breath of fresh air 🚀",
      time: "4m ago",
    },
    {
      id: "v_c5",
      author: "Kevin Dobariya",
      handle: "kevindobariya",
      college: "DDU",
      body: "myCon verified badges give real credibility to our coding projects over resume buzzwords 💯",
      time: "2m ago",
    },
    // 5 Other Universities Students
    {
      id: "v_c6",
      author: "Aarav Sharma",
      handle: "aaravsharma",
      college: "IIT Delhi",
      body: "Cross-campus explore is incredible for discovering inter-college hackathons and tech fests! 🌐⚡",
      time: "9m ago",
    },
    {
      id: "v_c7",
      author: "Ananya Iyer",
      handle: "ananyaiyer",
      college: "BITS Pilani",
      body: "Pitching our open-source tools across universities with Global posts is game changing! 🚀",
      time: "6m ago",
    },
    {
      id: "v_c8",
      author: "Rohan Deshmukh",
      handle: "rohandeshmukh",
      college: "COEP Pune",
      body: "Collab Hub makes finding teammates across other state colleges effortless. Kudos team CollegeBook! 🤝",
      time: "5m ago",
    },
    {
      id: "v_c9",
      author: "Shreya Nambiar",
      handle: "shreyanambiar",
      college: "NIT Trichy",
      body: "Finally a platform built specifically for student builders and engineers! 👏🔥",
      time: "3m ago",
    },
    {
      id: "v_c10",
      author: "Tanya Verma",
      handle: "tanyaverma",
      college: "DTU Delhi",
      body: "The UI feels so clean and fast! Loving the student directory and project showcase 🌟",
      time: "1m ago",
    },
  ],
  ronak_post: [
    // 2 Juniors thanking Ronak (both from DDU)
    {
      id: "r_c1",
      author: "Harshil Thakar",
      handle: "harshilthakar",
      college: "DDU",
      body: "Thank you so much Ronak bhaiya! The learn-tdd repo made unit testing so easy to grasp for our 2nd year project 🙏💡",
      time: "11h ago",
    },
    {
      id: "r_c2",
      author: "Meet Vaghasiya",
      handle: "meetvaghasiya",
      college: "DDU",
      body: "Really appreciate this guidance bhaiya! Setting up TDD workflow for our placement prep right now 🚀🔥",
      time: "9h ago",
    },
  ],
  jaykrishna_post: [
    // 3 Comments from IIT Bombay students (OAT-1 only)
    {
      id: "j_c1",
      author: "Aditya Rathi",
      handle: "adityarathi",
      college: "IIT Bombay",
      body: "Impromptu stand-up after lectures is exactly what we needed today! Count me in for OAT-1 😂🔥",
      time: "1m ago",
    },
    {
      id: "j_c2",
      author: "Riya Sengupta",
      handle: "riyasengupta",
      college: "IIT Bombay",
      body: "Bringing our entire hostel wing to OAT-1 at 6 PM! Can't wait for the roasts 🎤👏",
      time: "1m ago",
    },
    {
      id: "j_c3",
      author: "Siddharth Nair",
      handle: "siddharthnair",
      college: "IIT Bombay",
      body: "OAT-1 vibes are always unmatched. See you there Jaykrishna! 🙌",
      time: "Just now",
    },
  ],
};

export const showcaseBadges = [
  {
    id: "cp",
    title: "CP Specialist",
    desc: "Codeforces Rating 1650+",
    status: "verified",
    badgeLabel: "Verified Proof",
  },
  {
    id: "open_source",
    title: "Open Source",
    desc: "50+ Merged GitHub PRs",
    status: "verified",
    badgeLabel: "Verified Proof",
  },
  {
    id: "web_dev",
    title: "Web Dev",
    desc: "Full-Stack Architect",
    status: "verified",
    badgeLabel: "Verified Proof",
  },
  {
    id: "ml",
    title: "Machine Learning",
    desc: "Model Benchmarking",
    status: "pending",
    badgeLabel: "⏳ Pending Approval",
  },
];
