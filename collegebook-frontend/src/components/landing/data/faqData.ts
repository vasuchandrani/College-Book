export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: "How does CollegeBook verify that only real college students join?",
    answer:
      "Students sign up with their institutional college email (e.g., student@university.edu) or select their verified campus from our comprehensive database of colleges and universities. Every profile is anchored to their authentic university identity.",
  },
  {
    question: "Why are likes anonymous on posts?",
    answer:
      "Likes are anonymous so that any student can appreciate a post freely without hesitation, anxiety, or social pressure. An introvert or overthinker never has to think twice about whether they should like a post or worry about who will see it — you can simply support what your peers share with complete peace of mind.",
  },
  {
    question: "How does the Collab Hub team building and communication work?",
    answer:
      "When a project creator posts a team opening with required skills, prospective members submit a structured join request outlining their intent and experience. Once accepted by the team creator, a private, dedicated team chat room is unlocked.",
  },
  {
    question: "What is myCon and how are skill badges validated?",
    answer:
      "Unlike conventional platforms where anyone can add self-proclaimed skills without proof, myCon verifies authentic credentials by connecting to public coding profiles or verified competition links.",
  },
  {
    question: "What happens to my account when I graduate?",
    answer:
      "CollegeBook accounts are intentionally time-bound to your degree program duration. Upon graduation, all your posts, team records, and validated achievements are compiled into a downloadable Digital Memory Book that you keep forever.",
  },
  {
    question: "Is CollegeBook free for students?",
    answer:
      "Yes, CollegeBook is a 100% student-focused platform and completely free for all students.",
  },
];
