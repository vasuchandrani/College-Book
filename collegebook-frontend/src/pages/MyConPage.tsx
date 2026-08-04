/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { getBadges, getBadgeSubmissions, submitBadgeProof } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     getBadges()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState } from "react";
import { BadgeCheck, Upload, ShieldCheck, LinkIcon, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BadgeItem {
  tag: string;
  label: string;
  description: string;
  earned: boolean;
  proof: string | null;
  proofType?: string;
  proofLink?: string;
}

const proofTypes = [
  { value: "github", label: "GitHub Profile/Repo" },
  { value: "codeforces", label: "Codeforces/LeetCode Profile" },
  { value: "portfolio", label: "Portfolio Website" },
  { value: "certificate", label: "Certificate Link" },
  { value: "kaggle", label: "Kaggle Profile" },
  { value: "dribbble", label: "Dribbble/Behance Profile" },
  { value: "playstore", label: "Play Store / App Store Link" },
  { value: "other", label: "Other" },
];

const initialBadges: BadgeItem[] = [
  { tag: "cp", label: "Competitive Programming", description: "Codeforces, LeetCode, or CodeChef with verifiable contest history", earned: true, proof: "Codeforces: Expert (1678)", proofType: "codeforces", proofLink: "https://codeforces.com/profile/example" },
  { tag: "webdev", label: "Web Development", description: "Portfolio or deployed projects with source code", earned: true, proof: "3 deployed projects on GitHub", proofType: "github", proofLink: "https://github.com/example" },
  { tag: "ml", label: "Machine Learning", description: "Kaggle profile, research papers, or ML project portfolio", earned: false, proof: null },
  { tag: "design", label: "UI/UX Design", description: "Dribbble, Behance, or Figma portfolio", earned: false, proof: null },
  { tag: "mobile", label: "Mobile Development", description: "Published apps on Play Store or App Store", earned: false, proof: null },
  { tag: "cyber", label: "Cybersecurity", description: "CTF rankings, bug bounty profiles, or security certifications", earned: false, proof: null },
  { tag: "cloud", label: "Cloud & DevOps", description: "AWS/GCP/Azure certifications or deployed infrastructure", earned: false, proof: null },
  { tag: "data", label: "Data Science", description: "Kaggle competitions, data analysis portfolios", earned: false, proof: null },
];

const MyConPage = () => {
  const [badges, setBadges] = useState<BadgeItem[]>(initialBadges);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [proofLink, setProofLink] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [proofType, setProofType] = useState("");

  const earnedCount = badges.filter(b => b.earned).length;

  const openSubmit = (badge: BadgeItem) => {
    toast.info("We will introduce it soon");
  };

  const handleSubmitProof = () => {
    if (!proofLink.trim()) {
      toast.error("Please provide a proof link");
      return;
    }
    if (!proofType) {
      toast.error("Please select a proof type");
      return;
    }
    if (selectedBadge) {
      setBadges(badges.map(b =>
        b.tag === selectedBadge.tag ? { ...b, earned: true, proof: proofNote || proofLink, proofType, proofLink } : b
      ));
      toast.success(`Proof submitted for ${selectedBadge.label}! Badge earned.`);
      setSubmitOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">myCon — Skill Badges</h1>
        <p className="text-muted-foreground text-sm">Earn verified badges by submitting proof of your expertise</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 shadow-card mb-6 bg-gradient-hero text-primary-foreground">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /><span className="font-semibold">Your Progress</span></div>
            <span className="text-sm">{earnedCount}/{badges.length} badges earned</span>
          </div>
          <Progress value={(earnedCount / badges.length) * 100} className="h-2 bg-primary-foreground/20" />
        </Card>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {badges.map((badge, i) => (
          <motion.div key={badge.tag} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`p-5 shadow-card h-full flex flex-col ${badge.earned ? "border-accent/30" : ""}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${badge.earned ? "bg-accent/15" : "bg-muted"}`}>
                  <BadgeCheck className={`h-5 w-5 ${badge.earned ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{badge.label}</h3>
                    {badge.earned && <Badge variant="secondary" className="bg-accent/10 text-accent-foreground text-[10px]">Verified</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.tag}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{badge.description}</p>
              {badge.earned && badge.proof && (
                <div className="mt-2 p-2 rounded-md bg-accent/5 border border-accent/10">
                  <p className="text-xs text-accent-foreground font-medium">✓ {badge.proof}</p>
                  {badge.proofLink && (
                    <a href={badge.proofLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" /> View proof
                    </a>
                  )}
                </div>
              )}
              {!badge.earned && (
                <Button size="sm" variant="outline" className="mt-3 gap-1.5 w-full" onClick={() => openSubmit(badge)}>
                  <Upload className="h-3.5 w-3.5" /> Submit Proof
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Proof — {selectedBadge?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-3 bg-muted/50 border-muted">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">What counts as proof?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedBadge?.description}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label>Proof Type</Label>
              <Select value={proofType} onValueChange={setProofType}>
                <SelectTrigger><SelectValue placeholder="Select proof type" /></SelectTrigger>
                <SelectContent>
                  {proofTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5" /> Proof Link</Label>
              <Input placeholder="https://github.com/your-profile or https://codeforces.com/..." value={proofLink} onChange={(e) => setProofLink(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes (optional)</Label>
              <Textarea placeholder="Describe your experience, achievements, ratings, etc." value={proofNote} onChange={(e) => setProofNote(e.target.value)} className="min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitProof} className="bg-gradient-hero text-primary-foreground">Submit Proof</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyConPage;
