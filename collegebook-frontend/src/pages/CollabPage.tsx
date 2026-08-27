import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Rocket,
  UserPlus,
  Star,
  Github,
  X as XIcon,
  Code2,
  Building2,
  Briefcase,
  RotateCcw,
  ExternalLink,
  Loader2,
  Eye,
  CheckCircle2,
  FolderGit2,
  Clock,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getCollabTeams, getMyJoinedRequests, createTeam, starProject, sendJoinRequest, lookupStudent } from "@/lib/api";
import { ThemedLoader } from "@/components/ThemedLoader";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import { isValidHttpUrl, normalizeUrl } from "@/lib/urlUtils";

import { clientCache } from "@/lib/clientCache";

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
  id: number | string;
  name: string;
  handle?: string;
  role: string;
}

const CollabPage = () => {
  const [search, setSearch] = useState("");
  const cachedTeams = clientCache.get<any[]>("collab_teams");
  const cachedReqs = clientCache.get<any[]>("collab_my_requests");

  const [teams, setTeams] = useState<any[]>(() => cachedTeams || []);
  const [myRequests, setMyRequests] = useState<any[]>(() => cachedReqs || []);
  const [loading, setLoading] = useState(() => !cachedTeams);
  const { triggerToggle } = useDebouncedToggle(400);

  // 3 Filters (No Sort By)
  const [selectedTech, setSelectedTech] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedCollege, setSelectedCollege] = useState<string>("ALL");

  // Create Dialog
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

  // Tag-based required roles
  const [roleTags, setRoleTags] = useState<string[]>([]);
  const [roleTagInput, setRoleTagInput] = useState("");

  // Tag-based skills / tech stack
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillTagInput, setSkillTagInput] = useState("");

  // Team Members
  const [memberEntries, setMemberEntries] = useState<MemberEntry[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Frontend Dev");
  const [verifyingMember, setVerifyingMember] = useState(false);

  // Join request dialog
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState<{ name: string; type: string; openRoles?: string[] } | null>(null);
  const [joinRole, setJoinRole] = useState("");
  const [joinReason, setJoinReason] = useState("");
  const [joinTargetId, setJoinTargetId] = useState<string | number | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  const user = JSON.parse(localStorage.getItem("cb_user") || '{"name":"You","initials":"YO"}');

  useEffect(() => {
    let alive = true;
    const existingTeams = clientCache.get<any[]>("collab_teams");
    if (!existingTeams) {
      setLoading(true);
    }
    Promise.all([
      getCollabTeams().catch(() => []),
      getMyJoinedRequests().catch(() => []),
    ])
      .then(([teamsData, reqsData]) => {
        if (alive) {
          const freshTeams = teamsData || [];
          const freshReqs = reqsData || [];
          setTeams(freshTeams);
          setMyRequests(freshReqs);
          clientCache.set("collab_teams", freshTeams, 300_000);
          clientCache.set("collab_my_requests", freshReqs, 300_000);
        }
      })
      .catch(() => {
        if (alive && !existingTeams) toast.error("Failed to load collaboration projects");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleToggleStar = (teamId: string | number) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const currentStarred = !!team.starred;

    triggerToggle(
      teamId,
      currentStarred,
      (newStarred) => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === teamId
              ? {
                ...t,
                starred: newStarred,
                starsCount: newStarred
                  ? t.starred
                    ? t.starsCount
                    : (t.starsCount || 0) + 1
                  : t.starred
                    ? Math.max(0, (t.starsCount || 0) - 1)
                    : t.starsCount || 0,
              }
              : t
          )
        );
      },
      (signal) => starProject(teamId, signal)
    );
  };

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

  const addMember = async () => {
    const rawInput = newMemberName.trim();
    if (!rawInput) {
      toast.error("Enter a student handle or username (e.g. vasuchandrani)");
      return;
    }
    const cleanHandle = rawInput.replace(/^@/, "");

    // 1. Check if user is adding themselves
    if (
      (user.handle && cleanHandle.toLowerCase() === user.handle.toLowerCase()) ||
      (user.name && cleanHandle.toLowerCase() === user.name.toLowerCase())
    ) {
      toast.error("You are already the Team Lead and automatically included.");
      return;
    }

    // 2. Check if already in memberEntries
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

    // 3. Check max members
    const maxM = parseInt(createForm.maxMembers, 10) || 4;
    if (memberEntries.length + 1 >= maxM) {
      toast.error(`Cannot add more than ${maxM} members (including team lead).`);
      return;
    }

    // 4. Verify student existence in system
    try {
      setVerifyingMember(true);
      const res = await lookupStudent(cleanHandle);
      if (!res || !res.exists || !res.student) {
        toast.error(res?.message || `Student "@${cleanHandle}" not found in CollegeBook. Make sure they have registered.`);
        return;
      }

      const student = res.student;

      if (student.userId && user.id && student.userId === user.id) {
        toast.error("You are already the Team Lead and automatically included.");
        return;
      }

      setMemberEntries((prev) => [
        ...prev,
        {
          id: student.userId || Date.now(),
          name: student.fullName,
          handle: student.handle || cleanHandle,
          role: newMemberRole || "Contributor",
        },
      ]);
      toast.success(`Verified: ${student.fullName} (@${student.handle || cleanHandle}) added!`);
      setNewMemberName("");
    } catch (err: any) {
      toast.error(`Student "@${cleanHandle}" not found in CollegeBook. Make sure they have an active account.`);
    } finally {
      setVerifyingMember(false);
    }
  };

  const removeMember = (id: number | string) => {
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
    setNewMemberRole("");
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error("Please provide a title / name");
      return;
    }

    if (createType === "open_source" && !createForm.githubLink.trim()) {
      toast.error("Please provide the GitHub repository URL for the open-source project");
      return;
    }

    if (createForm.githubLink.trim() && !isValidHttpUrl(createForm.githubLink.trim())) {
      toast.error("Please provide a valid GitHub repository or project web link (e.g. https://github.com/username/repo)");
      return;
    }

    const maxM = createType === "open_source" ? 0 : parseInt(createForm.maxMembers) || 4;
    setCreating(true);

    const finalDescription =
      createType === "hackathon"
        ? createForm.description.trim()
          ? createForm.hackathon.trim()
            ? `Hackathon: ${createForm.hackathon.trim()}\n\n${createForm.description.trim()}`
            : createForm.description.trim()
          : createForm.hackathon.trim() || "Hackathon Team"
        : createForm.description.trim();

    try {
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

      setTeams([newTeam, ...teams]);
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

  const isUserLeadOf = (t: any) => {
    if (!user || !t) return false;
    return (
      (user.id && t.ownerId && t.ownerId === user.id) ||
      (t.ownerName && (t.ownerName === user.name || t.ownerName === user.fullName))
    );
  };

  const isUserMemberOf = (t: any) => {
    if (!user || !t || !Array.isArray(t.members)) return false;
    return t.members.some(
      (m: any) =>
        (user.id && m.userId && m.userId === user.id) ||
        (m.name && (m.name === user.name || m.name === user.fullName))
    );
  };

  const isUserPendingFor = (t: any) => {
    if (!t || !myRequests || myRequests.length === 0) return false;
    return myRequests.some(
      (r: any) =>
        (r.teamId === t.id || r.projectId === t.id) &&
        String(r.status || "").toUpperCase() === "PENDING"
    );
  };

  const openJoinDialog = (id: string | number, name: string, type: string) => {
    const targetTeam = teams.find((t) => t.id === id);
    if (targetTeam) {
      if (isUserLeadOf(targetTeam)) {
        toast.info("You are the lead/creator of this team.");
        return;
      }
      if (isUserMemberOf(targetTeam)) {
        toast.info("You are already a member of this team.");
        return;
      }
      if (isUserPendingFor(targetTeam)) {
        toast.info("You already have a pending join request for this team.");
        return;
      }
    }
    const openRoles =
      targetTeam?.requiredRoles && targetTeam.requiredRoles.length > 0
        ? targetTeam.requiredRoles
        : targetTeam?.requiredExpertise && targetTeam.requiredExpertise.length > 0
          ? targetTeam.requiredExpertise
          : [];
    setJoinTargetId(id);
    setJoinTarget({ name, type, openRoles });
    setJoinRole(openRoles[0] || (openRoles.length === 0 ? "Contributor" : ""));
    setJoinReason("");
    setJoinOpen(true);
  };

  const handleSendRequest = async () => {
    if (!joinRole) {
      toast.error("Please select a role");
      return;
    }
    if (!joinReason.trim()) {
      toast.error("Please write why you want to join");
      return;
    }
    if (!joinTargetId) return;

    const targetTeam = teams.find((t) => t.id === joinTargetId);
    if (targetTeam) {
      if (isUserLeadOf(targetTeam)) {
        toast.info("You are the lead/creator of this team.");
        setJoinOpen(false);
        return;
      }
      if (isUserMemberOf(targetTeam)) {
        toast.info("You are already a member of this team.");
        setJoinOpen(false);
        return;
      }
      if (isUserPendingFor(targetTeam)) {
        toast.info("You already have a pending join request for this team.");
        setJoinOpen(false);
        return;
      }
    }

    try {
      setSendingRequest(true);
      const newReq: any = await sendJoinRequest(joinTargetId, joinRole, joinReason.trim());
      toast.success(`Request sent to join "${joinTarget?.name}"!`);
      setMyRequests((prev) => [...prev, newReq || { teamId: joinTargetId, status: "PENDING" }]);
      setJoinOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to send join request");
    } finally {
      setSendingRequest(false);
    }
  };

  // Derive filter options dynamically from current loaded teams
  const availableColleges = useMemo(() => {
    const list = new Set<string>();
    teams.forEach((t) => {
      const col = t.ownerCollegeName || t.collegeName || t.college;
      if (col && typeof col === "string" && col.trim()) {
        list.add(col.trim());
      }
    });
    return Array.from(list).sort((a, b) => a.localeCompare(b));
  }, [teams]);

  const availableTechs = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => {
      (t.skills || []).forEach((skill: string) => {
        if (skill && typeof skill === "string" && skill.trim()) {
          set.add(skill.trim());
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teams]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => {
      (t.requiredRoles || t.requiredExpertise || []).forEach((role: string) => {
        if (role && typeof role === "string" && role.trim()) {
          set.add(role.trim());
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teams]);

  // Master Filter function (3 filters: Tech Stack, Role, College)
  const applyFilters = useCallback((items: any[]) => {
    return items.filter((t) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = (t.title || "").toLowerCase().includes(q);
        const matchesDesc = (t.description || "").toLowerCase().includes(q);
        const matchesLead = (t.ownerName || "").toLowerCase().includes(q);
        const matchesCollege = (t.ownerCollegeName || "").toLowerCase().includes(q);
        const matchesSkills = (t.skills || []).some((s: string) => s.toLowerCase().includes(q));
        const matchesRoles = (t.requiredRoles || t.requiredExpertise || []).some((r: string) =>
          r.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesDesc && !matchesLead && !matchesCollege && !matchesSkills && !matchesRoles) {
          return false;
        }
      }

      // 1. Tech Stack / Skills Filter
      if (selectedTech !== "ALL") {
        if (selectedTech === "NOT_PROVIDED") {
          const hasTech = t.skills && t.skills.length > 0;
          if (hasTech) return false;
        } else {
          const hasMatch = (t.skills || []).some(
            (s: string) => s.toLowerCase() === selectedTech.toLowerCase()
          );
          if (!hasMatch) return false;
        }
      }

      // 2. Role Filter
      if (selectedRole !== "ALL") {
        const matchesRole = (t.requiredRoles || t.requiredExpertise || []).some((s: string) =>
          s.toLowerCase().includes(selectedRole.toLowerCase()) ||
          selectedRole.toLowerCase().includes(s.toLowerCase())
        );
        if (!matchesRole) return false;
      }

      // 3. College Filter
      if (selectedCollege !== "ALL") {
        if ((t.ownerCollegeName || "").toLowerCase() !== selectedCollege.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [search, selectedTech, selectedRole, selectedCollege]);

  const openSourceProjects = useMemo(
    () =>
      applyFilters(
        teams.filter((t) => t.type === "OPEN_SOURCE" || t.type === "open_source")
      ),
    [teams, applyFilters]
  );

  const hackathonTeams = useMemo(
    () =>
      applyFilters(
        teams.filter((t) => t.type === "HACKATHON" || t.type === "hackathon")
      ),
    [teams, applyFilters]
  );

  const teamProjects = useMemo(
    () =>
      applyFilters(
        teams.filter(
          (t) =>
            t.type === "PROJECT" ||
            t.type === "project" ||
            (!t.type && t.type !== "OPEN_SOURCE" && t.type !== "HACKATHON")
        )
      ),
    [teams, applyFilters]
  );

  const isAnyFilterActive =
    search.trim() !== "" ||
    selectedTech !== "ALL" ||
    selectedRole !== "ALL" ||
    selectedCollege !== "ALL";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedTech("ALL");
    setSelectedRole("ALL");
    setSelectedCollege("ALL");
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20">
      <SEO
        title="Collab Hub — Build Teams & Open Source"
        description="Discover open-source repositories, find hackathon teammates, and build student software together on CollegeBook Collab Hub."
        keywords="collab hub, hackathon team builder, collegebook collab, open source student projects, coding partners"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
            Collab Hub
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Discover open-source gems, assemble hackathon teams, and collaborate with peers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm sm:gap-2">
            <Link to="/my-collaboration">
              <FolderGit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="hidden sm:inline">My Collaboration</span>
              <span className="sm:hidden">My Collab</span>
            </Link>
          </Button>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-hero text-primary-foreground gap-1.5 sm:gap-2 shrink-0 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Create
              </Button>
            </DialogTrigger>
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
                      <Briefcase className="h-3.5 w-3.5" />
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

                      {/* Added Members */}
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
                  onClick={handleCreate}
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
        </div>
      </div>

      {/* 3 Filters: Tech Stack, Role, College */}
      <Card className="p-4 shadow-sm border border-border/70 space-y-3.5 bg-card/60 backdrop-blur-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name, tech stack, lead, or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>

        {/* 3 Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Technology / Tech Stack Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Code2 className="h-3 w-3 text-primary" /> Tech Stack
            </Label>
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Technologies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  All Technologies
                </SelectItem>
                <SelectItem value="NOT_PROVIDED" className="text-xs text-amber-600 dark:text-amber-400">
                  Not Provided / Unspecified
                </SelectItem>
                {availableTechs.map((tech) => (
                  <SelectItem key={tech} value={tech} className="text-xs">
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Role Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-primary" /> Desired Role
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  All Roles
                </SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role} className="text-xs">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Creator's College Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3 text-primary" /> Lead's College
            </Label>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  All Colleges
                </SelectItem>
                {availableColleges.map((college) => (
                  <SelectItem key={college} value={college} className="text-xs">
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Active Filters */}
        {isAnyFilterActive && (
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-muted-foreground text-[11px]">Active filters applied</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-[11px] px-2 text-primary hover:text-primary gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset all filters
            </Button>
          </div>
        )}
      </Card>

      {/* Tabs in Exact Order without numbers: 1. Open Source -> 2. Hackathon -> 3. Team Project */}
      <Tabs defaultValue="open_source" className="space-y-4 sm:space-y-5">
        <TabsList className="bg-muted/80 p-1.5 rounded-xl grid grid-cols-3 w-full h-auto gap-1.5 shadow-2xs">
          <TabsTrigger value="open_source" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <Code2 className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Open-source</span>
          </TabsTrigger>
          <TabsTrigger value="hackathon" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Hackathons</span>
          </TabsTrigger>
          <TabsTrigger value="project" className="gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-xs md:text-sm font-semibold rounded-lg min-w-0">
            <Rocket className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Team Projects</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Open-source Projects */}
        <TabsContent value="open_source" className="space-y-4 focus-visible:outline-none">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <ThemedLoader size="md" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Loading open-source projects...
              </p>
            </div>
          ) : (
            <>
              {openSourceProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                >
                  <Card className="p-5 shadow-card hover:shadow-elevated transition-all border-border/80 hover:border-primary/40">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/collab/${project.id}`}
                            className="font-bold text-base text-foreground tracking-tight hover:text-primary hover:underline transition-colors"
                          >
                            {project.title}
                          </Link>
                          <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary border border-primary/20">
                            Open Source
                          </Badge>
                        </div>

                        {/* Description (2 lines clamp + ellipsis) */}
                        <p className="text-sm text-foreground/85 leading-relaxed line-clamp-2 text-ellipsis">
                          {project.description || "Open source project open for campus contributions."}
                        </p>

                        {/* GitHub Link */}
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
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 transition-colors"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[280px]">
                                {project.githubLink.replace(/^https?:\/\//, "")}
                              </span>
                              <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                            </a>
                          </div>
                        )}

                        {/* Creator / Lead & College */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-2 py-1 rounded-md border border-border/40">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                {(project.ownerName || "L").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              to={`/student/${encodeURIComponent(project.ownerName || "")}`}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {project.ownerName || "Student"}
                            </Link>
                            <span className="text-muted-foreground text-[10px]">· Creator</span>
                          </div>

                          {project.ownerCollegeName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3 text-muted-foreground/70" />
                              <span>{project.ownerCollegeName}</span>
                            </div>
                          )}
                        </div>

                        {/* Open Roles & Tech Stack Tags */}
                        <div className="space-y-2 pt-1">
                          {((project.requiredRoles && project.requiredRoles.length > 0) ||
                            (project.requiredExpertise && project.requiredExpertise.length > 0)) && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" /> Looking for roles:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(project.requiredRoles || project.requiredExpertise || []).map(
                                    (role: string, idx: number) => (
                                      <Badge
                                        key={`${project.id}-role-${role}-${idx}`}
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
                                {project.skills.map((skill: string, idx: number) => (
                                  <Badge
                                    key={`${project.id}-skill-${skill}-${idx}`}
                                    variant="outline"
                                    className="text-[11px] px-2 py-0.5 font-medium bg-muted/40"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: View Details, Star & Contribute */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto justify-start sm:justify-end sm:flex-col sm:items-end">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8 px-2.5 border border-border/70 hover:bg-muted font-medium w-auto"
                        >
                          <Link to={`/collab/${project.id}`}>
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                        </Button>

                        {project.githubLink && (
                          <a
                            href={
                              project.githubLink.startsWith("http")
                                ? project.githubLink
                                : `https://${project.githubLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity w-auto h-8"
                          >
                            <Github className="h-3.5 w-3.5" /> Contribute
                          </a>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStar(project.id)}
                          className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 hover:border-border w-auto ${project.starred
                              ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                              : "text-muted-foreground"
                            }`}
                        >
                          <Star className={`h-4 w-4 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                          <span className="font-semibold">{project.starsCount || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {openSourceProjects.length === 0 && (
                <Card className="p-10 text-center shadow-card space-y-2 border-dashed">
                  <Code2 className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <h4 className="font-semibold text-sm">No Open-Source Projects found</h4>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                    No open source repositories match your current filters. Be the first to share your project!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreateType("open_source");
                      setCreateOpen(true);
                    }}
                    className="mt-2 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Publish Open Source Repo
                  </Button>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab 2: Hackathon Teams */}
        <TabsContent value="hackathon" className="space-y-4 focus-visible:outline-none">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <ThemedLoader size="md" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Loading hackathon teams...
              </p>
            </div>
          ) : (
            <>
              {hackathonTeams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                >
                  <Card className="p-5 shadow-card hover:shadow-elevated transition-all border-border/80 hover:border-primary/40">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/collab/${team.id}`}
                            className="font-bold text-base text-foreground tracking-tight hover:text-primary hover:underline transition-colors"
                          >
                            {team.title}
                          </Link>
                          <Badge variant="secondary" className="text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Hackathon Team
                          </Badge>
                          <Badge variant="secondary" className="text-[11px]">
                            {team.currentMembersCount || 1}/{team.maxMembers || 4} members
                          </Badge>
                        </div>

                        {/* Description (2 lines clamp) */}
                        <p className="text-sm text-foreground/85 leading-relaxed line-clamp-2 text-ellipsis">
                          {team.description || "Hackathon team assembling for competition."}
                        </p>

                        {/* Team Lead & College */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-2 py-1 rounded-md border border-border/40">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                {(team.ownerName || "L").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              to={`/student/${encodeURIComponent(team.ownerName || "")}`}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {team.ownerName || "Student"}
                            </Link>
                            <span className="text-muted-foreground text-[10px]">· Lead</span>
                          </div>

                          {team.ownerCollegeName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3 text-muted-foreground/70" />
                              <span>{team.ownerCollegeName}</span>
                            </div>
                          )}
                        </div>

                        {/* Looking for Roles & Tech Stack */}
                        <div className="space-y-2 pt-1">
                          {((team.requiredRoles && team.requiredRoles.length > 0) ||
                            (team.requiredExpertise && team.requiredExpertise.length > 0)) && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" /> Looking for roles:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(team.requiredRoles || team.requiredExpertise || []).map(
                                    (role: string, idx: number) => (
                                      <Badge
                                        key={`${team.id}-req-${role}-${idx}`}
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

                          {team.skills && team.skills.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Code2 className="h-3 w-3" /> Tech Stack:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {team.skills.map((skill: string, idx: number) => (
                                  <Badge
                                    key={`${team.id}-skill-${skill}-${idx}`}
                                    variant="outline"
                                    className="text-[11px] px-2 py-0.5 font-medium bg-muted/40"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions: View Details, Request to Join, Star */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto justify-start sm:justify-end sm:flex-col sm:items-end">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8 px-2.5 border border-border/70 hover:bg-muted font-medium w-auto"
                        >
                          <Link to={`/collab/${team.id}`}>
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                        </Button>

                        {isUserLeadOf(team) ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs h-8 px-2.5 bg-primary/10 text-primary border border-primary/20 font-medium flex items-center justify-center w-auto select-none"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Your Team
                          </Badge>
                        ) : isUserMemberOf(team) ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs h-8 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center justify-center w-auto select-none"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Joined Member
                          </Badge>
                        ) : isUserPendingFor(team) ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs h-8 px-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium flex items-center justify-center w-auto select-none"
                          >
                            <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Review
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs h-8 px-2.5 bg-gradient-hero text-primary-foreground font-semibold w-auto"
                            onClick={() => openJoinDialog(team.id, team.title, "hackathon")}
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Request to Join
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStar(team.id)}
                          className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 hover:border-border w-auto ${team.starred
                              ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                              : "text-muted-foreground"
                            }`}
                        >
                          <Star className={`h-4 w-4 ${team.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                          <span className="font-semibold">{team.starsCount || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {hackathonTeams.length === 0 && (
                <Card className="p-10 text-center shadow-card space-y-2 border-dashed">
                  <Users className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <h4 className="font-semibold text-sm">No Hackathon Teams found</h4>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                    No teams currently looking for members match your search. Create one and invite peers!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreateType("hackathon");
                      setCreateOpen(true);
                    }}
                    className="mt-2 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Assemble Hackathon Team
                  </Button>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab 3: Team Projects */}
        <TabsContent value="project" className="space-y-4 focus-visible:outline-none">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <ThemedLoader size="md" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Loading team projects...
              </p>
            </div>
          ) : (
            <>
              {teamProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                >
                  <Card className="p-5 shadow-card hover:shadow-elevated transition-all border-border/80 hover:border-primary/40">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/collab/${project.id}`}
                            className="font-bold text-base text-foreground tracking-tight hover:text-primary hover:underline transition-colors"
                          >
                            {project.title}
                          </Link>
                          <Badge variant="secondary" className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Team Project
                          </Badge>
                          <Badge variant="secondary" className="text-[11px]">
                            {project.currentMembersCount || 1}/{project.maxMembers || 4} members
                          </Badge>
                          {project.completed && (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                              Team Full
                            </Badge>
                          )}
                        </div>

                        {/* Description (2 lines clamp) */}
                        <p className="text-sm text-foreground/85 leading-relaxed line-clamp-2 text-ellipsis">
                          {project.description || "Building a student project collaboration."}
                        </p>

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
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[280px]">
                                {project.githubLink.replace(/^https?:\/\//, "")}
                              </span>
                            </a>
                          </div>
                        )}

                        {/* Team Lead & College */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-2 py-1 rounded-md border border-border/40">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                {(project.ownerName || "L").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              to={`/student/${encodeURIComponent(project.ownerName || "")}`}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {project.ownerName || "Student"}
                            </Link>
                            <span className="text-muted-foreground text-[10px]">· Lead</span>
                          </div>

                          {project.ownerCollegeName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3 text-muted-foreground/70" />
                              <span>{project.ownerCollegeName}</span>
                            </div>
                          )}
                        </div>

                        {/* Looking for Roles & Tech Stack */}
                        <div className="space-y-2 pt-1">
                          {((project.requiredRoles && project.requiredRoles.length > 0) ||
                            (project.requiredExpertise && project.requiredExpertise.length > 0)) && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" /> Looking for roles:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(project.requiredRoles || project.requiredExpertise || []).map(
                                    (role: string, idx: number) => (
                                      <Badge
                                        key={`${project.id}-role-${role}-${idx}`}
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
                                {project.skills.map((skill: string, idx: number) => (
                                  <Badge
                                    key={`${project.id}-skill-${skill}-${idx}`}
                                    variant="outline"
                                    className="text-[11px] px-2 py-0.5 font-medium bg-muted/40"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions: View Details, Request to Join, Star */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto justify-start sm:justify-end sm:flex-col sm:items-end">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8 px-2.5 border border-border/70 hover:bg-muted font-medium w-auto inline-flex"
                        >
                          <Link to={`/collab/${project.id}`}>
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                        </Button>

                        {isUserLeadOf(project) ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs h-8 px-2.5 bg-primary/10 text-primary border border-primary/20 font-medium flex items-center justify-center w-auto select-none inline-flex"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Your Team
                          </Badge>
                        ) : isUserMemberOf(project) ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs h-8 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center justify-center w-auto select-none inline-flex"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Joined Member
                          </Badge>
                        ) : isUserPendingFor(project) ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs h-8 px-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium flex items-center justify-center w-auto select-none inline-flex"
                          >
                            <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Review
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs h-8 px-2.5 bg-gradient-hero text-primary-foreground font-semibold w-auto inline-flex"
                            onClick={() => openJoinDialog(project.id, project.title, "project")}
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Request to Join
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStar(project.id)}
                          className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 hover:border-border w-auto inline-flex ${project.starred
                              ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                              : "text-muted-foreground"
                            }`}
                        >
                          <Star className={`h-4 w-4 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                          <span className="font-semibold">{project.starsCount || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {teamProjects.length === 0 && (
                <Card className="p-10 text-center shadow-card space-y-2 border-dashed">
                  <Rocket className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <h4 className="font-semibold text-sm">No Team Projects found</h4>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                    No team collaboration projects match your search. Start a project and find teammates!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreateType("project");
                      setCreateOpen(true);
                    }}
                    className="mt-2 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Start Team Project
                  </Button>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Join Request Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Join {joinTarget?.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your collaboration application to the team lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role you want to join as</Label>
              <Select value={joinRole} onValueChange={setJoinRole}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {joinTarget?.openRoles && joinTarget.openRoles.length > 0 ? (
                    joinTarget.openRoles.map((r: string) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Contributor" className="text-xs">
                      Contributor
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Why do you want to join?</Label>
              <Textarea
                placeholder="Describe your background, skills, and what you would like to contribute..."
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                className="min-h-[100px] text-xs leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setJoinOpen(false)} disabled={sendingRequest}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-hero text-primary-foreground font-semibold text-xs min-w-[120px]"
              size="sm"
              onClick={handleSendRequest}
              disabled={sendingRequest}
            >
              {sendingRequest ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollabPage;
