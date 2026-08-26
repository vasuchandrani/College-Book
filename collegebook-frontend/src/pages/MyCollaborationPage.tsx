import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Code2,
  Rocket,
  Plus,
  Eye,
  Star,
  Pencil,
  Trash2,
  CheckCircle2,
  UsersRound,
  ExternalLink,
  Github,
  Loader2,
  MessageSquare,
  X as XIcon,
  Check,
  Building2,
  FolderGit2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import ThemedLoader from "@/components/ThemedLoader";
import TeamRoomChatModal from "@/components/TeamRoomChatModal";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import {
  getMyCreatedTeams,
  getMyJoinedRequests,
  getIncomingJoinRequests,
  updateJoinRequestStatus,
  deleteJoinRequest,
  updateJoinRequest,
  deleteTeam,
  updateTeam,
  createTeam,
  lookupStudent,
  markHiringComplete,
  toggleStarTeam,
  getTeamRecentMessages,
} from "@/lib/api";
import { markRoomAsRead, checkIsMessageUnread } from "@/lib/chatUnread";
import { isValidHttpUrl, normalizeUrl } from "@/lib/urlUtils";

const commonTechSuggestions = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Next.js",
  "Tailwind CSS",
  "Java",
  "Spring Boot",
  "PostgreSQL",
  "MongoDB",
  "Flutter",
  "Docker",
  "AWS",
  "ML / AI",
  "GraphQL",
  "Rust",
  "Go",
  "Kotlin",
];

const roleOptions = [
  "Frontend Dev",
  "Backend Dev",
  "Full Stack Dev",
  "ML Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Mobile App Dev",
  "Security Analyst",
  "Cloud Architect",
  "QA Engineer",
  "Technical Writer",
  "Other Contributor",
];

interface MemberEntry {
  id: string | number;
  name: string;
  handle?: string;
  role: string;
  avatarUrl?: string;
  collegeName?: string;
}

