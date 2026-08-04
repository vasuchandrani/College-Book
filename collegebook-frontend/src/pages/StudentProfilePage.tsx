/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { getStudentProfile, sendJoinRequest } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     getStudentProfile()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useParams } from "react-router-dom";
import { BookOpen, Calendar, MapPin, Users, BadgeCheck, Star, UserPlus, Github, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useState } from "react";

const mockStudents: Record<string, { name: string; initials: string; college: string; course: string; year: string; bio: string }> = {
  "Ananya Sharma": { name: "Ananya Sharma", initials: "AS", college: "IIT Delhi", course: "B.Tech CSE", year: "2022 – 2026", bio: "B.Tech CSE • 3rd Year" },
  "Rohan Mehta": { name: "Rohan Mehta", initials: "RM", college: "IIT Delhi", course: "M.Tech AI", year: "2024 – 2026", bio: "M.Tech AI • 1st Year" },
  "Sneha Reddy": { name: "Sneha Reddy", initials: "SR", college: "BITS Pilani", course: "B.Tech CSE", year: "2022 – 2026", bio: "B.Tech CSE • 3rd Year" },
  "Arjun Das": { name: "Arjun Das", initials: "AD", college: "NIT Trichy", course: "B.Tech IT", year: "2023 – 2027", bio: "B.Tech IT • 2nd Year" },
  "Fatima Khan": { name: "Fatima Khan", initials: "FK", college: "IIT Bombay", course: "PhD CS", year: "2023 – 2028", bio: "PhD Computer Science" },
  "Meera Joshi": { name: "Meera Joshi", initials: "MJ", college: "IIIT Hyderabad", course: "B.Tech CSE", year: "2021 – 2025", bio: "B.Tech CSE • 4th Year" },
  "Priya Patel": { name: "Priya Patel", initials: "PP", college: "IIT Delhi", course: "B.Des", year: "2022 – 2026", bio: "B.Des • 3rd Year" },
  "Karthik Iyer": { name: "Karthik Iyer", initials: "KI", college: "IIT Delhi", course: "B.Tech CSE", year: "2023 – 2027", bio: "B.Tech CSE • 2nd Year" },
  "Vikram Desai": { name: "Vikram Desai", initials: "VD", college: "IIT Delhi", course: "PhD CS", year: "2022 – 2027", bio: "PhD Computer Science" },
};

const getStudentData = (name: string) => {
  return mockStudents[name] || {
    name, initials: name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    college: "Unknown College", course: "B.Tech", year: "2023 – 2027", bio: "Student",
  };
};

const roleOptions = ["Frontend Dev", "Backend Dev", "Full Stack Dev", "ML Engineer", "Data Engineer", "DevOps", "UI/UX Designer", "Mobile Dev", "Other"];

interface CollabTeam {
  name: string;
  type: "Project" | "Hackathon";
  description?: string;
  githubLink?: string;
  role: string;
  members: { name: string; initials: string; role: string }[];
  maxMembers: number;
  requiredExpertise: string[];
  hiring: boolean;
}

