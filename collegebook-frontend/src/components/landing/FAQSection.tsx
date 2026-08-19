import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does CollegeBook verify that only real college students join?",
    answer:
      "Students sign up with their institutional college email (e.g., student@university.edu) or select their verified campus from our comprehensive database of colleges and universities. Every profile is anchored to their authentic university identity.",
  },
  {
    question: "Why are like counts anonymous on posts?",
    answer:
      "To eliminate popularity bias, clout-chasing, and dopamine addiction. On CollegeBook, great technical ideas, hackathon accomplishments, and project updates receive peer recognition without creating superficial influencer hierarchies.",
  },
  {
    question: "How does the Collab Hub team building and communication work?",
    answer:
      "When a project creator posts a team opening with required skills (e.g., React, PyTorch, Golang), prospective members submit a structured join request outlining their intent and experience. Once accepted by the team creator, a private, dedicated team chat room is unlocked.",
  },
  {
    question: "What is myCon and how are skill badges validated?",
    answer:
      "Unlike conventional platforms where anyone can add self-proclaimed skills without proof, myCon verifies authentic credentials by connecting to public coding profiles (Codeforces, LeetCode, GitHub PRs, Kaggle) or verified competition links.",
  },
  {
    question: "What happens to my account when I graduate?",
    answer:
      "CollegeBook accounts are intentionally time-bound to your degree program duration (e.g., 2 years for M.Tech/MCA, 3 years for BCA/B.Sc, 4 years for B.Tech, 5 years for Dual Degree/PhD). Upon graduation, all your posts, team records, and validated achievements are compiled into a downloadable Digital Memory Book PDF and portfolio archive that you keep forever.",
  },
  {
    question: "Is CollegeBook free for students and colleges?",
    answer:
      "Yes, CollegeBook is 100% free for students and campuses. We do not sell user data or deploy intrusive advertising trackers.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/20 border-t border-border/70 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-base">
            Everything you need to know about the CollegeBook campus ecosystem.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:text-primary transition-colors gap-4"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
