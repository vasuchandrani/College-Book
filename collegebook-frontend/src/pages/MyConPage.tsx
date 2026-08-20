import { ShieldCheck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface BadgeItem {
  tag: string;
  label: string;
  description: string;
}

const badges: BadgeItem[] = [
  { tag: "cp", label: "Competitive Programming", description: "Codeforces, LeetCode, or CodeChef with verifiable contest history" },
  { tag: "webdev", label: "Web Development", description: "Portfolio or deployed projects with source code" },
  { tag: "ml", label: "Machine Learning", description: "Kaggle profile, research papers, or ML project portfolio" },
  { tag: "design", label: "UI/UX Design", description: "Dribbble, Behance, or Figma portfolio" },
  { tag: "mobile", label: "Mobile Development", description: "Published apps on Play Store or App Store" },
  { tag: "cyber", label: "Cybersecurity", description: "CTF rankings, bug bounty profiles, or security certifications" },
  { tag: "cloud", label: "Cloud & DevOps", description: "AWS/GCP/Azure certifications or deployed infrastructure" },
  { tag: "data", label: "Data Science", description: "Kaggle competitions, data analysis portfolios" },
];

const MyConPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 pb-20">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">myCon — Skill Badges</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Earn verified badges to showcase your credentials on College-Book</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Active Badge: Verified Student */}
        <Card className="p-5 shadow-card mb-6 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">Verified Student</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Granted to all registered college students upon signing up on CollegeBook.
                </p>
              </div>
            </div>
            <div className="shrink-0 self-end sm:self-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                ✓ Verified
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card mb-6 bg-gradient-hero text-primary-foreground text-center flex flex-col items-center justify-center">
          <Award className="h-10 w-10 mb-2 text-primary-foreground/90" />
          <h3 className="font-semibold text-lg">Skill Verification Coming Soon</h3>
          <p className="text-sm text-primary-foreground/80 mt-1 max-w-md">
            We are working on bringing automated third-party integrations (GitHub, LeetCode, Codeforces) to verify your skills. Manual submissions are disabled for now.
          </p>
        </Card>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {badges.map((badge, i) => (
          <motion.div key={badge.tag} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 shadow-card h-full flex flex-col justify-between border-border/40">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                    <Award className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{badge.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">#{badge.tag}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
              </div>
              <Button size="sm" variant="outline" className="mt-4 gap-1.5 w-full cursor-not-allowed opacity-60" disabled>
                Coming Soon
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyConPage;