const StudentProfilePage = () => {
  const { name } = useParams<{ name: string }>();
  const student = getStudentData(decodeURIComponent(name || ""));

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinRole, setJoinRole] = useState("");
  const [joinReason, setJoinReason] = useState("");
  const [joinTarget, setJoinTarget] = useState("");

  const mockPosts = [
    { id: 1, content: "Working on some exciting projects this semester! Stay tuned 🚀", likes: 34, date: "3 days ago" },
    { id: 2, content: "Just completed a challenging assignment on distributed systems.", likes: 18, date: "1 week ago" },
  ];

  const ongoingCollabs: CollabTeam[] = [
    {
      name: "StudySync", type: "Project", role: "Frontend Dev",
      description: "A real-time collaborative study room app with Pomodoro timer, shared notes, and ambient sounds.",
      githubLink: "https://github.com/example/studysync",
      members: [{ name: "Meera J.", initials: "MJ", role: "Lead" }, { name: student.name, initials: student.initials, role: "Frontend Dev" }, { name: "Sneha R.", initials: "SR", role: "UI Designer" }],
      maxMembers: 5, requiredExpertise: ["WebRTC Expert", "Mobile Dev"], hiring: true,
    },
    {
      name: "Neural Nexus", type: "Hackathon", role: "ML Engineer",
      members: [{ name: "Ananya S.", initials: "AS", role: "Lead" }, { name: student.name, initials: student.initials, role: "ML Engineer" }, { name: "Rohan M.", initials: "RM", role: "Backend Dev" }],
      maxMembers: 5, requiredExpertise: ["Data Engineer", "DevOps"], hiring: true,
    },
  ];

  const completedCollabs: CollabTeam[] = [
    {
      name: "CodeReview Pro", type: "Project", role: "Backend Dev",
      description: "Anonymous peer code review platform for CS students.",
      githubLink: "https://github.com/example/codereview-pro",
      members: [{ name: "Arjun D.", initials: "AD", role: "Lead" }, { name: student.name, initials: student.initials, role: "Backend Dev" }, { name: "Vikram D.", initials: "VD", role: "DevOps" }, { name: "Sneha G.", initials: "SG", role: "QA" }],
      maxMembers: 5, requiredExpertise: [], hiring: false,
    },
    {
      name: "EcoTrack", type: "Project", role: "Data Analyst",
      description: "Track and reduce your campus carbon footprint. Gamified sustainability.",
      members: [{ name: "Sneha R.", initials: "SR", role: "Lead Dev" }, { name: student.name, initials: student.initials, role: "Data Analyst" }, { name: "Rahul V.", initials: "RV", role: "ML Engineer" }],
      maxMembers: 5, requiredExpertise: [], hiring: false,
    },
  ];

  const mockBadges = [
    { tag: "webdev", label: "Web Development", verified: true },
    { tag: "cp", label: "Competitive Programming", verified: true },
    { tag: "ml", label: "Machine Learning", verified: false },
  ];

  const mockStarred = [
    { id: 1, title: "PeerReview", author: "Arjun D.", stars: 78, skills: ["Next.js", "Go"] },
  ];

  const openJoin = (teamName: string) => {
    setJoinTarget(teamName);
    setJoinRole("");
    setJoinReason("");
    setJoinOpen(true);
  };

  const handleJoinRequest = () => {
    if (!joinRole) { toast.error("Select a role"); return; }
    if (!joinReason.trim()) { toast.error("Write why you want to join"); return; }
    toast.success(`Request sent to join "${joinTarget}"!`);
    setJoinOpen(false);
  };

  const renderCollabCard = (c: CollabTeam, i: number, showJoin: boolean) => (
    <motion.div key={c.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
      <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-base">{c.name}</h3>
              <Badge variant="secondary" className="text-xs">{c.type}</Badge>
              <Badge variant="secondary" className="text-xs">{c.members.length}/{c.maxMembers} members</Badge>
              {c.hiring && <Badge className="bg-amber-500/10 text-amber-600 text-xs">Hiring</Badge>}
              {!c.hiring && <Badge className="bg-green-500/10 text-green-600 text-xs">Completed</Badge>}
            </div>

            {/* Description for projects */}
            {c.type === "Project" && c.description && (
              <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
            )}

            {/* GitHub link */}
            {c.type === "Project" && c.githubLink && (
              <a href={c.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
                <Github className="h-3 w-3" /> {c.githubLink}
              </a>
            )}

            {/* Team Members */}
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Team Members</p>
              <div className="flex flex-wrap gap-2">
                {c.members.map(m => (
                  <div key={m.name} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/50">
                    <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">{m.initials}</AvatarFallback></Avatar>
                    <Link to={`/student/${encodeURIComponent(m.name)}`} className="font-medium hover:text-primary hover:underline">{m.name}</Link>
                    <span className="text-muted-foreground">· {m.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Expertise */}
            {c.hiring && c.requiredExpertise.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Looking for</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.requiredExpertise.map(skill => (
                    <span key={skill} className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Join button */}
          {showJoin && c.hiring && (
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => openJoin(c.name)}>
              <UserPlus className="h-3.5 w-3.5" /> Request
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 shadow-card mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarFallback className="bg-gradient-hero text-primary-foreground text-2xl font-bold">{student.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{student.bio}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {student.college}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {student.year}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {mockPosts.length} posts</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {ongoingCollabs.length + completedCollabs.length} collabs</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {mockBadges.filter(b => b.verified).map(badge => (
                  <Badge key={badge.tag} variant="secondary" className="gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" /> {badge.tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="activity">Posts</TabsTrigger>
          <TabsTrigger value="collabs">Collaborations</TabsTrigger>
          <TabsTrigger value="badges">myCon</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="space-y-3">
            {mockPosts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 shadow-card">
                  <p className="text-sm">{post.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>❤️ {post.likes}</span><span>{post.date}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collabs">
          <Tabs defaultValue="ongoing" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="ongoing">
              <div className="space-y-4">
                {ongoingCollabs.map((c, i) => renderCollabCard(c, i, true))}
                {ongoingCollabs.length === 0 && <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No ongoing collaborations</p></Card>}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {completedCollabs.map((c, i) => renderCollabCard(c, i, false))}
                {completedCollabs.length === 0 && <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No completed collaborations</p></Card>}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="badges">
          <div className="space-y-3">
            {mockBadges.map((badge, i) => (
              <motion.div key={badge.tag} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${badge.verified ? "bg-accent/15" : "bg-muted"}`}>
                        <BadgeCheck className={`h-5 w-5 ${badge.verified ? "text-accent" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{badge.label}</h3>
                        <p className="text-xs text-muted-foreground">{badge.tag}</p>
                      </div>
                    </div>
                    {badge.verified ? <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="starred">
          <div className="space-y-3">
            {mockStarred.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{project.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">By <Link to={`/student/${encodeURIComponent(project.author)}`} className="hover:text-primary hover:underline">{project.author}</Link></p>
                      <div className="flex gap-1.5 mt-2">
                        {project.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{s}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-amber-500" /><span className="text-sm font-semibold">{project.stars}</span></div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Join Request Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Join {joinTarget}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role you want to join as</Label>
              <Select value={joinRole} onValueChange={setJoinRole}>
                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Why do you want to join?</Label>
              <Textarea placeholder="Describe your experience..." value={joinReason} onChange={e => setJoinReason(e.target.value)} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-gradient-hero text-primary-foreground" onClick={handleJoinRequest}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfilePage;
