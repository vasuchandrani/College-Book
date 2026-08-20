import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Star,
  Users,
  Code2,
  Rocket,
  Building2,
  Calendar,
  Share2,
  UserPlus,
  Loader2,
  MessageSquare,
  Send,
  CheckCircle2,
  Tag,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getTeamById, starProject, sendJoinRequest, getMyJoinedRequests } from "@/lib/api";
import { FormattedContent } from "@/components/FormattedContent";
import { ThemedLoader } from "@/components/ThemedLoader";

export default function CollabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starring, setStarring] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  // Join Request Dialog
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinRole, setJoinRole] = useState("");
  const [joinReason, setJoinReason] = useState("");
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Room Chat Dialog
  const [roomChatOpen, setRoomChatOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("cb_user") || '{"name":"You","initials":"YO"}');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);

    Promise.all([
      getTeamById(id).catch(() => null),
      getMyJoinedRequests().catch(() => []),
    ])
      .then(([teamData, reqsData]) => {
        if (alive) {
          setTeam(teamData);
          setMyRequests(reqsData || []);
        }
      })
      .catch((e) => {
        toast.error(e.message || "Failed to load project details");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const handleToggleStar = async () => {
    if (!team) return;
    setStarring(true);
    try {
      const res = await starProject(team.id);
      setTeam((prev: any) => ({
        ...prev,
        starred: res.starred,
        starsCount: res.starred ? (prev.starsCount || 0) + 1 : Math.max(0, (prev.starsCount || 0) - 1),
      }));
      toast.success(res.starred ? "Starred project!" : "Unstarred project");
    } catch (e: any) {
      toast.error(e.message || "Failed to star project");
    } finally {
      setStarring(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Project link copied to clipboard!");
  };

  const isOpenSource = team?.type?.toLowerCase() === "open_source";
  const isHackathon = team?.type?.toLowerCase() === "hackathon";
  const isTeamProject = team?.type?.toLowerCase() === "project";

  const isLead = Boolean(
    user &&
      team &&
      ((user.id && team.ownerId && team.ownerId === user.id) ||
        (team.ownerName && (team.ownerName === user.name || team.ownerName === user.fullName)))
  );

  const isMember = Boolean(
    user &&
      team &&
      Array.isArray(team.members) &&
      team.members.some(
        (m: any) =>
          (user.id && m.userId && m.userId === user.id) ||
          (m.name && (m.name === user.name || m.name === user.fullName))
      )
  );

  const isPending = Boolean(
    team &&
      myRequests.some(
        (r: any) =>
          (r.teamId === team.id || r.projectId === team.id) &&
          String(r.status || "").toUpperCase() === "PENDING"
      )
  );

  const handleJoinSubmit = async () => {
    if (isLead) {
      toast.info("You are the lead/creator of this team.");
      setJoinOpen(false);
      return;
    }
    if (isMember) {
      toast.info("You are already a member of this team.");
      setJoinOpen(false);
      return;
    }
    if (isPending) {
      toast.info("You already have a pending join request for this team.");
      setJoinOpen(false);
      return;
    }
    if (!joinRole) {
      toast.error("Please select a role");
      return;
    }
    if (!joinReason.trim()) {
      toast.error("Please provide a short reason/message");
      return;
    }

    setSubmittingJoin(true);
    try {
      const newReq: any = await sendJoinRequest(team.id, joinRole, joinReason.trim());
      toast.success("Join request sent to project lead!");
      setMyRequests((prev) => [...prev, newReq || { teamId: team.id, status: "PENDING" }]);
      setJoinOpen(false);
      setJoinRole("");
      setJoinReason("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send join request");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const formatCreatedDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 pl-0">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <Card className="p-8 shadow-card flex flex-col items-center justify-center min-h-[360px] space-y-3">
          <ThemedLoader size="lg" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading project details...</p>
        </Card>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 pl-0">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="p-10 text-center shadow-card space-y-3">
          <Code2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h2 className="text-lg font-bold">Project Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            The collaboration project you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)} size="sm" className="mt-2 text-xs">
            Back
          </Button>
        </Card>
      </div>
    );
  }

  const allSkills = Array.from(
    new Set([...(team.requiredExpertise || []), ...(team.skills || [])])
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-20">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs h-8">
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
      </div>

      {/* Main Project Header Card */}
      <Card className="p-6 sm:p-8 shadow-card border-border/80 space-y-6 bg-card/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {isOpenSource && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-0.5">
                  <Code2 className="h-3.5 w-3.5" /> Open Source
                </Badge>
              )}
              {isHackathon && (
                <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5">
                  <Users className="h-3.5 w-3.5" /> Hackathon Team
                </Badge>
              )}
              {isTeamProject && (
                <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5">
                  <Rocket className="h-3.5 w-3.5" /> Team Project
                </Badge>
              )}

              {!isOpenSource && (
                <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                  {team.currentMembersCount || 1}/{team.maxMembers || 4} Members
                </Badge>
              )}

              {team.completed && (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                  Completed / Team Full
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {team.title}
            </h1>
          </div>

          {/* Star Button */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={starring}
              onClick={handleToggleStar}
              className={`gap-1.5 text-xs h-9 px-3.5 border border-border/70 ${
                team.starred
                  ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20 border-amber-400/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className={`h-4 w-4 ${team.starred ? "fill-amber-500 text-amber-500" : ""}`} />
              <span className="font-semibold">{team.starsCount || 0}</span>
              <span>{team.starred ? "Starred" : "Star"}</span>
            </Button>
          </div>
        </div>

        {/* Creator & Meta Details */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                {(team.ownerName || "L").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">{isOpenSource ? "Created by" : "Led by"}</span>
              <Link
                to={`/student/${encodeURIComponent(team.ownerHandle || team.ownerName || "")}`}
                className="font-semibold text-foreground hover:text-primary hover:underline"
              >
                {team.ownerName || "Student"}
              </Link>
            </div>
          </div>

          {team.ownerCollegeName && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{team.ownerCollegeName}</span>
            </div>
          )}

          {team.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Created on {formatCreatedDate(team.createdAt)}</span>
            </div>
          )}
        </div>

        {/* GitHub Repository Banner (if provided) */}
        {team.githubLink && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-muted/50 via-muted/30 to-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                <Github className="h-5 w-5 text-foreground" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  GitHub Repository
                </span>
                <span className="text-sm font-semibold text-foreground truncate block">
                  {team.githubLink.replace(/^https?:\/\//, "")}
                </span>
              </div>
            </div>

            <a
              href={team.githubLink.startsWith("http") ? team.githubLink : `https://${team.githubLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity shrink-0"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Open on GitHub</span>
              <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
            </a>
          </div>
        )}

        {/* Project Description & Goals */}
        <div className="space-y-2.5 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" /> About Project & Goals
          </h2>
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60">
            {team.description ? (
              <FormattedContent content={team.description} maxEnters={3} className="text-sm sm:text-base leading-relaxed text-foreground/90" />
            ) : (
              <p className="text-sm text-muted-foreground italic">No detailed description provided.</p>
            )}
          </div>
        </div>

        {/* Looking for Roles */}
        {((team.requiredRoles && team.requiredRoles.length > 0) ||
          (team.requiredExpertise && team.requiredExpertise.length > 0)) && (
          <div className="space-y-2.5 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Looking for Roles
            </h2>
            <div className="flex flex-wrap gap-2">
              {(team.requiredRoles || team.requiredExpertise || []).map((role: string, idx: number) => (
                <Badge
                  key={`${role}-${idx}`}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors shadow-2xs"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills & Tech Stack */}
        {team.skills && team.skills.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-primary" /> {isOpenSource ? "Technologies & Tech Stack" : "Required Skills"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {team.skills.map((skill: string, idx: number) => (
                <Badge
                  key={`${skill}-${idx}`}
                  variant="outline"
                  className="px-3 py-1 text-xs font-medium bg-muted/40 hover:bg-muted transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Team Members List (For Hackathon & Team Projects) */}
        {!isOpenSource && (
          <div className="space-y-2.5 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Team Members ({team.members?.length || team.currentMembersCount || 1}/{team.maxMembers || 4})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Creator / Lead */}
              <Link
                to={`/student/${encodeURIComponent(team.ownerHandle || team.ownerName || "")}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/70 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer group shadow-2xs"
              >
                <Avatar className="h-8 w-8 group-hover:ring-2 group-hover:ring-primary/40 transition-all">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {(team.ownerName || "L").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary group-hover:underline truncate block transition-colors">
                    {team.ownerName || "Lead"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {team.ownerHandle ? `@${team.ownerHandle} • ` : ""}Team Lead & Creator
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                  Lead
                </Badge>
              </Link>

              {/* Other Members if available */}
              {team.members
                ?.filter((m: any) => m.userId !== team.ownerId && m.name !== team.ownerName)
                .map((m: any) => (
                  <Link
                    key={m.userId || m.name}
                    to={`/student/${encodeURIComponent(m.handle || m.name || "")}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/70 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer group shadow-2xs"
                  >
                    <Avatar className="h-8 w-8 group-hover:ring-2 group-hover:ring-primary/40 transition-all">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {(m.name || "M").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary group-hover:underline truncate block transition-colors">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {m.handle ? `@${m.handle} • ` : ""}{m.role || "Member"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {m.role || "Member"}
                    </Badge>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Action Bottom Section */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {isOpenSource
                ? "Want to contribute to this open-source project?"
                : "Interested in joining this team?"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              {isOpenSource
                ? "Fork or clone the repository on GitHub, explore open issues, or submit a pull request."
                : "Send a request to the team lead with your desired role and why you'd like to collaborate."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOpenSource && team.githubLink && (
              <a
                href={team.githubLink.startsWith("http") ? team.githubLink : `https://${team.githubLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
              >
                <Github className="h-4 w-4" /> Contribute on GitHub
              </a>
            )}

            {!isOpenSource && (
              team.completed ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold select-none">
                    ✓ Hiring Completed
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => setRoomChatOpen(true)}
                    className="gap-1.5 text-xs h-9 px-3.5 bg-primary text-primary-foreground font-semibold shadow-xs hover:opacity-90"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Room Chat
                  </Button>
                </div>
              ) : isLead ? (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 px-3.5 py-2 text-xs font-medium flex items-center select-none">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Your Team
                </Badge>
              ) : isMember ? (
                <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2 text-xs font-medium flex items-center select-none">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Joined Member
                </Badge>
              ) : isPending ? (
                <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3.5 py-2 text-xs font-medium flex items-center select-none">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Review
                </Badge>
              ) : (
                <Button
                  onClick={() => setJoinOpen(true)}
                  size="sm"
                  className="gap-1.5 text-xs h-9 px-4 bg-gradient-hero text-primary-foreground font-semibold"
                >
                  <UserPlus className="h-4 w-4" /> Request to Join
                </Button>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Discussion & Comments Section */}
      <Card className="p-6 sm:p-8 shadow-card border-border/80 space-y-4 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Project Discussion
            </h2>
          </div>
          <Badge variant="outline" className="text-[11px] bg-muted/40">
            0 comments
          </Badge>
        </div>

        {/* Info Banner for Upcoming Comments Feature */}
        <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-border flex items-start gap-3">
          <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Comments & Discussion Thread (Coming Soon)
            </p>
            <p className="text-xs text-muted-foreground">
              We will be introducing project discussions soon! Students and contributors will be able to share feedback, ask questions, and brainstorm ideas right here.
            </p>
          </div>
        </div>

        {/* Teaser input */}
        <div className="space-y-2 pt-1 opacity-60">
          <Textarea
            placeholder="Project discussion thread will be enabled soon..."
            disabled
            rows={2}
            className="text-xs bg-muted/20 resize-none cursor-not-allowed"
          />
          <div className="flex justify-end">
            <Button size="sm" disabled className="text-xs gap-1.5 h-8">
              <Send className="h-3 w-3" /> Post Comment
            </Button>
          </div>
        </div>
      </Card>

      {/* Join Request Dialog (For Hackathon & Team Projects) */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Join {team.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send a message to {team.ownerName || "the team lead"} explaining how you'd like to contribute.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Your Desired Role</Label>
              <Select value={joinRole} onValueChange={setJoinRole}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select your preferred role" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    new Set([
                      ...(team?.requiredRoles || team?.requiredExpertise || []),
                      "Frontend Developer",
                      "Backend Developer",
                      "Full Stack Developer",
                      "UI/UX Designer",
                      "Mobile App Developer",
                      "Machine Learning / AI Engineer",
                      "Data Scientist",
                      "DevOps / Cloud Engineer",
                      "Product / Project Manager",
                      "Cybersecurity Analyst",
                    ])
                  ).map((role) => (
                    <SelectItem key={role} value={role} className="text-xs">
                      {(team?.requiredRoles || team?.requiredExpertise || []).includes(role)
                        ? `⭐ ${role} (Requested by Team)`
                        : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Why do you want to join? (Short pitch)</Label>
                <span className="text-[10px] text-muted-foreground">
                  {joinReason.length}/1000
                </span>
              </div>
              <Textarea
                placeholder="Share your experience, skills, links, and what excites you about this project..."
                value={joinReason}
                maxLength={1000}
                onChange={(e) => setJoinReason(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                Supports clickable links and up to 2 line breaks.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setJoinOpen(false)} disabled={submittingJoin}>
              Cancel
            </Button>
            <Button
              onClick={handleJoinSubmit}
              size="sm"
              disabled={submittingJoin}
              className="bg-gradient-hero text-primary-foreground font-semibold min-w-[120px]"
            >
              {submittingJoin ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Chat Feature Dialog */}
      <Dialog open={roomChatOpen} onOpenChange={setRoomChatOpen}>
        <DialogContent className="sm:max-w-md text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold">Team Room Chat</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            We will introduce room chat soon! Private real-time team channels, file sharing, and task coordination for completed teams will be available here.
          </DialogDescription>
          <DialogFooter className="mt-5 sm:justify-center">
            <Button onClick={() => setRoomChatOpen(false)} className="rounded-xl px-6 font-semibold">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
