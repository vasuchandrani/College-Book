/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { getProfile, updateProfile, getMyPosts, getSavedPosts, getStarredProjects, unstarProject, getMyTeams, getMyJoinRequests, updateJoinRequest } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     getProfile()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState } from "react";
import { BookOpen, Calendar, MapPin, Award, Bookmark, Users, BadgeCheck, Star, Camera, Trash2, Check, X, Clock, MessageCircle, CheckCircle2, UsersRound, Pencil, Github, Rocket, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const myConBadges = [
  { tag: "cp", label: "Competitive Programming", verified: true },
  { tag: "webdev", label: "Web Development", verified: true },
  { tag: "ml", label: "Machine Learning", verified: false },
];

const initialActivityPosts = [
  { id: 1, content: "Just finished building a real-time collaborative whiteboard using WebSockets and Canvas API. Looking for frontend devs! 🚀", likes: 24, date: "2 days ago", tags: ["webdev", "hackathon"] },
  { id: 2, content: "Wrote a guide on React performance optimization patterns — lazy loading, memoization, and code splitting.", likes: 56, date: "1 week ago", tags: ["webdev"] },
  { id: 3, content: "Completed the 100 Days of Code challenge! Here's what I learned about consistency and growth.", likes: 112, date: "2 weeks ago", tags: ["achievement"] },
];

const savedPosts = [
  { id: 1, author: "Sneha Reddy", initials: "SR", college: "BITS Pilani", content: "Our team just won the Smart India Hackathon 2025!", likes: 156, date: "3 days ago", tags: ["ai", "hackathon"] },
  { id: 2, author: "Arjun Das", initials: "AD", college: "NIT Trichy", content: "Wrote a comprehensive guide on system design for placements.", likes: 203, date: "5 days ago", tags: ["placements", "systemdesign"] },
  { id: 3, author: "Fatima Khan", initials: "FK", college: "IIT Bombay", content: "My research on privacy-preserving ML got accepted at NeurIPS!", likes: 341, date: "1 week ago", tags: ["ml", "research"] },
];

interface JoinRequest {
  id: number;
  studentName: string;
  studentInitials: string;
  role: string;
  message: string;
  time: string;
  status: "pending" | "accepted" | "rejected";
}

interface CreatedProject {
  id: number;
  title: string;
  type: "project" | "hackathon";
  description: string;
  githubLink?: string;
  skills: string[];
  requiredExpertise: string[];
  members: { name: string; initials: string; role: string }[];
  maxMembers: number;
  joinRequests: JoinRequest[];
  completed: boolean;
}

const initialCreatedProjects: CreatedProject[] = [
  {
    id: 1, title: "Neural Nexus", type: "hackathon", description: "", skills: ["Python", "ML", "React"], requiredExpertise: ["Data Engineer", "DevOps"], maxMembers: 5, completed: false,
    members: [{ name: "You", initials: "VC", role: "Lead" }],
    joinRequests: [
      { id: 1, studentName: "Rahul Verma", studentInitials: "RV", role: "ML Engineer", message: "I have experience in ML and would love to contribute!", time: "2h ago", status: "pending" },
      { id: 2, studentName: "Priya Singh", studentInitials: "PS", role: "Frontend Dev", message: "Frontend dev with React expertise, looking to join.", time: "5h ago", status: "pending" },
    ],
  },
  {
    id: 2, title: "Open Campus API", type: "project", description: "Building a unified REST API for college data — timetables, faculty, events.", githubLink: "https://github.com/example/open-campus-api", skills: ["Node.js", "PostgreSQL", "Docker"], requiredExpertise: ["Frontend Dev", "DevOps"], maxMembers: 4, completed: false,
    members: [
      { name: "You", initials: "VC", role: "Lead" },
      { name: "Karthik I.", initials: "KI", role: "Backend Dev" },
    ],
    joinRequests: [],
  },
];

interface MyJoinRequest {
  id: number;
  projectTitle: string;
  type: "project" | "hackathon";
  leadName: string;
  role: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  time: string;
}

const initialMyJoinRequests: MyJoinRequest[] = [
  { id: 1, projectTitle: "StudySync", type: "project", leadName: "Meera J.", role: "Frontend Dev", reason: "I have strong React skills and love collaborative tools.", status: "accepted", time: "1 day ago" },
  { id: 2, projectTitle: "BlockBuilders", type: "hackathon", leadName: "Rohan M.", role: "Solidity Dev", reason: "Built 3 smart contracts on Ethereum, eager to compete.", status: "pending", time: "3 hours ago" },
  { id: 3, projectTitle: "EcoTrack", type: "project", leadName: "Sneha R.", role: "Data Analyst", reason: "Passionate about sustainability and data viz.", status: "rejected", time: "2 days ago" },
];

const initialStarredProjects = [
  { id: 1, title: "StudySync", author: "Meera J.", stars: 56, skills: ["React", "WebRTC"] },
  { id: 2, title: "PeerReview", author: "Arjun D.", stars: 78, skills: ["Next.js", "Go"] },
  { id: 3, title: "EcoTrack", author: "Sneha R.", stars: 45, skills: ["React Native", "Python"] },
];

const collegePeers = [
  { name: "Ananya Sharma", initials: "AS", myCon: ["cp", "webdev"] },
  { name: "Rohan Mehta", initials: "RM", myCon: ["ml"] },
  { name: "Priya Patel", initials: "PP", myCon: ["design"] },
  { name: "Karthik Iyer", initials: "KI", myCon: ["cp", "webdev", "cloud"] },
  { name: "Meera Joshi", initials: "MJ", myCon: ["webdev", "mobile"] },
  { name: "Vikram Desai", initials: "VD", myCon: ["ml", "data"] },
  { name: "Sneha Gupta", initials: "SG", myCon: ["mobile"] },
  { name: "Arjun Nair", initials: "AN", myCon: ["webdev", "cloud"] },
];

const roleOptions = ["Frontend Dev", "Backend Dev", "Full Stack Dev", "ML Engineer", "Data Engineer", "DevOps", "UI/UX Designer", "Mobile Dev", "Security Analyst", "Cloud Architect", "QA Engineer", "Technical Writer", "Other"];

const ProfilePage = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [activityPosts, setActivityPosts] = useState(initialActivityPosts);
  const [createdProjects, setCreatedProjects] = useState(initialCreatedProjects);
  const [myRequests, setMyRequests] = useState(initialMyJoinRequests);
  const [starredProjects, setStarredProjects] = useState(initialStarredProjects);
  const [savedPostsList, setSavedPostsList] = useState(savedPosts);
  const [confirmAction, setConfirmAction] = useState<{ projectId: number; requestId: number; action: "accepted" | "rejected" } | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<number | null>(null);

  // Edit team dialog
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CreatedProject | null>(null);
  const [editTeamForm, setEditTeamForm] = useState({ title: "", description: "", githubLink: "", requiredExpertise: "", maxMembers: "4" });

  // Edit request dialog
  const [editReqOpen, setEditReqOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<MyJoinRequest | null>(null);
  const [editReqForm, setEditReqForm] = useState({ role: "", reason: "" });

  const user = JSON.parse(localStorage.getItem("cb_user") || '{}');

  const defaultBio = `${user.course || "B.Tech"} Computer Science • ${user.year || "3rd Year"}`;

  const [profile, setProfile] = useState({
    name: user.name || "Vatsal Chandrani",
    bio: defaultBio,
    customBio: "",
    college: user.college || "IIT Delhi",
    year: "2023 – 2027",
    avatarUrl: "",
  });
  const [editForm, setEditForm] = useState(profile);

  const handleSaveProfile = () => {
    setProfile({ ...editForm, college: profile.college });
    setEditOpen(false);
    toast.success("Profile updated!");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, avatarUrl: url });
    }
  };

  const deletePost = (id: number) => {
    setActivityPosts(activityPosts.filter(p => p.id !== id));
    toast.success("Post deleted");
  };

  const executeJoinAction = () => {
    if (!confirmAction) return;
    const { projectId, requestId, action } = confirmAction;
    setCreatedProjects(createdProjects.map(p => {
      if (p.id !== projectId) return p;
      const updated = { ...p, joinRequests: p.joinRequests.map(r => r.id === requestId ? { ...r, status: action } : r) };
      if (action === "accepted") {
        const req = p.joinRequests.find(r => r.id === requestId);
        if (req) updated.members = [...p.members, { name: req.studentName, initials: req.studentInitials, role: req.role }];
      }
      return updated;
    }));
    toast.success(action === "accepted" ? "Member accepted!" : "Request rejected");
    setConfirmAction(null);
  };

  const completeHiring = (projectId: number) => {
    setCreatedProjects(createdProjects.map(p => p.id === projectId ? { ...p, completed: true } : p));
    toast.success("Hiring completed! Team chat is now available.");
    setCompleteConfirm(null);
  };

  const openEditTeam = (project: CreatedProject) => {
    setEditingProject(project);
    setEditTeamForm({
      title: project.title,
      description: project.description,
      githubLink: project.githubLink || "",
      requiredExpertise: project.requiredExpertise.join(", "),
      maxMembers: String(project.maxMembers),
    });
    setEditTeamOpen(true);
  };

  const handleSaveTeam = () => {
    if (!editingProject) return;
    setCreatedProjects(createdProjects.map(p => {
      if (p.id !== editingProject.id) return p;
      return {
        ...p,
        title: editTeamForm.title,
        description: editTeamForm.description,
        githubLink: editTeamForm.githubLink || undefined,
        requiredExpertise: editTeamForm.requiredExpertise.split(",").map(s => s.trim()).filter(Boolean),
        maxMembers: parseInt(editTeamForm.maxMembers) || 4,
      };
    }));
    setEditTeamOpen(false);
    toast.success("Team updated!");
  };

  const openEditReq = (req: MyJoinRequest) => {
    setEditingReq(req);
    setEditReqForm({ role: req.role, reason: req.reason });
    setEditReqOpen(true);
  };

  const handleSaveReq = () => {
    if (!editingReq) return;
    setMyRequests(myRequests.map(r => r.id === editingReq.id ? { ...r, role: editReqForm.role, reason: editReqForm.reason } : r));
    setEditReqOpen(false);
    toast.success("Request updated!");
  };

  const unstarProject = (id: number) => {
    setStarredProjects(starredProjects.filter(p => p.id !== id));
    toast.success("Removed from starred");
  };

  const unsavePost = (id: number) => {
    setSavedPostsList(savedPostsList.filter(p => p.id !== id));
    toast.success("Removed from saved");
  };

  const initials = profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 shadow-card mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar className="h-20 w-20 shrink-0">
              {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={profile.name} /> : <AvatarFallback className="bg-gradient-hero text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">{profile.bio}</p>
                  {profile.customBio && <p className="text-muted-foreground text-sm mt-0.5">{profile.customBio}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditForm(profile); setEditOpen(true); }}>Edit Profile</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.college}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {profile.year}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {activityPosts.length} posts</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {createdProjects.length} collaborations</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {myConBadges.filter(b => b.verified).map(badge => (
                  <Badge key={badge.tag} variant="secondary" className="gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" /> {badge.tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  {editForm.avatarUrl ? <AvatarImage src={editForm.avatarUrl} alt="Preview" /> : <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>}
                </Avatar>
                <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3 text-primary-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-sm text-muted-foreground">Click the camera icon to upload</div>
            </div>
            <div className="space-y-2"><Label>Full Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>College</Label>
              <Input value={editForm.college} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-[11px] text-muted-foreground">College cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label>Default Bio</Label>
              <Input value={defaultBio} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-[11px] text-muted-foreground">Auto-generated from your course info</p>
            </div>
            <div className="space-y-2">
              <Label>Custom Bio</Label>
              <Textarea placeholder="Tell others more about yourself..." value={editForm.customBio} onChange={(e) => setEditForm({ ...editForm, customBio: e.target.value })} className="min-h-[60px]" />
            </div>
            <div className="space-y-2"><Label>Academic Year</Label><Input value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} className="bg-gradient-hero text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader><DialogTitle>Edit {editingProject?.type === "hackathon" ? "Team" : "Project"}</DialogTitle></DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{editingProject?.type === "hackathon" ? "Team Name" : "Project Title"}</Label>
                <Input value={editTeamForm.title} onChange={e => setEditTeamForm({ ...editTeamForm, title: e.target.value })} />
              </div>
              {editingProject?.type === "project" && (
                <>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editTeamForm.description} onChange={e => setEditTeamForm({ ...editTeamForm, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub Link (optional)</Label>
                    <Input value={editTeamForm.githubLink} onChange={e => setEditTeamForm({ ...editTeamForm, githubLink: e.target.value })} />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Max Members</Label>
                <Input type="number" min={2} max={10} value={editTeamForm.maxMembers} onChange={e => setEditTeamForm({ ...editTeamForm, maxMembers: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Required Expertise (comma-separated)</Label>
                <Input value={editTeamForm.requiredExpertise} onChange={e => setEditTeamForm({ ...editTeamForm, requiredExpertise: e.target.value })} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeamOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTeam} className="bg-gradient-hero text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={editReqOpen} onOpenChange={setEditReqOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Request — {editingReq?.projectTitle}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editReqForm.role} onValueChange={v => setEditReqForm({ ...editReqForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Why do you want to join?</Label>
              <Textarea value={editReqForm.reason} onChange={e => setEditReqForm({ ...editReqForm, reason: e.target.value })} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReqOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReq} className="bg-gradient-hero text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for accept/reject */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>You can't revert this operation.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeJoinAction} className={confirmAction?.action === "accepted" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}>
              Yes, {confirmAction?.action === "accepted" ? "Accept" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for complete hiring */}
      <AlertDialog open={!!completeConfirm} onOpenChange={(open) => !open && setCompleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Hiring?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to complete hiring? This will remove the team from Collab Hub and enable team chat. You can't revert this.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => completeConfirm && completeHiring(completeConfirm)} className="bg-green-600 hover:bg-green-700">
              Yes, Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="bg-muted flex-wrap">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="collabs">Collaborations</TabsTrigger>
          <TabsTrigger value="badges">myCon</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="peers">Campus</TabsTrigger>
        </TabsList>

        {/* Posts (was Activity) */}
        <TabsContent value="posts">
          <div className="space-y-3">
            {activityPosts.length === 0 && (
              <Card className="p-8 text-center shadow-card">
                <p className="text-muted-foreground text-sm">No posts yet. Share something with your campus!</p>
              </Card>
            )}
            {activityPosts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{profile.name}</span>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-muted-foreground">❤️ {post.likes}</span>
                          <div className="flex gap-1.5">
                            {post.tags.map(t => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deletePost(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Collaborations */}
        <TabsContent value="collabs">
          <Tabs defaultValue="created" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="created">My Projects/Teams</TabsTrigger>
              <TabsTrigger value="joined">My Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="created">
              <div className="space-y-4">
                {createdProjects.map((project, i) => (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-base">{project.title}</h3>
                            <Badge variant="secondary" className="text-xs capitalize">{project.type}</Badge>
                            <Badge variant="secondary" className="text-xs">{project.members.length}/{project.maxMembers} members</Badge>
                            {project.completed && <Badge className="bg-green-500/10 text-green-600 text-xs">Completed</Badge>}
                            {!project.completed && <Badge className="bg-amber-500/10 text-amber-600 text-xs">Hiring</Badge>}
                          </div>
                          {project.type === "project" && project.description && (
                            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          )}
                          {project.type === "project" && project.githubLink && (
                            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
                              <Github className="h-3 w-3" /> {project.githubLink}
                            </a>
                          )}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Team Members</p>
                            <div className="flex flex-wrap gap-2">
                              {project.members.map(m => (
                                <div key={m.name} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/50">
                                  <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">{m.initials}</AvatarFallback></Avatar>
                                  {m.name === "You" ? <span className="font-medium">{m.name}</span> : <Link to={`/student/${encodeURIComponent(m.name)}`} className="font-medium hover:text-primary hover:underline">{m.name}</Link>}
                                  <span className="text-muted-foreground">· {m.role}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {!project.completed && project.requiredExpertise.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">Looking for</p>
                              <div className="flex flex-wrap gap-1.5">
                                {project.requiredExpertise.map(skill => (
                                  <span key={skill} className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {project.skills.map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {!project.completed ? (
                            <>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => openEditTeam(project)}>
                                <Pencil className="h-3 w-3" /> Edit
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setCompleteConfirm(project.id)}>
                                <CheckCircle2 className="h-3 w-3" /> Complete
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
                              <MessageCircle className="h-3 w-3" /> Chat
                            </Button>
                          )}
                        </div>
                      </div>

                      {!project.completed && project.joinRequests.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Join Requests</p>
                          <div className="space-y-2">
                            {project.joinRequests.map(req => (
                              <div key={req.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <Avatar className="h-7 w-7 shrink-0 mt-0.5"><AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{req.studentInitials}</AvatarFallback></Avatar>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Link to={`/student/${encodeURIComponent(req.studentName)}`} className="text-sm font-semibold hover:text-primary hover:underline">{req.studentName}</Link>
                                      <Badge variant="secondary" className="text-[10px]">{req.role}</Badge>
                                      <span className="text-[10px] text-muted-foreground">{req.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{req.message}</p>
                                  </div>
                                </div>
                                {req.status === "pending" ? (
                                  <div className="flex gap-1.5 shrink-0 ml-2">
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => setConfirmAction({ projectId: project.id, requestId: req.id, action: "accepted" })}>
                                      <Check className="h-3 w-3 mr-1" /> Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => setConfirmAction({ projectId: project.id, requestId: req.id, action: "rejected" })}>
                                      <X className="h-3 w-3 mr-1" /> Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className={`text-xs shrink-0 ${req.status === "accepted" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                                    {req.status}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
                {createdProjects.length === 0 && <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No projects or teams created yet</p></Card>}
              </div>
            </TabsContent>

            <TabsContent value="joined">
              <div className="space-y-4">
                {myRequests.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-base">{req.projectTitle}</h3>
                            <Badge variant="secondary" className="text-xs capitalize">{req.type}</Badge>
                            <Badge variant="secondary" className="text-xs">{req.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Led by <Link to={`/student/${encodeURIComponent(req.leadName)}`} className="hover:text-primary hover:underline font-medium">{req.leadName}</Link></p>
                          <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/30">"{req.reason}"</p>
                          <p className="text-[11px] text-muted-foreground mt-2">{req.time}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant="secondary" className={`text-xs ${
                            req.status === "accepted" ? "bg-green-500/10 text-green-600" :
                            req.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-amber-500/10 text-amber-600"
                          }`}>
                            {req.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {req.status}
                          </Badge>
                          {req.status === "pending" && (
                            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openEditReq(req)}>
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                {myRequests.length === 0 && <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No requests sent yet</p></Card>}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* myCon Badges */}
        <TabsContent value="badges">
          <div className="space-y-3">
            {myConBadges.map((badge, i) => (
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

        {/* Starred */}
        <TabsContent value="starred">
          <div className="space-y-3">
            {starredProjects.length === 0 && (
              <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No starred projects</p></Card>
            )}
            {starredProjects.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{project.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">By <Link to={`/student/${encodeURIComponent(project.author)}`} className="hover:text-primary hover:underline">{project.author}</Link></p>
                        <div className="flex gap-1.5 mt-2">
                          {project.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{s}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-amber-500">{project.stars}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => unstarProject(project.id)} title="Unstar">
                        <StarOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Saved */}
        <TabsContent value="saved">
          <div className="space-y-3">
            {savedPostsList.length === 0 && (
              <Card className="p-8 text-center shadow-card"><p className="text-muted-foreground text-sm">No saved posts</p></Card>
            )}
            {savedPostsList.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{post.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/student/${encodeURIComponent(post.author)}`} className="text-sm font-semibold hover:text-primary hover:underline">{post.author}</Link>
                          <span className="text-xs text-muted-foreground">{post.college}</span>
                          <span className="text-xs text-muted-foreground">· {post.date}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-muted-foreground">❤️ {post.likes}</span>
                          <div className="flex gap-1.5">
                            {post.tags.map(t => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => unsavePost(post.id)} title="Unsave">
                      <Bookmark className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Campus / Peers */}
        <TabsContent value="peers">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Students from {profile.college}</p>
            {collegePeers.map((peer, i) => (
              <motion.div key={peer.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/student/${encodeURIComponent(peer.name)}`}>
                  <Card className="p-4 shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{peer.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{peer.name}</p>
                          <div className="flex gap-1.5 mt-1">
                            {peer.myCon.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                                <BadgeCheck className="h-3 w-3 text-accent" /> {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <UsersRound className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
