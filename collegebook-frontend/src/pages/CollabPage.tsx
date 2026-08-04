/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { getCollabTeams, createTeam, updateTeam, sendJoinRequest, respondJoinRequest, starProject, markProjectComplete } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     getCollabTeams()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState } from "react";
import { Users, Plus, Search, Rocket, UserPlus, Star, Github, X as XIcon, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface TeamMember {
  name: string;
  initials: string;
  role: string;
}

interface HackathonTeam {
  id: number;
  name: string;
  hackathon: string;
  members: TeamMember[];
  maxMembers: number;
  requiredExpertise: string[];
  lead: string;
  leadInitials: string;
  hiring: boolean;
}

interface ProjectTeam {
  id: number;
  title: string;
  description: string;
  githubLink?: string;
  members: TeamMember[];
  maxMembers: number;
  requiredExpertise: string[];
  lead: string;
  leadInitials: string;
  stars: number;
  starred: boolean;
  hiring: boolean;
}

const initialHackathonTeams: HackathonTeam[] = [
  { id: 1, name: "Neural Nexus", hackathon: "Smart India Hackathon 2025", members: [{ name: "Ananya S.", initials: "AS", role: "ML Engineer" }, { name: "Rohan M.", initials: "RM", role: "Backend Dev" }, { name: "Priya P.", initials: "PP", role: "Frontend Dev" }], maxMembers: 5, requiredExpertise: ["Data Engineer", "DevOps"], lead: "Ananya S.", leadInitials: "AS", hiring: true },
  { id: 2, name: "BlockBuilders", hackathon: "ETHIndia 2025", members: [{ name: "Rohan M.", initials: "RM", role: "Solidity Dev" }, { name: "Divya N.", initials: "DN", role: "Frontend Dev" }], maxMembers: 4, requiredExpertise: ["Node.js Backend", "Smart Contract Auditor"], lead: "Rohan M.", leadInitials: "RM", hiring: true },
  { id: 3, name: "DataDragons", hackathon: "HackTheBox CTF 2025", members: [{ name: "Vikram D.", initials: "VD", role: "Security Analyst" }, { name: "Karthik I.", initials: "KI", role: "DevOps" }], maxMembers: 4, requiredExpertise: ["Python", "Kubernetes"], lead: "Vikram D.", leadInitials: "VD", hiring: true },
  { id: 4, name: "CloudCraft", hackathon: "Google Solution Challenge", members: [{ name: "Divya N.", initials: "DN", role: "Flutter Dev" }, { name: "Sneha G.", initials: "SG", role: "Backend Dev" }, { name: "Arjun N.", initials: "AN", role: "Cloud Architect" }], maxMembers: 5, requiredExpertise: ["UI/UX Designer", "ML Engineer"], lead: "Divya N.", leadInitials: "DN", hiring: true },
];

const initialProjects: ProjectTeam[] = [
  { id: 1, title: "Open Campus API", description: "Building a unified REST API for college data — timetables, faculty, events.", githubLink: "https://github.com/example/open-campus-api", members: [{ name: "Karthik I.", initials: "KI", role: "Lead Developer" }, { name: "Arjun N.", initials: "AN", role: "Backend Dev" }], maxMembers: 5, requiredExpertise: ["Frontend Dev", "DevOps", "Technical Writer"], lead: "Karthik I.", leadInitials: "KI", stars: 34, starred: false, hiring: true },
  { id: 2, title: "StudySync", description: "A real-time collaborative study room app with Pomodoro timer, shared notes, and ambient sounds.", githubLink: "https://github.com/example/studysync", members: [{ name: "Meera J.", initials: "MJ", role: "Full Stack Dev" }, { name: "Sneha R.", initials: "SR", role: "UI Designer" }, { name: "Fatima K.", initials: "FK", role: "Backend Dev" }], maxMembers: 5, requiredExpertise: ["WebRTC Expert", "Mobile Dev"], lead: "Meera J.", leadInitials: "MJ", stars: 56, starred: false, hiring: true },
  { id: 3, title: "CampusMap AR", description: "Augmented reality campus navigation using ARKit/ARCore.", members: [{ name: "Vikram S.", initials: "VS", role: "AR Developer" }], maxMembers: 4, requiredExpertise: ["iOS Dev", "3D Designer", "Backend Dev"], lead: "Vikram S.", leadInitials: "VS", stars: 23, starred: false, hiring: true },
  { id: 4, title: "EcoTrack", description: "Track and reduce your campus carbon footprint. Gamified sustainability.", githubLink: "https://github.com/example/ecotrack", members: [{ name: "Sneha R.", initials: "SR", role: "Lead Dev" }, { name: "Rahul V.", initials: "RV", role: "ML Engineer" }], maxMembers: 5, requiredExpertise: ["React Native Dev", "Data Analyst", "UI Designer"], lead: "Sneha R.", leadInitials: "SR", stars: 45, starred: false, hiring: true },
  { id: 5, title: "PeerReview", description: "Anonymous peer code review platform for CS students.", members: [{ name: "Arjun D.", initials: "AD", role: "Lead Dev" }, { name: "Meera J.", initials: "MJ", role: "Frontend Dev" }, { name: "Vikram D.", initials: "VD", role: "Backend Dev" }, { name: "Sneha G.", initials: "SG", role: "QA" }], maxMembers: 5, requiredExpertise: ["Go Developer"], lead: "Arjun D.", leadInitials: "AD", stars: 78, starred: false, hiring: true },
];

const techTags = ["React", "Python", "ML", "Node.js", "Flutter", "Docker", "TypeScript", "Solidity", "Firebase", "Go", "Swift", "PostgreSQL"];
const roleOptions = ["Frontend Dev", "Backend Dev", "Full Stack Dev", "ML Engineer", "Data Engineer", "DevOps", "UI/UX Designer", "Mobile Dev", "Security Analyst", "Cloud Architect", "QA Engineer", "Technical Writer", "Other"];

interface MemberEntry {
  id: number;
  name: string;
  role: string;
}

const CollabPage = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<ProjectTeam[]>(initialProjects);
  const [hackathonTeams, setHackathonTeams] = useState<HackathonTeam[]>(initialHackathonTeams);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"hackathon" | "project">("project");
  const [createForm, setCreateForm] = useState({ name: "", description: "", requiredExpertise: "", maxMembers: "4", hackathon: "", githubLink: "" });
  const [memberEntries, setMemberEntries] = useState<MemberEntry[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  // Join request dialog
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState<{ name: string; type: "hackathon" | "project" } | null>(null);
  const [joinRole, setJoinRole] = useState("");
  const [joinReason, setJoinReason] = useState("");

  const user = JSON.parse(localStorage.getItem("cb_user") || '{"name":"You","initials":"YO"}');

  const toggleStar = (id: number) => {
    setProjects(projects.map(p => p.id === id ? { ...p, starred: !p.starred, stars: p.starred ? p.stars - 1 : p.stars + 1 } : p));
  };

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberRole) {
      toast.error("Enter both name and role for the member");
      return;
    }
    setMemberEntries([...memberEntries, { id: Date.now(), name: newMemberName.trim(), role: newMemberRole }]);
    setNewMemberName("");
    setNewMemberRole("");
  };

  const removeMember = (id: number) => {
    setMemberEntries(memberEntries.filter(m => m.id !== id));
  };

  const handleCreate = () => {
    if (!createForm.name) { toast.error("Please provide a name"); return; }
    const expertise = createForm.requiredExpertise.split(",").map(s => s.trim()).filter(Boolean);
    const maxM = parseInt(createForm.maxMembers) || 4;
    const currentMembers: TeamMember[] = [{ name: user.name || "You", initials: user.initials || "YO", role: "Lead" }];
    memberEntries.forEach(m => {
      currentMembers.push({ name: m.name, initials: m.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2), role: m.role });
    });

    if (createType === "hackathon") {
      const newTeam: HackathonTeam = {
        id: Date.now(), name: createForm.name, hackathon: createForm.hackathon || "Hackathon",
        members: currentMembers, maxMembers: maxM, requiredExpertise: expertise,
        lead: user.name || "You", leadInitials: user.initials || "YO", hiring: true,
      };
      setHackathonTeams([newTeam, ...hackathonTeams]);
    } else {
      const newProject: ProjectTeam = {
        id: Date.now(), title: createForm.name, description: createForm.description,
        githubLink: createForm.githubLink || undefined,
        members: currentMembers, maxMembers: maxM, requiredExpertise: expertise,
        lead: user.name || "You", leadInitials: user.initials || "YO",
        stars: 0, starred: false, hiring: true,
      };
      setProjects([newProject, ...projects]);
    }
    toast.success(`${createType === "hackathon" ? "Team" : "Project"} created!`);
    setCreateForm({ name: "", description: "", requiredExpertise: "", maxMembers: "4", hackathon: "", githubLink: "" });
    setMemberEntries([]);
    setCreateOpen(false);
  };

  const openJoinDialog = (name: string, type: "hackathon" | "project") => {
    setJoinTarget({ name, type });
    setJoinRole("");
    setJoinReason("");
    setJoinOpen(true);
  };

  const handleSendRequest = () => {
    if (!joinRole) { toast.error("Please select a role"); return; }
    if (!joinReason.trim()) { toast.error("Please write why you want to join"); return; }
    toast.success(`Request sent to join "${joinTarget?.name}"!`);
    setJoinOpen(false);
  };

  const filteredTeams = hackathonTeams.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.hackathon.toLowerCase().includes(search.toLowerCase()) || t.requiredExpertise.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesTech = !selectedTech || t.requiredExpertise.some(s => s.toLowerCase().includes(selectedTech.toLowerCase()));
    return matchesSearch && matchesTech && t.hiring;
  });

  const filteredProjects = projects.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()) || p.requiredExpertise.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesTech = !selectedTech || p.requiredExpertise.some(s => s.toLowerCase().includes(selectedTech.toLowerCase()));
    return matchesSearch && matchesTech && p.hiring;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Collab Hub</h1>
          <p className="text-muted-foreground text-sm">Find teams, start projects, build together</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setMemberEntries([]); setNewMemberName(""); setNewMemberRole(""); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero text-primary-foreground gap-2"><Plus className="h-4 w-4" /> Create</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New {createType === "hackathon" ? "Hackathon Team" : "Project"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={createType} onValueChange={(v) => setCreateType(v as "hackathon" | "project")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="hackathon">Hackathon Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Members</Label>
                  <Input type="number" min={2} max={10} value={createForm.maxMembers} onChange={e => setCreateForm({ ...createForm, maxMembers: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{createType === "hackathon" ? "Team Name" : "Project Title"}</Label>
                <Input placeholder={createType === "hackathon" ? "e.g. Neural Nexus" : "e.g. StudySync"} value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>

              {createType === "hackathon" && (
                <div className="space-y-2">
                  <Label>Hackathon Name</Label>
                  <Input placeholder="e.g. Smart India Hackathon 2025" value={createForm.hackathon} onChange={e => setCreateForm({ ...createForm, hackathon: e.target.value })} />
                </div>
              )}
              {createType === "project" && (
                <>
                  <div className="space-y-2">
                    <Label>Project Description</Label>
                    <Textarea placeholder="What are you building?" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub Link <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input placeholder="https://github.com/..." value={createForm.githubLink} onChange={e => setCreateForm({ ...createForm, githubLink: e.target.value })} />
                  </div>
                </>
              )}

              {/* Team Members Section */}
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Team Members</Label>
                  <span className="text-xs text-muted-foreground">{memberEntries.length + 1} added</span>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {/* Lead (you) */}
                  <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{user.initials || "YO"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1 truncate">{user.name || "You"}</span>
                    <Badge variant="secondary" className="text-[10px]">Lead</Badge>
                  </div>

                  {memberEntries.map(m => (
                    <div key={m.id} className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                          {m.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium flex-1 truncate">{m.name}</span>
                      <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeMember(m.id)}>
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[1fr_140px_auto] gap-2 pt-1">
                  <Input placeholder="Member name" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="h-9" />
                  <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={addMember}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Expertise</Label>
                <Input placeholder="Frontend Dev, ML Engineer, DevOps" value={createForm.requiredExpertise} onChange={e => setCreateForm({ ...createForm, requiredExpertise: e.target.value })} />
                <p className="text-xs text-muted-foreground">Comma-separated roles/skills you're looking for</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="bg-gradient-hero text-primary-foreground w-full sm:w-auto">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search teams, projects, skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {techTags.map(tag => (
          <Badge key={tag} variant={selectedTech === tag ? "default" : "secondary"} className={`cursor-pointer transition-colors ${selectedTech === tag ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setSelectedTech(selectedTech === tag ? null : tag)}>
            {tag}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="teams" className="gap-1.5"><Users className="h-4 w-4" /> Hackathon Teams</TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5"><Rocket className="h-4 w-4" /> Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <div className="space-y-4">
            {filteredTeams.map((team, i) => (
              <motion.div key={team.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-base">{team.name}</h3>
                        <Badge variant="secondary" className="text-xs">{team.hackathon}</Badge>
                        <Badge variant="secondary" className="text-xs">{team.members.length}/{team.maxMembers} members</Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Team Members</p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map(m => (
                            <div key={m.name} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md">
                              <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{m.initials}</AvatarFallback></Avatar>
                              <Link to={`/student/${encodeURIComponent(m.name)}`} className="hover:text-primary hover:underline">{m.name}</Link>
                              <span className="text-muted-foreground">· {m.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Looking for</p>
                        <div className="flex flex-wrap gap-1.5">
                          {team.requiredExpertise.map(skill => (
                            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          Led by <Link to={`/student/${encodeURIComponent(team.lead)}`} className="hover:text-primary hover:underline font-medium">{team.lead}</Link>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => openJoinDialog(team.name, "hackathon")}>
                      <UserPlus className="h-3.5 w-3.5" /> Request
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredTeams.length === 0 && <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No teams match your filters</p></Card>}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-4">
            {filteredProjects.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">{project.title}</h3>
                        <Badge variant="secondary" className="text-xs">{project.members.length}/{project.maxMembers} members</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
                          <Github className="h-3 w-3" /> {project.githubLink}
                        </a>
                      )}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Team Members</p>
                        <div className="flex flex-wrap gap-2">
                          {project.members.map(m => (
                            <div key={m.name} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md">
                              <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{m.initials}</AvatarFallback></Avatar>
                              <Link to={`/student/${encodeURIComponent(m.name)}`} className="hover:text-primary hover:underline">{m.name}</Link>
                              <span className="text-muted-foreground">· {m.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Looking for</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.requiredExpertise.map(skill => (
                            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          By <Link to={`/student/${encodeURIComponent(project.lead)}`} className="hover:text-primary hover:underline font-medium">{project.lead}</Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleStar(project.id)} className={`gap-1.5 ${project.starred ? "text-amber-500" : "text-muted-foreground"}`}>
                        <Star className={`h-4 w-4 ${project.starred ? "fill-amber-500" : ""}`} /> {project.stars}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openJoinDialog(project.title, "project")}>
                        <UserPlus className="h-3.5 w-3.5" /> Join
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredProjects.length === 0 && <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No projects match your filters</p></Card>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Join Request Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Join {joinTarget?.name}</DialogTitle></DialogHeader>
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
              <Textarea placeholder="Describe your experience and why you'd be a great fit..." value={joinReason} onChange={e => setJoinReason(e.target.value)} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-gradient-hero text-primary-foreground" onClick={handleSendRequest}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollabPage;