export default function MyCollaborationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // Create Collab Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState<"open_source" | "hackathon" | "project">("open_source");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    maxMembers: "4",
    hackathon: "",
    githubLink: "",
  });
  const [roleTags, setRoleTags] = useState<string[]>([]);
  const [roleTagInput, setRoleTagInput] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillTagInput, setSkillTagInput] = useState("");
  const [memberEntries, setMemberEntries] = useState<MemberEntry[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Frontend Dev");
  const [verifyingMember, setVerifyingMember] = useState(false);

  // Manage Modals state
  const [viewRequestsTeam, setViewRequestsTeam] = useState<any>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [editTeamModal, setEditTeamModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    githubLink: "",
    requiredRoles: [] as string[],
    roleInput: "",
    skills: [] as string[],
    skillInput: "",
    maxMembers: 4,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [editReqModal, setEditReqModal] = useState<any>(null);
  const [editReqForm, setEditReqForm] = useState({
    role: "",
    message: "",
  });
  const [savingReqEdit, setSavingReqEdit] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteReqConfirm, setDeleteReqConfirm] = useState<string | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);
  const [completingHiringId, setCompletingHiringId] = useState<string | null>(null);
  const [roomChatOpen, setRoomChatOpen] = useState(false);
  const [selectedChatTeam, setSelectedChatTeam] = useState<any | null>(null);

  const { triggerToggle } = useDebouncedToggle(400);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("cb_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [unreadRooms, setUnreadRooms] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, reqsData, incomingData] = await Promise.all([
        getMyCreatedTeams().catch(() => []),
        getMyJoinedRequests().catch(() => []),
        getIncomingJoinRequests().catch(() => []),
      ]);
      setMyTeams(teamsData || []);
      setMyRequests(reqsData || []);
      setIncomingRequests(incomingData || []);
      window.dispatchEvent(new Event("cb_collab_updated"));

      // Check unread messages for collaboration rooms
      const unreadMap = new Set<string>();
      await Promise.all(
        (teamsData || []).map(async (t: any) => {
          if (!t.id) return;
          try {
            const msgs = await getTeamRecentMessages(t.id, 1);
            if (msgs && msgs.length > 0) {
              const latest = msgs[msgs.length - 1];
              const isUnread = checkIsMessageUnread(t.id, latest.createdAt, latest.senderId, user.id);
              if (isUnread) {
                unreadMap.add(t.id);
              }
            }
          } catch {}
        })
      );
      setUnreadRooms(unreadMap);
    } catch (err: any) {
      toast.error("Failed to load collaboration data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleRoomRead = (e: any) => {
      const readTeamId = e.detail?.teamId;
      if (readTeamId) {
        setUnreadRooms((prev) => {
          const next = new Set(prev);
          next.delete(readTeamId);
          return next;
        });
      }
    };
    window.addEventListener("cb_room_read", handleRoomRead);
    return () => window.removeEventListener("cb_room_read", handleRoomRead);
  }, []);

  // Split into Open Source, Active Teams, and Completed Teams
  const myOpenSourceProjects = useMemo(() => {
    return myTeams.filter(
      (t) => t.type === "OPEN_SOURCE" || t.type === "open_source"
    );
  }, [myTeams]);

  const activeTeams = useMemo(() => {
    return myTeams.filter(
      (t) =>
        t.type !== "OPEN_SOURCE" &&
        t.type !== "open_source" &&
        !t.completed
    );
  }, [myTeams]);

  const completedTeams = useMemo(() => {
    return myTeams.filter(
      (t) =>
        t.type !== "OPEN_SOURCE" &&
        t.type !== "open_source" &&
        t.completed
    );
  }, [myTeams]);

  const totalPendingRequests = useMemo(() => {
    return incomingRequests.filter(
      (r: any) => String(r.status).toUpperCase() === "PENDING"
    ).length;
  }, [incomingRequests]);

  const activeTeamsUnreadCount = useMemo(() => {
    return activeTeams.filter((t) => unreadRooms.has(t.id)).length;
  }, [activeTeams, unreadRooms]);

  const completedTeamsUnreadCount = useMemo(() => {
    return completedTeams.filter((t) => unreadRooms.has(t.id)).length;
  }, [completedTeams, unreadRooms]);

  const openSourceUnreadCount = useMemo(() => {
    return myOpenSourceProjects.filter((t) => unreadRooms.has(t.id)).length;
  }, [myOpenSourceProjects, unreadRooms]);

  const isUserCreatorOf = (project: any) => {
    return (
      project.ownerId === user.id ||
      project.creatorId === user.id ||
      project.ownerName === user.name
    );
  };

  // Open Create Dialog preset
  const openCreateDialog = (type: "open_source" | "hackathon" | "project" = "open_source") => {
    setCreateType(type);
    resetCreateForm();
    setCreateOpen(true);
  };

  // Role Tag Handlers
  const addRoleTag = (role: string) => {
    const clean = role.trim();
    if (!clean) return;
    if (roleTags.some((r) => r.toLowerCase() === clean.toLowerCase())) {
      toast.info(`Role "${clean}" is already added.`);
      return;
    }
    if (roleTags.length >= 8) {
      toast.error("Maximum 8 required roles allowed.");
      return;
    }
    setRoleTags([...roleTags, clean]);
    setRoleTagInput("");
  };

  const removeRoleTag = (roleToRemove: string) => {
    setRoleTags(roleTags.filter((r) => r !== roleToRemove));
  };

  const handleRoleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRoleTag(roleTagInput);
    }
  };

  // Skill Tag Handlers
  const addSkillTag = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (skillTags.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      toast.info(`Skill "${clean}" is already added.`);
      return;
    }
    if (skillTags.length >= 12) {
      toast.error("Maximum 12 skill tags allowed.");
      return;
    }
    setSkillTags([...skillTags, clean]);
    setSkillTagInput("");
  };

  const removeSkillTag = (skillToRemove: string) => {
    setSkillTags(skillTags.filter((s) => s !== skillToRemove));
  };

  const handleSkillTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillTag(skillTagInput);
    }
  };

  // Team Member Handlers - Verified with lookupStudent
  const addMember = async () => {
    const rawInput = newMemberName.trim();
    if (!rawInput) {
      toast.error("Enter a student username or handle (e.g. vasuchandrani)");
      return;
    }
    const cleanHandle = rawInput.replace(/^@/, "");

    // 1. Check if user is trying to add themselves (lead is automatically included)
    if (
      (user.handle && cleanHandle.toLowerCase() === user.handle.toLowerCase()) ||
      (user.name && cleanHandle.toLowerCase() === user.name.toLowerCase())
    ) {
      toast.error("You are the Team Lead and automatically included.");
      return;
    }

    // 2. Check if already added in current list
    if (
      memberEntries.some(
        (m) =>
          m.name.toLowerCase() === cleanHandle.toLowerCase() ||
          (m.handle && m.handle.toLowerCase() === cleanHandle.toLowerCase())
      )
    ) {
      toast.error("This student has already been added to the team list.");
      return;
    }

    // 3. Check max member cap
    const maxM = parseInt(createForm.maxMembers, 10) || 4;
    if (memberEntries.length + 1 >= maxM) {
      toast.error(`Cannot add more than ${maxM} members (including team lead).`);
      return;
    }

    // 4. Verify student existence in CollegeBook system
    try {
      setVerifyingMember(true);
      const res = await lookupStudent(cleanHandle);
      if (!res || !res.exists || !res.student) {
        toast.error(res?.message || `Student "@${cleanHandle}" not found in CollegeBook. Make sure they have registered.`);
        return;
      }

      const student = res.student;

      // Check if student is current user
      if (student.userId && user.id && student.userId === user.id) {
        toast.error("You are the Team Lead and automatically included.");
        return;
      }

      // Check duplicate
      if (
        memberEntries.some(
          (m) =>
            (student.handle && m.handle && m.handle.toLowerCase() === student.handle.toLowerCase()) ||
            (m.id && student.userId && m.id === student.userId)
        )
      ) {
        toast.error("This student is already in the team list.");
        return;
      }

      setMemberEntries((prev) => [
        ...prev,
        {
          id: student.userId || Date.now(),
          name: student.fullName,
          handle: student.handle || cleanHandle,
          role: newMemberRole,
          avatarUrl: student.avatarUrl,
          collegeName: student.collegeName,
        },
      ]);

      toast.success(`Verified: ${student.fullName} (@${student.handle || cleanHandle}) added!`);
      setNewMemberName("");
    } catch (err: any) {
      toast.error(`Student "@${cleanHandle}" not found in CollegeBook. Make sure they have registered.`);
    } finally {
      setVerifyingMember(false);
    }
  };

  const removeMember = (id: string | number) => {
    setMemberEntries(memberEntries.filter((m) => m.id !== id));
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      description: "",
      maxMembers: "4",
      hackathon: "",
      githubLink: "",
    });
    setRoleTags([]);
    setRoleTagInput("");
    setSkillTags([]);
    setSkillTagInput("");
    setMemberEntries([]);
    setNewMemberName("");
    setNewMemberRole("Frontend Dev");
  };

  // Handle Create Submit
  const handleCreateSubmit = async () => {
    if (!createForm.name.trim()) {
      toast.error(
        createType === "open_source"
          ? "Please enter repository/project name"
          : "Please enter title/name"
      );
      return;
    }

    if (createType === "open_source" && !createForm.githubLink.trim()) {
      toast.error("Please enter your GitHub repository link for open source project");
      return;
    }

    if (createForm.githubLink.trim() && !isValidHttpUrl(createForm.githubLink.trim())) {
      toast.error("Please provide a valid GitHub repository or project web link (e.g. https://github.com/username/repo)");
      return;
    }

    const maxM =
      createType === "open_source" ? 0 : parseInt(createForm.maxMembers, 10) || 4;

    const finalDescription =
      createType === "hackathon"
        ? createForm.description.trim()
          ? createForm.hackathon.trim()
            ? `Hackathon: ${createForm.hackathon.trim()}\n\n${createForm.description.trim()}`
            : createForm.description.trim()
          : createForm.hackathon.trim() || "Hackathon Team"
        : createForm.description.trim();

    try {
      setCreating(true);
      const newTeam: any = await createTeam({
        title: createForm.name.trim(),
        type: createType,
        description: finalDescription,
        githubLink: createForm.githubLink.trim() ? normalizeUrl(createForm.githubLink.trim()) : "",
        skills: skillTags,
        requiredRoles: roleTags,
        requiredExpertise: roleTags,
        memberHandles: memberEntries.map((m) => (m.handle || m.name).trim().replace(/^@/, "")),
        maxMembers: maxM,
      });

      setMyTeams((prev) => [newTeam, ...prev]);
      toast.success(
        createType === "open_source"
          ? "Open-source project published!"
          : createType === "hackathon"
          ? "Hackathon team created!"
          : "Team project created!"
      );
      resetCreateForm();
      setCreateOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to create team/project");
    } finally {
      setCreating(false);
    }
  };

  // Toggle Star (Debounced with instant optimistic UI matching Collab Hub)
  const handleToggleStar = (projectId: string) => {
    const target = myTeams.find((p) => p.id === projectId);
    if (!target) return;
    const currentStarred = !!target.starred;

    triggerToggle(
      projectId,
      currentStarred,
      (newStarred) => {
        setMyTeams((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  starred: newStarred,
                  starsCount: newStarred
                    ? target.starred
                      ? target.starsCount
                      : (target.starsCount || 0) + 1
                    : target.starred
                    ? Math.max(0, (target.starsCount || 0) - 1)
                    : target.starsCount || 0,
                }
              : p
          )
        );
      },
      (signal) => toggleStarTeam(projectId, signal)
    );
  };

  // Mark Hiring Complete
  const handleCompleteHiring = async (projectId: string) => {
    try {
      setCompletingHiringId(projectId);
      await markHiringComplete(projectId);
      toast.success("Hiring marked as complete! Team is now locked.");
      setCompleteConfirm(null);
      setMyTeams((prev) =>
        prev.map((t) => (t.id === projectId ? { ...t, completed: true } : t))
      );
      // Remove all join requests for this team from state since backend deleted them
      setIncomingRequests((prev) =>
        prev.filter((r) => r.teamId !== projectId && r.projectId !== projectId)
      );
      window.dispatchEvent(new Event("cb_collab_updated"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to complete hiring");
    } finally {
      setCompletingHiringId(null);
    }
  };

  // Delete Team
  const handleDeleteTeam = async (projectId: string) => {
    try {
      await deleteTeam(projectId);
      toast.success("Project deleted successfully");
      setDeleteConfirm(null);
      setMyTeams((prev) => prev.filter((t) => t.id !== projectId));
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete project");
    }
  };

  // Edit Team
  const openEditTeam = (project: any) => {
    setEditTeamModal(project);
    setEditForm({
      title: project.title || "",
      description: project.description || "",
      githubLink: project.githubLink || "",
      requiredRoles: [...(project.requiredRoles || project.requiredExpertise || [])],
      roleInput: "",
      skills: [...(project.skills || [])],
      skillInput: "",
      maxMembers: project.maxMembers || 4,
    });
  };

  const addEditRole = (role: string) => {
    const clean = role.trim();
    if (!clean) return;
    if (editForm.requiredRoles.some((r) => r.toLowerCase() === clean.toLowerCase())) {
      toast.info(`Role "${clean}" already added.`);
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      requiredRoles: [...prev.requiredRoles, clean],
      roleInput: "",
    }));
  };

  const removeEditRole = (roleToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      requiredRoles: prev.requiredRoles.filter((r) => r !== roleToRemove),
    }));
  };

  const addEditSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (editForm.skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      toast.info(`Skill "${clean}" already added.`);
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      skills: [...prev.skills, clean],
      skillInput: "",
    }));
  };

  const removeEditSkill = (skillToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSaveTeamEdit = async () => {
    if (!editTeamModal || !editForm.title.trim()) return;

    if (editForm.githubLink.trim() && !isValidHttpUrl(editForm.githubLink.trim())) {
      toast.error("Please provide a valid GitHub repository or project web link (e.g. https://github.com/username/repo)");
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await updateTeam(editTeamModal.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        githubLink: editForm.githubLink.trim() ? normalizeUrl(editForm.githubLink.trim()) : undefined,
        requiredRoles: editForm.requiredRoles,
        requiredExpertise: editForm.requiredRoles,
        skills: editForm.skills,
        maxMembers: editForm.maxMembers,
      });
      setMyTeams((prev) =>
        prev.map((t) => (t.id === editTeamModal.id ? { ...t, ...updated } : t))
      );
      toast.success("Project updated successfully!");
      setEditTeamModal(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update project");
    } finally {
      setSavingEdit(false);
    }
  };

  // Edit Request
  const openEditReq = (req: any) => {
    setEditReqModal(req);
    setEditReqForm({
      role: req.role || "",
      message: req.message || req.reason || "",
    });
  };

  const handleSaveReqEdit = async () => {
    if (!editReqModal || !editReqForm.role.trim()) return;
    try {
      setSavingReqEdit(true);
      const updated = await updateJoinRequest(editReqModal.id, {
        role: editReqForm.role.trim(),
        message: editReqForm.message.trim(),
      });
      setMyRequests((prev) =>
        prev.map((r) => (r.id === editReqModal.id ? { ...r, ...updated } : r))
      );
      toast.success("Request updated!");
      setEditReqModal(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update request");
    } finally {
      setSavingReqEdit(false);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (reqId: string) => {
    try {
      await deleteJoinRequest(reqId);
      toast.success("Request withdrawn");
      setDeleteReqConfirm(null);
      setMyRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete request");
    }
  };

  // View Requests & Manage (Creator Only)
  const handleOpenViewRequests = (project: any) => {
    if (!isUserCreatorOf(project)) {
      toast.error("Only the team creator can view join requests.");
      return;
    }
    if (project.completed) {
      toast.info("Hiring is completed for this team. All join requests have been cleared.");
      return;
    }
    setViewRequestsTeam(project);
  };

  const handleRequestStatusChange = async (
    reqId: string,
    status: "ACCEPTED" | "REJECTED" | "PENDING"
  ) => {
    try {
      setActionLoadingId(reqId);
      await updateJoinRequestStatus(reqId, status);
      toast.success(
        status === "ACCEPTED"
          ? "Applicant accepted into team!"
          : status === "PENDING"
          ? "Rejection undone. Request restored to Pending."
          : "Request declined."
      );
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status } : r))
      );
      window.dispatchEvent(new Event("cb_collab_updated"));
      // Reload teams to update member count
      const updatedTeams = await getMyCreatedTeams();
      setMyTeams(updatedTeams || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 min-h-[60vh] flex flex-col items-center justify-center">
        <ThemedLoader size="md" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">
          Loading your collaborations...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20">
      {/* Page Header with 2 Buttons matching Collab Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/60 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> My Collaboration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your projects, teams, and join applications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm sm:gap-2">
            <Link to="/collab">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="hidden sm:inline">Explore Collab Hub</span>
              <span className="sm:hidden">Explore Hub</span>
            </Link>
          </Button>

          <Button
            onClick={() => openCreateDialog("open_source")}
            size="sm"
            className="bg-gradient-hero text-primary-foreground gap-1.5 sm:gap-2 shrink-0 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Create
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="open_source" className="space-y-4 sm:space-y-5">
        <TabsList className="bg-muted/80 p-1.5 rounded-xl grid grid-cols-2 lg:grid-cols-4 w-full max-w-4xl h-auto gap-1.5 shadow-2xs">
          <TabsTrigger value="open_source" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <Code2 className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Open source</span>
          </TabsTrigger>
          <TabsTrigger value="my_requests" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">My requests</span>
          </TabsTrigger>
          <TabsTrigger value="active_teams" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <Rocket className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Recruiting</span>
            {totalPendingRequests + activeTeamsUnreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-semibold rounded-full shrink-0 ml-1"
              >
                {totalPendingRequests + activeTeamsUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed_teams" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Formed Teams</span>
            {completedTeamsUnreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-semibold rounded-full shrink-0 ml-1"
              >
                {completedTeamsUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 1. Open Source */}
        <TabsContent value="open_source" className="space-y-4">
          {myOpenSourceProjects.length === 0 ? (
            <Card className="p-6 sm:p-10 text-center shadow-card space-y-3 border-dashed">
              <Code2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <h3 className="font-semibold text-base">No Open-Source Repositories Published</h3>
              <p className="text-muted-foreground text-xs max-w-md mx-auto">
                Share your open-source tools, packages, and code with students across campuses!
              </p>
              <Button
                size="sm"
                className="mt-2 text-xs"
                variant="outline"
                onClick={() => openCreateDialog("open_source")}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Publish Repository
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {myOpenSourceProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/my-collaboration/${project.id}`}
                          className="font-semibold text-base hover:text-primary hover:underline transition-colors break-words"
                        >
                          {project.title}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary border border-primary/20 shrink-0"
                        >
                          Open Source
                        </Badge>
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                          {project.description}
                        </p>
                      )}

                      {project.githubLink && (
                        <div>
                          <a
                            href={
                              project.githubLink.startsWith("http")
                                ? project.githubLink
                                : `https://${project.githubLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-md border border-primary/20 max-w-full"
                          >
                            <Github className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[220px] sm:max-w-[360px]">
                              {project.githubLink.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="h-3 w-3 ml-0.5 opacity-70 shrink-0" />
                          </a>
                        </div>
                      )}

                      <div className="space-y-2 pt-1">
                        {((project.requiredRoles && project.requiredRoles.length > 0) ||
                          (project.requiredExpertise && project.requiredExpertise.length > 0)) && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                              <Users className="h-3 w-3" /> Looking for roles:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(project.requiredRoles || project.requiredExpertise || []).map(
                                (role: string, idx: number) => (
                                  <Badge
                                    key={`${project.id}-os-role-${role}-${idx}`}
                                    variant="secondary"
                                    className="text-[11px] px-2.5 py-0.5 font-medium bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {role}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {project.skills && project.skills.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              <Code2 className="h-3 w-3" /> Tech Stack:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {project.skills.map((tech: string, idx: number) => (
                                <Badge
                                  key={`${project.id}-os-tech-${tech}-${idx}`}
                                  variant="outline"
                                  className="text-[11px] px-2.5 py-0.5 font-medium bg-muted/40"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs h-8 px-2.5"
                          >
                            <Link to={`/my-collaboration/${project.id}`}>
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStar(project.id)}
                            className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${
                              project.starred ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "text-muted-foreground"
                            }`}
                          >
                            <Star className={`h-3.5 w-3.5 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                            <span className="font-semibold text-xs">{project.starsCount || 0}</span>
                          </Button>
                        </div>

                        {isUserCreatorOf(project) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditTeam(project)}
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-xs h-7 px-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteConfirm(project.id)}
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 2. My Requests */}
        <TabsContent value="my_requests" className="space-y-4">
          {myRequests.length === 0 ? (
            <Card className="p-10 text-center shadow-card space-y-2 border-dashed">
              <Users className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <h3 className="font-semibold text-base">No Requests Sent</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                You haven't applied to join any teams yet. Explore Collab Hub openings!
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                <Link to="/collab">
                  <Rocket className="h-3.5 w-3.5 mr-1" /> Explore Openings
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req, i) => {
                const statusStr = String(req.status || "pending").toUpperCase();
                const isPending = statusStr === "PENDING";
                const isAccepted = statusStr === "ACCEPTED";
                const isRejected = statusStr === "REJECTED";

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base break-words">
                              {req.projectTitle || req.teamTitle || "Collaboration Team"}
                            </h3>
                            <Badge
                              variant={
                                isAccepted
                                  ? "default"
                                  : isRejected
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={`text-xs capitalize shrink-0 ${
                                isAccepted
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : isPending
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : ""
                              }`}
                            >
                              {isAccepted ? "Accepted" : isRejected ? "Rejected" : "Pending Review"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Applied as:{" "}
                            <span className="font-medium text-foreground">{req.role}</span>
                          </p>
                          {(req.message || req.reason) && (
                            <div className="mt-2 text-xs space-y-1">
                              <p className="text-[11px] font-semibold text-muted-foreground">
                                Your pitch / note:
                              </p>
                              <FormattedContent
                                content={req.message || req.reason}
                                maxEnters={2}
                                className="text-xs text-foreground/90 p-3 rounded-lg bg-muted/40 border border-border/50 break-words"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-8 px-2.5"
                                onClick={() => openEditReq(req)}
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit Request
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-xs h-8 px-2.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteReqConfirm(req.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Withdraw
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 3. Recruiting Teams (Hiring Open) */}
        <TabsContent value="active_teams" className="space-y-4">
          {activeTeams.length === 0 ? (
            <Card className="p-10 text-center shadow-card space-y-3 border-dashed">
              <Rocket className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <h3 className="font-semibold text-base">No Recruiting Teams Yet</h3>
              <p className="text-muted-foreground text-xs max-w-md mx-auto">
                Assemble a hackathon crew or find contributors for your project opening on Collab Hub.
              </p>
              <Button
                size="sm"
                className="mt-2 text-xs"
                variant="outline"
                onClick={() => openCreateDialog("project")}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Start a Team on Collab Hub
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeTeams.map((project, i) => {
                const projectRequests = incomingRequests.filter(
                  (r: any) => r.teamId === project.id || r.projectId === project.id
                );
                const pendingRequests = projectRequests.filter(
                  (r: any) => String(r.status).toUpperCase() === "PENDING"
                );

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                  <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/my-collaboration/${project.id}`}
                          className="font-semibold text-base hover:text-primary hover:underline transition-colors break-words"
                        >
                          {project.title}
                        </Link>

                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize shrink-0 ${
                            project.type === "HACKATHON" || project.type === "hackathon"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {project.type === "HACKATHON" || project.type === "hackathon"
                            ? "Hackathon Team"
                            : "Team Project"}
                        </Badge>

                        <Badge variant="secondary" className="text-xs shrink-0">
                          {project.currentMembersCount || (project.members || []).length || 1}/{project.maxMembers || 4} members
                        </Badge>

                        <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                          Hiring Open
                        </Badge>
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                          {project.description}
                        </p>
                      )}

                      {project.githubLink && (
                        <div>
                          <a
                            href={
                              project.githubLink.startsWith("http")
                                ? project.githubLink
                                : `https://${project.githubLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 max-w-full"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[220px] sm:max-w-[360px]">
                              {project.githubLink.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
                        {((project.requiredRoles && project.requiredRoles.length > 0) ||
                          (project.requiredExpertise && project.requiredExpertise.length > 0)) && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                              <Users className="h-3 w-3" /> Looking for roles:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(project.requiredRoles || project.requiredExpertise || []).map(
                                (role: string, idx: number) => (
                                  <Badge
                                    key={`${project.id}-act-role-${role}-${idx}`}
                                    variant="secondary"
                                    className="text-[11px] px-2.5 py-0.5 font-medium bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {role}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {project.skills && project.skills.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              <Code2 className="h-3 w-3" /> Tech Stack:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {project.skills.map((tech: string, idx: number) => (
                                <Badge
                                  key={`${project.id}-act-tech-${tech}-${idx}`}
                                  variant="outline"
                                  className="text-[11px] px-2.5 py-0.5 font-medium bg-muted/40"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Responsive Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                        {/* Primary Actions */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs h-8 px-2.5"
                          >
                            <Link to={`/my-collaboration/${project.id}`}>
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </Link>
                          </Button>

                          {isUserCreatorOf(project) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`gap-1.5 text-xs h-8 px-2.5 ${
                                pendingRequests.length > 0
                                  ? "border-primary text-primary bg-primary/5 font-semibold"
                                  : ""
                              }`}
                              onClick={() => handleOpenViewRequests(project)}
                            >
                              <UsersRound className="h-3.5 w-3.5" /> View Requests
                              {pendingRequests.length > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4 ml-0.5 bg-primary text-primary-foreground font-semibold"
                                >
                                  {pendingRequests.length}
                                </Badge>
                              )}
                            </Button>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 font-medium select-none"
                            >
                              ✓ Joined Member
                            </Badge>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              markRoomAsRead(project.id);
                              navigate(`/my-collaboration/${project.id}?tab=chat`);
                            }}
                            className={`gap-1.5 text-xs h-8 px-2.5 ${
                              unreadRooms.has(project.id)
                                ? "bg-primary/10 text-primary border-primary font-bold shadow-2xs"
                                : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 font-semibold"
                            }`}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Room Chat</span>
                            {unreadRooms.has(project.id) && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-bold shadow-2xs ml-0.5"
                              >
                                New
                              </Badge>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStar(project.id)}
                            className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${
                              project.starred ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "text-muted-foreground"
                            }`}
                          >
                            <Star className={`h-3.5 w-3.5 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                            <span className="font-semibold text-xs">{project.starsCount || 0}</span>
                          </Button>
                        </div>

                        {/* Admin Actions (Owner Only) */}
                        {isUserCreatorOf(project) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs h-7 px-2.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => setCompleteConfirm(project.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete Hiring
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditTeam(project)}
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-xs h-7 px-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteConfirm(project.id)}
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 4. Formed Teams (Hiring Completed - No button in empty state) */}
        <TabsContent value="completed_teams" className="space-y-4">
          {completedTeams.length === 0 ? (
            <Card className="p-10 text-center shadow-card space-y-3 border-dashed">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <h3 className="font-semibold text-base">No Formed Teams Yet</h3>
              <p className="text-muted-foreground text-xs max-w-md mx-auto">
                When you finish recruitment and complete hiring for your teams, they will appear here with team room access.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedTeams.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow border-emerald-500/20">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/my-collaboration/${project.id}`}
                          className="font-semibold text-base hover:text-primary hover:underline transition-colors break-words"
                        >
                          {project.title}
                        </Link>

                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize shrink-0 ${
                            project.type === "HACKATHON" || project.type === "hackathon"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {project.type === "HACKATHON" || project.type === "hackathon"
                            ? "Hackathon Team"
                            : "Team Project"}
                        </Badge>

                        <Badge variant="secondary" className="text-xs shrink-0">
                          {project.currentMembersCount || (project.members || []).length || 1}/{project.maxMembers || 4} members
                        </Badge>

                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shrink-0">
                          ✓ Hiring Completed
                        </Badge>
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                          {project.description}
                        </p>
                      )}

                      {project.githubLink && (
                        <div>
                          <a
                            href={
                              project.githubLink.startsWith("http")
                                ? project.githubLink
                                : `https://${project.githubLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 max-w-full"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[220px] sm:max-w-[360px]">
                              {project.githubLink.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        </div>
                      )}

                      {((project.requiredExpertise && project.requiredExpertise.length > 0) ||
                        (project.skills && project.skills.length > 0)) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(project.requiredExpertise && project.requiredExpertise.length > 0
                            ? project.requiredExpertise
                            : project.skills || []
                          ).map((tech: string, idx: number) => (
                            <Badge
                              key={`${project.id}-comp-tech-${tech}-${idx}`}
                              variant="secondary"
                              className="text-[11px] px-2.5 py-0.5 font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Responsive Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                        {/* Primary Actions */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs h-8 px-2.5"
                          >
                            <Link to={`/my-collaboration/${project.id}`}>
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </Link>
                          </Button>

                          {isUserCreatorOf(project) ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 font-medium select-none"
                            >
                              Team Creator
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 font-medium select-none"
                            >
                              ✓ Joined Member
                            </Badge>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              markRoomAsRead(project.id);
                              navigate(`/my-collaboration/${project.id}?tab=chat`);
                            }}
                            className={`gap-1.5 text-xs h-8 px-2.5 ${
                              unreadRooms.has(project.id)
                                ? "bg-primary/10 text-primary border-primary font-bold shadow-2xs"
                                : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 font-semibold"
                            }`}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Room Chat</span>
                            {unreadRooms.has(project.id) && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-bold shadow-2xs ml-0.5"
                              >
                                New
                              </Badge>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStar(project.id)}
                            className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${
                              project.starred ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "text-muted-foreground"
                            }`}
                          >
                            <Star className={`h-3.5 w-3.5 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                            <span className="font-semibold text-xs">{project.starsCount || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Collab Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/30 shrink-0">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {createType === "open_source" && <Code2 className="h-5 w-5 text-primary" />}
              {createType === "hackathon" && <Users className="h-5 w-5 text-primary" />}
              {createType === "project" && <Rocket className="h-5 w-5 text-primary" />}
              Create New{" "}
              {createType === "open_source"
                ? "Open-Source Project"
                : createType === "hackathon"
                ? "Hackathon Team"
                : "Team Project"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {createType === "open_source"
                ? "Publish your repository to gain reach and invite open contributions from all campus students."
                : createType === "hackathon"
                ? "Assemble a dedicated team for an upcoming hackathon challenge."
                : "Create a project collaboration to build with a capped team."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 max-h-[70vh] [scrollbar-width:thin]">
            {/* Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Collab Category</Label>
                <Select
                  value={createType}
                  onValueChange={(v) => setCreateType(v as "open_source" | "hackathon" | "project")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open_source">Open-Source Project</SelectItem>
                    <SelectItem value="hackathon">Hackathon Team</SelectItem>
                    <SelectItem value="project">Team Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Members (hidden/disabled for open source) */}
              {createType !== "open_source" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Max Members Limit</Label>
                  <Input
                    type="number"
                    min={2}
                    max={15}
                    value={createForm.maxMembers}
                    onChange={(e) => setCreateForm({ ...createForm, maxMembers: e.target.value })}
                    className="h-9"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Contributors</Label>
                  <div className="h-9 flex items-center px-3 rounded-md bg-muted/60 text-xs text-muted-foreground font-medium border border-border/40">
                    Open to all contributors
                  </div>
                </div>
              )}
            </div>

            {/* Title / Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {createType === "open_source"
                  ? "Repository / Project Name"
                  : createType === "hackathon"
                  ? "Team Name"
                  : "Project Title"}
              </Label>
              <Input
                placeholder={
                  createType === "open_source"
                    ? "e.g. AwesomeCampusLib or StudyBot-AI"
                    : createType === "hackathon"
                    ? "e.g. Neural Nexus"
                    : "e.g. PeerMatch"
                }
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="h-9"
              />
            </div>

            {/* Hackathon Specific: Hackathon Name */}
            {createType === "hackathon" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hackathon Name & Edition</Label>
                <Input
                  placeholder="e.g. Smart India Hackathon 2025 or HackDU"
                  value={createForm.hackathon}
                  onChange={(e) => setCreateForm({ ...createForm, hackathon: e.target.value })}
                  className="h-9"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description & Goals</Label>
              <Textarea
                placeholder={
                  createType === "open_source"
                    ? "What does this repo do? What problems does it solve? How can students contribute?"
                    : "What are you aiming to build? What makes this project exciting?"
                }
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
                className="text-sm resize-y"
              />
            </div>

            {/* GitHub URL (Mandatory for Open Source, Optional for Team Project) */}
            {(createType === "open_source" || createType === "project") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>GitHub Repository URL</span>
                  {createType === "open_source" && (
                    <span className="text-[11px] font-medium text-destructive">* Required</span>
                  )}
                </Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://github.com/username/repository"
                    value={createForm.githubLink}
                    onChange={(e) => setCreateForm({ ...createForm, githubLink: e.target.value })}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 1. Required Roles (Looking for Roles) */}
            <div className="space-y-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                  <Users className="h-3.5 w-3.5" />
                  Required Roles (Looking for)
                </Label>
                <span className="text-[11px] text-muted-foreground">{roleTags.length} added</span>
              </div>

              {/* Role Tag Pills */}
              {roleTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {roleTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 px-2.5 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeRoleTag(tag)}
                        className="text-primary-foreground/80 hover:text-primary-foreground focus:outline-none ml-0.5"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Add the roles you need in this team (e.g. Frontend Dev, ML Engineer).
                </p>
              )}

              {/* Role Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type role and press Enter (e.g. Frontend Dev, UI/UX Designer)..."
                  value={roleTagInput}
                  onChange={(e) => setRoleTagInput(e.target.value)}
                  onKeyDown={handleRoleTagKeyDown}
                  className="h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 gap-1"
                  onClick={() => addRoleTag(roleTagInput)}
                  disabled={!roleTagInput.trim()}
                >
                  <Plus className="h-3 w-3" /> Add Role
                </Button>
              </div>

              {/* Quick Role Suggestions */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Quick role suggestions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {roleOptions
                    .filter((s) => !roleTags.some((t) => t.toLowerCase() === s.toLowerCase()))
                    .slice(0, 8)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addRoleTag(suggestion)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-background hover:bg-muted text-foreground border border-border/60 transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* 2. Technologies & Required Skills */}
            <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  Required Skills & Tech Stack
                </Label>
                <span className="text-[11px] text-muted-foreground">{skillTags.length} added</span>
              </div>

              {/* Skill Tag Pills */}
              {skillTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 px-2.5 py-1 text-xs bg-muted text-foreground border border-border hover:bg-muted/80 transition-all"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeSkillTag(tag)}
                        className="text-muted-foreground hover:text-destructive focus:outline-none ml-0.5"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Add tech stack tools and frameworks (e.g. React, Python, Docker).
                </p>
              )}

              {/* Skill Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type skill/tech and press Enter (e.g. React, Docker, Python)..."
                  value={skillTagInput}
                  onChange={(e) => setSkillTagInput(e.target.value)}
                  onKeyDown={handleSkillTagKeyDown}
                  className="h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 gap-1"
                  onClick={() => addSkillTag(skillTagInput)}
                  disabled={!skillTagInput.trim()}
                >
                  <Plus className="h-3 w-3" /> Add Skill
                </Button>
              </div>

              {/* Popular Quick Suggestions */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Quick skill suggestions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {commonTechSuggestions
                    .filter((s) => !skillTags.some((t) => t.toLowerCase() === s.toLowerCase()))
                    .slice(0, 8)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addSkillTag(suggestion)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Team Members Section (For Hackathon & Team Projects) */}
            {createType !== "open_source" && (
              <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" /> Current Team Members
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {memberEntries.length + 1} / {createForm.maxMembers} members
                  </span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {/* Lead */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                        {user.initials || "YO"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium truncate block">{user.name || "You"}</span>
                      {user.handle && (
                        <span className="text-[10px] text-muted-foreground font-mono truncate block">
                          @{user.handle}
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      Lead
                    </Badge>
                  </div>

                  {/* Added Members with Verified Badges */}
                  {memberEntries.map((m) => (
                    <div
                      key={m.id || m.handle || m.name}
                      className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                          {m.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium truncate block">{m.name}</span>
                        {m.handle && (
                          <span className="text-[10px] text-muted-foreground font-mono truncate block">
                            @{m.handle}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                        {m.role}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeMember(m.id)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[1fr_130px_auto] gap-2 pt-1">
                  <Input
                    placeholder="Student handle (e.g. vasuchandrani)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMember();
                      }
                    }}
                    disabled={verifyingMember}
                    className="h-8 text-xs bg-background"
                  />
                  <Select value={newMemberRole} onValueChange={setNewMemberRole} disabled={verifyingMember}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={addMember}
                    disabled={verifyingMember || !newMemberName.trim()}
                  >
                    {verifyingMember ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    <span>{verifyingMember ? "Checking..." : "Add"}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-border/50 bg-muted/30 shrink-0 flex gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              size="sm"
              disabled={creating}
              className="bg-gradient-hero text-primary-foreground font-semibold min-w-[140px]"
            >
              {creating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                `Publish ${createType === "open_source" ? "Open-Source Project" : "Collab"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Requests Dialog */}
      <Dialog
        open={!!viewRequestsTeam}
        onOpenChange={(open) => !open && setViewRequestsTeam(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-primary" /> Join Requests
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review and manage applicants for <strong>{viewRequestsTeam?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {(() => {
              const projectRequests = incomingRequests.filter(
                (r: any) =>
                  r.teamId === viewRequestsTeam?.id ||
                  r.projectId === viewRequestsTeam?.id
              );

              if (projectRequests.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                    <p className="font-semibold text-sm text-foreground">No join requests yet</p>
                    <p>When students apply to your opening, they will appear here.</p>
                  </div>
                );
              }

              return projectRequests.map((req: any) => {
                const status = String(req.status || "pending").toUpperCase();
                const isPending = status === "PENDING";
                const isAccepted = status === "ACCEPTED";
                const isRejected = status === "REJECTED";

                return (
                  <Card key={req.id} className="p-4 shadow-2xs space-y-2 border-border/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/student/${encodeURIComponent(req.applicantHandle || req.applicantName || "")}`}
                            className="font-bold text-sm hover:text-primary hover:underline"
                          >
                            {req.applicantName || "Student"}
                          </Link>
                          {req.applicantHandle && (
                            <span className="text-xs text-primary font-mono font-medium">
                              @{req.applicantHandle}
                            </span>
                          )}
                          <Badge
                            variant={
                              isAccepted
                                ? "default"
                                : isRejected
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>Applied for: <strong className="text-foreground">{req.role}</strong></span>
                          {req.applicantCollegeName && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {req.applicantCollegeName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5"
                            disabled={actionLoadingId === req.id}
                            onClick={() => handleRequestStatusChange(req.id, "ACCEPTED")}
                          >
                            {actionLoadingId === req.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                            disabled={actionLoadingId === req.id}
                            onClick={() => handleRequestStatusChange(req.id, "REJECTED")}
                          >
                            <XIcon className="h-3 w-3" /> Decline
                          </Button>
                        </div>
                      )}

                      {isRejected && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 px-2.5 border-primary/30"
                            disabled={actionLoadingId === req.id}
                            onClick={() => handleRequestStatusChange(req.id, "PENDING")}
                          >
                            {actionLoadingId === req.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Undo2 className="h-3 w-3" />
                            )}
                            Undo Rejection
                          </Button>
                        </div>
                      )}
                    </div>

                    {(req.message || req.reason) && (
                      <div className="text-xs bg-muted/40 p-2.5 rounded-lg border border-border/50 mt-2">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                          Applicant Note / Pitch:
                        </p>
                        <FormattedContent content={req.message || req.reason} maxEnters={2} className="text-xs" />
                      </div>
                    )}
                  </Card>
                );
              });
            })()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewRequestsTeam(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project/Team Modal */}
      <Dialog
        open={!!editTeamModal}
        onOpenChange={(open) => !open && setEditTeamModal(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Project / Team</DialogTitle>
            <DialogDescription className="text-xs">
              Update details for your collaboration listing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="h-9 text-xs"
                placeholder="Project title..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
                className="text-xs leading-relaxed"
                placeholder="Describe project vision, stack, and goals..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">GitHub Link (Optional)</Label>
              <Input
                value={editForm.githubLink}
                onChange={(e) =>
                  setEditForm({ ...editForm, githubLink: e.target.value })
                }
                className="h-9 text-xs"
                placeholder="https://github.com/username/repository"
              />
            </div>

            {/* 1. Edit Required Roles */}
            <div className="space-y-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                  <Users className="h-3.5 w-3.5" />
                  Required Roles (Looking for)
                </Label>
                <span className="text-[11px] text-muted-foreground">{editForm.requiredRoles.length} added</span>
              </div>

              {/* Pills */}
              {editForm.requiredRoles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {editForm.requiredRoles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="gap-1 px-2.5 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => removeEditRole(role)}
                        className="text-primary-foreground/80 hover:text-primary-foreground focus:outline-none ml-0.5"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No roles specified.
                </p>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type role and press Enter..."
                  value={editForm.roleInput}
                  onChange={(e) => setEditForm({ ...editForm, roleInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addEditRole(editForm.roleInput);
                    }
                  }}
                  className="h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 gap-1"
                  onClick={() => addEditRole(editForm.roleInput)}
                  disabled={!editForm.roleInput.trim()}
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1 pt-1">
                {roleOptions
                  .filter((s) => !editForm.requiredRoles.some((t) => t.toLowerCase() === s.toLowerCase()))
                  .slice(0, 6)
                  .map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addEditRole(sug)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-background hover:bg-muted text-foreground border border-border/60 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
              </div>
            </div>

            {/* 2. Edit Tech Stack / Skills */}
            <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  Tech Stack & Skills
                </Label>
                <span className="text-[11px] text-muted-foreground">{editForm.skills.length} added</span>
              </div>

              {/* Pills */}
              {editForm.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {editForm.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-1 px-2.5 py-1 text-xs bg-muted text-foreground border border-border hover:bg-muted/80 transition-all"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeEditSkill(skill)}
                        className="text-muted-foreground hover:text-destructive focus:outline-none ml-0.5"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No skills specified.
                </p>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type skill and press Enter..."
                  value={editForm.skillInput}
                  onChange={(e) => setEditForm({ ...editForm, skillInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addEditSkill(editForm.skillInput);
                    }
                  }}
                  className="h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 gap-1"
                  onClick={() => addEditSkill(editForm.skillInput)}
                  disabled={!editForm.skillInput.trim()}
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1 pt-1">
                {commonTechSuggestions
                  .filter((s) => !editForm.skills.some((t) => t.toLowerCase() === s.toLowerCase()))
                  .slice(0, 6)
                  .map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addEditSkill(sug)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
              </div>
            </div>

            {editTeamModal?.type !== "OPEN_SOURCE" &&
              editTeamModal?.type !== "open_source" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Maximum Team Members
                  </Label>
                  <Input
                    type="number"
                    min={2}
                    max={12}
                    value={editForm.maxMembers}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        maxMembers: parseInt(e.target.value) || 4,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              )}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTeamModal(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTeamEdit}
              disabled={savingEdit || !editForm.title.trim()}
              className="bg-gradient-hero text-primary-foreground font-semibold"
            >
              {savingEdit ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog
        open={!!editReqModal}
        onOpenChange={(open) => !open && setEditReqModal(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Join Request</DialogTitle>
            <DialogDescription className="text-xs">
              Update your application pitch or desired role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Desired Role</Label>
              <Input
                value={editReqForm.role}
                onChange={(e) =>
                  setEditReqForm({ ...editReqForm, role: e.target.value })
                }
                className="h-9 text-xs"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pitch / Message</Label>
              <Textarea
                value={editReqForm.message}
                onChange={(e) =>
                  setEditReqForm({ ...editReqForm, message: e.target.value })
                }
                rows={4}
                className="text-xs leading-relaxed"
                placeholder="Why are you a great fit for this team?"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditReqModal(null)}
              disabled={savingReqEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveReqEdit}
              disabled={savingReqEdit || !editReqForm.role.trim()}
              className="bg-gradient-hero text-primary-foreground font-semibold"
            >
              {savingReqEdit ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Complete Hiring Dialog */}
      <AlertDialog
        open={!!completeConfirm}
        onOpenChange={(open) => !open && !completingHiringId && setCompleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Complete Hiring for this Team?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed space-y-2">
              <span className="block text-muted-foreground">
                Completing hiring will close recruitment, lock team member slots, remove the project from public Collab Hub listings, and permanently delete all remaining pending and rejected join requests.
              </span>
              <span className="block text-destructive font-medium">
                ⚠️ All pending and rejected join requests for this team will be permanently deleted. This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!completingHiringId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold min-w-[150px]"
              disabled={!!completingHiringId}
              onClick={(e) => {
                e.preventDefault();
                if (completeConfirm) handleCompleteHiring(completeConfirm);
              }}
            >
              {completingHiringId ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Completing...</span>
                </div>
              ) : (
                "Yes, Complete Hiring"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Team Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete this Project / Team?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action will permanently delete this collaboration listing along with all its join requests and team memberships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
              onClick={() => deleteConfirm && handleDeleteTeam(deleteConfirm)}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Request Dialog */}
      <AlertDialog
        open={!!deleteReqConfirm}
        onOpenChange={(open) => !open && setDeleteReqConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Withdraw Join Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to withdraw your join application for this team?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
              onClick={() => deleteReqConfirm && handleDeleteRequest(deleteReqConfirm)}
            >
              Yes, Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Live Team Room Chat Modal */}
      {selectedChatTeam && (
        <TeamRoomChatModal
          open={roomChatOpen}
          onOpenChange={setRoomChatOpen}
          team={selectedChatTeam}
        />
      )}
    </div>
  );
}
