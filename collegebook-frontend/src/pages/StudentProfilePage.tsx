import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Globe,
  Github,
  Mail,
  FileText,
  Link as LinkIcon,
  Heart,
  Bookmark,
  Share2,
  Shield,
  Award,
  Star,
  Code2,
  Users,
  Rocket,
  UserPlus,
  ExternalLink,
  Eye,
  CheckCircle2,
  Crown,
  Copy,
  Phone,
  MessageSquare,
  User,
  UserX,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import FormattedContent from "@/components/FormattedContent";
import ThemedLoader from "@/components/ThemedLoader";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import InlineCommentsSection from "@/components/InlineCommentsSection";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import { formatSmartDate } from "@/lib/dateUtils";
import {
  getStudentBySlug,
  getStudentPosts,
  getStudentTeams,
  starProject,
  sendJoinRequest,
  likePost as apiLikePost,
  savePost as apiSavePost,
  sharePostLink,
  normalizeCourseShort,
  type PublicStudentProfile,
  type FeedPost,
} from "@/lib/api";
import { clientCache } from "@/lib/clientCache";

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

const StudentProfilePage = () => {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || "");
  const user = JSON.parse(localStorage.getItem("cb_user") || "{}");

  const cachedStudent = clientCache.get<PublicStudentProfile>(`student_profile_${decodedName}`);
  const cachedPosts = clientCache.get<FeedPost[]>(`student_posts_${decodedName}`);
  const cachedTeams = clientCache.get<any[]>(`student_teams_${decodedName}`);

  const [student, setStudent] = useState<PublicStudentProfile | null>(() => cachedStudent || null);
  const [studentPosts, setStudentPosts] = useState<FeedPost[]>(() => cachedPosts || []);
  const [studentTeams, setStudentTeams] = useState<any[]>(() => cachedTeams || []);
  const [loading, setLoading] = useState(() => !cachedStudent);
  const [notFound, setNotFound] = useState(false);
  const [postsLoading, setPostsLoading] = useState(() => !cachedPosts);
  const [teamsLoading, setTeamsLoading] = useState(() => !cachedTeams);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | number | null>(null);
  const { triggerToggle } = useDebouncedToggle(400);

  // Join Dialog
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState("");
  const [joinTargetId, setJoinTargetId] = useState<string | number | null>(null);
  const [joinRole, setJoinRole] = useState("");
  const [joinReason, setJoinReason] = useState("");

  useEffect(() => {
    let alive = true;
    const existing = clientCache.get<PublicStudentProfile>(`student_profile_${decodedName}`);
    if (!existing) {
      setLoading(true);
      setPostsLoading(true);
      setTeamsLoading(true);
    }
    setNotFound(false);

    getStudentBySlug(decodedName)
      .then((data) => {
        if (alive) {
          if (!data || !data.userId) {
            setNotFound(true);
            setStudent(null);
            setTeamsLoading(false);
          } else {
            setNotFound(false);
            setStudent(data);
            clientCache.set(`student_profile_${decodedName}`, data, 300_000);
            getStudentTeams(data.userId)
              .then((teams) => {
                if (alive && teams) {
                  setStudentTeams(teams);
                  clientCache.set(`student_teams_${decodedName}`, teams, 300_000);
                }
              })
              .catch(() => {})
              .finally(() => {
                if (alive) setTeamsLoading(false);
              });
          }
        }
      })
      .catch(() => {
        if (alive && !existing) {
          setNotFound(true);
          setStudent(null);
          setTeamsLoading(false);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    getStudentPosts(decodedName)
      .then((res) => {
        if (alive) {
          const freshPosts = res.posts || [];
          setStudentPosts(freshPosts);
          clientCache.set(`student_posts_${decodedName}`, freshPosts, 300_000);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setPostsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [decodedName]);

  const toggleLike = (id: string | number) => {
    const post = studentPosts.find((p) => p.id === id);
    if (!post) return;
    const currentLiked = !!post.liked;

    triggerToggle(
      id,
      currentLiked,
      (newLiked) => {
        setStudentPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  liked: newLiked,
                  likes: newLiked
                    ? p.liked
                      ? p.likes
                      : p.likes + 1
                    : p.liked
                    ? Math.max(0, p.likes - 1)
                    : p.likes,
                }
              : p
          )
        );
      },
      (signal) => apiLikePost(id, signal)
    );
  };

  const toggleSave = (id: string | number) => {
    const post = studentPosts.find((p) => p.id === id);
    if (!post) return;
    const currentSaved = !!post.saved;

    triggerToggle(
      id,
      currentSaved,
      (newSaved) => {
        setStudentPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, saved: newSaved } : p))
        );
      },
      (signal) => apiSavePost(id, signal)
    );
  };

  const handleToggleStar = (teamId: string | number) => {
    const team = studentTeams.find((t) => t.id === teamId);
    if (!team) return;
    const currentStarred = !!team.starred;

    triggerToggle(
      teamId,
      currentStarred,
      (newStarred) => {
        setStudentTeams((prev) =>
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

  const openJoinModal = (team: any) => {
    if (isUserLeadOf(team)) {
      toast.info("You are the lead/creator of this team.");
      return;
    }
    if (isUserMemberOf(team)) {
      toast.info("You are already a member of this team.");
      return;
    }
    setJoinTargetId(team.id);
    setJoinTarget(team.title);
    setJoinRole("");
    setJoinReason("");
    setJoinOpen(true);
  };

  const handleJoinRequest = async () => {
    const targetTeam = studentTeams.find((t) => t.id === joinTargetId);
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
    }
    if (!joinRole) {
      toast.error("Please select a role");
      return;
    }
    if (!joinReason.trim()) {
      toast.error("Please write why you want to join");
      return;
    }
    if (!joinTargetId) return;

    try {
      await sendJoinRequest(joinTargetId, joinRole, joinReason.trim());
      toast.success(`Request sent to join "${joinTarget}"!`);
      setJoinOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to send join request");
    }
  };

  const displayName = student?.fullName || student?.name || decodedName;
  const initials =
    student?.initials ||
    displayName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "ST";

  // Categorize collaborations
  const openSourceCollabs = studentTeams.filter(
    (t) => t.type === "OPEN_SOURCE" || t.type === "open_source"
  );
  const ongoingCollabs = studentTeams.filter(
    (t) => t.type !== "OPEN_SOURCE" && t.type !== "open_source" && !t.completed
  );
  const completedCollabs = studentTeams.filter((t) => t.completed);

  const studentYear = student?.currentYear || 4;
  const studentYearStr = `${studentYear}${studentYear === 1 ? "st" : studentYear === 2 ? "nd" : studentYear === 3 ? "rd" : "th"} Year`;
  const rawBio = student?.defaultBio || "";
  let cleanBioFromRaw = rawBio.includes("•") ? rawBio.split("•")[0].trim() : rawBio;
  if (cleanBioFromRaw.includes("Bachelor of Technology")) {
    cleanBioFromRaw = cleanBioFromRaw.replace(/Bachelor of Technology/g, "B.Tech");
  }
  if (cleanBioFromRaw.includes("Master of Technology")) {
    cleanBioFromRaw = cleanBioFromRaw.replace(/Master of Technology/g, "M.Tech");
  }

  const shortCourse = normalizeCourseShort(student?.courseName, student?.courseShortName);
  const studentDefaultBio =
    cleanBioFromRaw ||
    (shortCourse
      ? student?.departmentName && !shortCourse.toLowerCase().includes(student.departmentName.toLowerCase())
        ? `${shortCourse} ${student.departmentName}`
        : shortCourse
      : "Student");

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex items-center justify-center">
        <ThemedLoader size="lg" />
      </div>
    );
  }

  if (notFound || !student) {
    const handleDisplay = decodedName.startsWith("@") ? decodedName : `@${decodedName}`;
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 text-center shadow-card border-border/80 space-y-5 bg-card/80 backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center border border-border">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Student Not Found</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No active student profile was found for <span className="font-semibold text-primary">{handleDisplay}</span>. The user handle may have changed or the profile does not exist.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild variant="default" className="w-full sm:w-auto text-xs gap-1.5">
                <Link to="/feed">Back to Campus Feed</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto text-xs gap-1.5">
                <Link to="/explore">Explore Colleges</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 p-4 md:p-6">
      {/* Header Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 md:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 shrink-0 border-2 border-primary/20">
                {student?.avatarUrl ? (
                  <AvatarImage src={student.avatarUrl} alt={displayName} />
                ) : (
                  <AvatarFallback className="bg-gradient-hero text-primary-foreground text-2xl font-bold font-heading">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-heading text-xl md:text-2xl font-bold">{displayName}</h1>
                  {(student?.handle || student?.slug || decodedName) && (
                    <p className="text-xs font-mono font-semibold text-primary mt-0.5">
                      @{((student?.handle || student?.slug || decodedName).replace(/^@/, ""))}
                    </p>
                  )}
                  <p className="text-sm font-medium text-foreground/80 mt-0.5">{studentDefaultBio}</p>
                </div>
              </div>

              {student?.bio && student.bio !== studentDefaultBio && !student.bio.includes("•") && (
                <FormattedContent
                  content={student.bio}
                  maxEnters={2}
                  className="text-sm text-muted-foreground mt-2 leading-relaxed"
                />
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {student?.collegeName || "Dharmsinh Desai University"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {studentYearStr}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="bg-muted/80 p-1.5 rounded-xl grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 shadow-2xs">
          <TabsTrigger value="about" className="py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">About</TabsTrigger>
          <TabsTrigger value="activity" className="py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">Activity</TabsTrigger>
          <TabsTrigger value="collabs" className="py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">Collaboration</TabsTrigger>
          <TabsTrigger value="mycon" className="py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">myCons</TabsTrigger>
        </TabsList>

        {/* 1. About Tab */}
        <TabsContent value="about" className="space-y-5">
          {/* Author's Note Section */}
          <Card className="p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>Author's Note</span>
            </div>
            {student?.bioExtra ? (
              <FormattedContent
                content={student.bioExtra}
                maxEnters={2}
                className="text-sm text-foreground/90 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {displayName} hasn't added an author's note yet.
              </p>
            )}
          </Card>

          {/* Details & Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Details */}
            <Card className="p-4 sm:p-5 shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" /> Contact Details
              </h3>
              {(() => {
                let contacts: { label: string; value: string }[] = [];
                if (student?.contactDetails) {
                  try {
                    const parsed = typeof student.contactDetails === "string" ? JSON.parse(student.contactDetails) : student.contactDetails;
                    if (Array.isArray(parsed)) contacts = parsed;
                    else if (typeof parsed === "object" && parsed !== null) {
                      contacts = Object.entries(parsed).map(([label, value]) => ({ label, value: String(value) }));
                    }
                  } catch {
                    if (typeof student.contactDetails === "string" && student.contactDetails.trim()) {
                      contacts = [{ label: "Contact", value: student.contactDetails.trim() }];
                    }
                  }
                }
                if (contacts.length === 0) {
                  return (
                    <p className="text-xs text-muted-foreground italic">
                      No contact details shared yet.
                    </p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {contacts.map((contact, idx) => {
                      const l = (contact.label || "").toLowerCase();
                      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((contact.value || "").trim());
                      const isPhone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test((contact.value || "").trim().replace(/\s/g, ""));

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              {l.includes("mail") || l.includes("gmail") || l.includes("email") ? (
                                <Mail className="h-3.5 w-3.5" />
                              ) : l.includes("discord") || l.includes("telegram") || l.includes("slack") || l.includes("chat") ? (
                                <MessageSquare className="h-3.5 w-3.5" />
                              ) : l.includes("phone") || l.includes("call") || l.includes("tel") || l.includes("mobile") || l.includes("whatsapp") ? (
                                <Phone className="h-3.5 w-3.5" />
                              ) : l.includes("github") ? (
                                <Github className="h-3.5 w-3.5" />
                              ) : l.includes("web") || l.includes("site") || l.includes("portfolio") ? (
                                <Globe className="h-3.5 w-3.5" />
                              ) : (
                                <User className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <span className="text-xs font-semibold text-foreground capitalize truncate max-w-[90px]">
                              {contact.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0 max-w-[65%] justify-end">
                            {isEmail ? (
                              <a
                                href={`mailto:${contact.value}`}
                                className="text-xs text-primary hover:underline font-medium truncate"
                                title={contact.value}
                              >
                                {contact.value}
                              </a>
                            ) : isPhone ? (
                              <a
                                href={`tel:${contact.value}`}
                                className="text-xs text-primary hover:underline font-medium truncate"
                                title={contact.value}
                              >
                                {contact.value}
                              </a>
                            ) : (
                              <span
                                className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate"
                                title={contact.value}
                              >
                                {contact.value}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(contact.value);
                                toast.success(`Copied ${contact.label} to clipboard!`);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-all shrink-0"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>

            {/* Social & Portfolio Links */}
            <Card className="p-4 sm:p-5 shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-primary" /> Links & Profiles
              </h3>
              <div className="space-y-2">
                {student?.websiteUrl && (
                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">Portfolio</span>
                    </div>
                    <a
                      href={
                        student.websiteUrl.startsWith("http")
                          ? student.websiteUrl
                          : `https://${student.websiteUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-medium flex items-center gap-1 truncate max-w-[65%]"
                    >
                      <span className="truncate">{student.websiteUrl.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                {student?.githubUrl && (
                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Github className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">GitHub</span>
                    </div>
                    <a
                      href={
                        student.githubUrl.startsWith("http")
                          ? student.githubUrl
                          : `https://github.com/${student.githubUrl.replace(/^@/, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-medium flex items-center gap-1 truncate max-w-[65%]"
                    >
                      <span className="truncate">{student.githubUrl.replace(/^https?:\/\/github\.com\//, "")}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Custom Links */}
                {(() => {
                  let customLinks: { label: string; url: string }[] = [];
                  if (student?.customLinks) {
                    try {
                      const parsed = typeof student.customLinks === "string" ? JSON.parse(student.customLinks) : student.customLinks;
                      if (Array.isArray(parsed)) customLinks = parsed;
                    } catch {}
                  }
                  return customLinks.map((link, idx) => {
                    if (!link.label || !link.url) return null;
                    const fullUrl = link.url.startsWith("http") ? link.url : `https://${link.url}`;
                    return (
                      <div key={idx} className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <LinkIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">{link.label}</span>
                        </div>
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs font-medium flex items-center gap-1 truncate max-w-[65%]"
                        >
                          <span className="truncate">{link.url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    );
                  });
                })()}

                {!student?.websiteUrl && !student?.githubUrl && !student?.customLinks && (
                  <p className="text-xs text-muted-foreground italic">No external links shared yet.</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Activity / Posts Tab */}
        <TabsContent value="activity" className="space-y-4">
          {postsLoading ? (
            <div className="py-12 flex justify-center">
              <ThemedLoader size="md" />
            </div>
          ) : studentPosts.length === 0 ? (
            <Card className="p-8 text-center shadow-card">
              <p className="text-muted-foreground text-sm">No posts published yet by {displayName}.</p>
            </Card>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {studentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                    {/* Top Section: Author Profile Header */}
                    <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-border shrink-0">
                          <AvatarImage src={post.avatarUrl || student?.avatarUrl} alt={post.author || displayName} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {post.initials || initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm block leading-tight truncate">
                            {post.author || displayName}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                            {(post.authorHandle || student?.handle || student?.slug) && (
                              <span className="font-mono text-primary/90 font-medium">
                                @{((post.authorHandle || student?.handle || student?.slug || "").replace(/^@/, ""))}
                              </span>
                            )}
                            {(post.authorHandle || student?.handle) && (post.course || student?.courseName || studentDefaultBio) && (
                              <span>•</span>
                            )}
                            {(post.course || student?.courseName || studentDefaultBio) && (
                              <span className="truncate max-w-[200px] sm:max-w-xs">{post.course || studentDefaultBio}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Full Width Body, Media, Actions */}
                    <div className="w-full">
                      {/* Multiline, clickable content */}
                      <FormattedContent content={post.content} className="mt-1" />

                      {/* Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="mt-3">
                          <ImageCarousel images={post.images} />
                        </div>
                      )}

                      {/* Video */}
                      {post.videoUrl && (
                        <div className="mt-3">
                          <VideoPlayer videoUrl={post.videoUrl} videoId={post.videoUrl} />
                        </div>
                      )}

                      {/* Hashtags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground"
                            >
                              #{t.replace(/^#/, "")}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={`gap-1.5 text-xs ${
                              post.liked ? "text-red-500" : "text-muted-foreground"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""}`} />{" "}
                            {post.likes}
                          </Button>
                          {post.commentsEnabled !== false && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedCommentsPostId((prev) =>
                                  prev === post.id ? null : post.id
                                )
                              }
                              className={`gap-1.5 text-xs transition-colors ${
                                expandedCommentsPostId === post.id
                                  ? "text-primary bg-primary/10 font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.commentsCount || 0}</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSave(post.id)}
                            className={`text-xs px-2.5 ${
                              post.saved ? "text-accent" : "text-muted-foreground"
                            }`}
                            title={post.saved ? "Unsave post" : "Save post"}
                          >
                            <Bookmark className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await sharePostLink(post.id);
                              toast.success("Post link copied to clipboard!");
                            }}
                          >
                            <Share2 className="h-4 w-4" /> Share
                          </Button>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 select-none ml-auto">
                          {formatSmartDate(post.createdAt || post.time)}
                        </span>
                      </div>

                      {/* Inline Expandable Comments Stream */}
                      <AnimatePresence>
                        {expandedCommentsPostId === post.id && (
                          <InlineCommentsSection
                            post={post}
                            onCommentCountChange={(newCount) => {
                              setStudentPosts((prev) =>
                                prev.map((p) =>
                                  p.id === post.id
                                    ? { ...p, commentsCount: newCount }
                                    : p
                                )
                              );
                            }}
                            onClose={() => setExpandedCommentsPostId(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 3. Collaboration Tab with 3 Sub-Tabs: Open Source, Ongoing, Completed */}
        <TabsContent value="collabs" className="space-y-4">
          <Tabs defaultValue="open_source" className="space-y-4">
            <TabsList className="bg-muted/80 p-1.5 rounded-xl grid grid-cols-3 w-full max-w-md h-auto gap-1 shadow-2xs">
              <TabsTrigger value="open_source" className="gap-1.5 py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">
                <Code2 className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Open Source</span>
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="gap-1.5 py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">
                <Rocket className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Ongoing</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-1.5 py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg min-w-0 truncate">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">Completed</span>
              </TabsTrigger>
            </TabsList>

            {/* Sub-Tab 1: Open Source */}
            <TabsContent value="open_source" className="space-y-4 focus-visible:outline-none">
              {teamsLoading ? (
                <div className="py-12 flex justify-center">
                  <ThemedLoader size="md" />
                </div>
              ) : openSourceCollabs.length > 0 ? (
                openSourceCollabs.map((project) => (
                  <Card key={project.id} className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/collab/${project.id}`}
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
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-md border border-primary/20 max-w-full"
                          >
                            <Github className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[220px] sm:max-w-[360px]">
                              {project.githubLink.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="h-3 w-3 ml-0.5 opacity-70 shrink-0" />
                          </a>
                        </div>
                      )}

                      {/* Tech stack */}
                      {project.requiredExpertise && project.requiredExpertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.requiredExpertise.map((skill: string, idx: number) => (
                            <Badge
                              key={`${project.id}-exp-${skill}-${idx}`}
                              variant="outline"
                              className="text-[11px] px-2.5 py-0.5 font-medium bg-muted/40"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Responsive Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs h-8 px-2.5"
                          >
                            <Link to={`/collab/${project.id}`}>
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </Link>
                          </Button>

                          {project.githubLink && (
                            <Button
                              asChild
                              size="sm"
                              variant="default"
                              className="gap-1 text-xs h-8 px-2.5"
                            >
                              <a
                                href={
                                  project.githubLink.startsWith("http")
                                    ? project.githubLink
                                    : `https://${project.githubLink}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Github className="h-3.5 w-3.5" /> View Repo
                              </a>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStar(project.id)}
                            className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${
                              project.starred
                                ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Star className={`h-3.5 w-3.5 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                            <span className="font-semibold text-xs">{project.starsCount || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center shadow-card">
                  <p className="text-muted-foreground text-sm">No open-source projects created by {displayName} yet.</p>
                </Card>
              )}
            </TabsContent>

            {/* Sub-Tab 2: Ongoing Teams / Projects */}
            <TabsContent value="ongoing" className="space-y-4 focus-visible:outline-none">
              {teamsLoading ? (
                <div className="py-12 flex justify-center">
                  <ThemedLoader size="md" />
                </div>
              ) : ongoingCollabs.length > 0 ? (
                ongoingCollabs.map((team) => {
                  const isStudentLead = Boolean(
                    (student?.id && team.ownerId && team.ownerId === student.id) ||
                    (team.ownerName && (team.ownerName === student?.fullName || team.ownerName === student?.name || team.ownerName === decodedName))
                  );
                  const studentMemberObj = (team.members || []).find(
                    (m: any) =>
                      (student?.id && m.userId && m.userId === student.id) ||
                      (m.name && (m.name === student?.fullName || m.name === student?.name || m.name === decodedName))
                  );
                  const studentRole = isStudentLead ? "Team Lead & Creator" : (studentMemberObj?.role || "Team Member");

                  return (
                    <Card key={team.id} className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            to={`/collab/${team.id}`}
                            className="font-semibold text-base hover:text-primary hover:underline transition-colors break-words"
                          >
                            {team.title}
                          </Link>

                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize shrink-0 ${
                              team.type === "HACKATHON" || team.type === "hackathon"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {team.type === "HACKATHON" || team.type === "hackathon"
                              ? "Hackathon Team"
                              : "Team Project"}
                          </Badge>

                          {isStudentLead ? (
                            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold shrink-0">
                              <Crown className="h-3 w-3" /> Team Lead
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold shrink-0">
                              <CheckCircle2 className="h-3 w-3" /> Member ({studentRole})
                            </Badge>
                          )}

                          <Badge variant="secondary" className="text-xs shrink-0">
                            {team.currentMembersCount || (team.members || []).length || 1}/{team.maxMembers || 4} members
                          </Badge>

                          <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                            Hiring Open
                          </Badge>
                        </div>

                        {!isStudentLead && team.ownerName && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                            <span>Team Lead:</span>
                            <Link
                              to={`/student/${encodeURIComponent(team.ownerName)}`}
                              className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                            >
                              {team.ownerName}
                            </Link>
                          </div>
                        )}

                        {team.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                            {team.description}
                          </p>
                        )}

                        {team.requiredExpertise && team.requiredExpertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {team.requiredExpertise.map((skill: string, idx: number) => (
                              <Badge key={`${team.id}-exp-${skill}-${idx}`} variant="outline" className="text-[11px] px-2.5 py-0.5 font-medium bg-muted/40">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Responsive Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs h-8 px-2.5"
                            >
                              <Link to={`/collab/${team.id}`}>
                                <Eye className="h-3.5 w-3.5" /> View Details
                              </Link>
                            </Button>

                            {isUserLeadOf(team) ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-xs h-8 px-2.5 bg-primary/10 text-primary border border-primary/20 font-medium select-none"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Your Team
                              </Badge>
                            ) : isUserMemberOf(team) ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-xs h-8 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium select-none"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Joined Member
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="gap-1 text-xs h-8 px-2.5 bg-gradient-hero text-primary-foreground font-semibold"
                                onClick={() => openJoinModal(team)}
                              >
                                <UserPlus className="h-3.5 w-3.5" /> Request to Join
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStar(team.id)}
                              className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${
                                team.starred ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "text-muted-foreground"
                              }`}
                            >
                              <Star className={`h-3.5 w-3.5 ${team.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                              <span className="font-semibold text-xs">{team.starsCount || 0}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-8 text-center shadow-card">
                  <p className="text-muted-foreground text-sm">No ongoing collaboration projects.</p>
                </Card>
              )}
            </TabsContent>

            {/* Sub-Tab 3: Completed */}
            <TabsContent value="completed" className="space-y-4 focus-visible:outline-none">
              {teamsLoading ? (
                <div className="py-12 flex justify-center">
                  <ThemedLoader size="md" />
                </div>
              ) : completedCollabs.length > 0 ? (
                completedCollabs.map((team) => {
                  const isStudentLead = Boolean(
                    (student?.id && team.ownerId && team.ownerId === student.id) ||
                    (team.ownerName && (team.ownerName === student?.fullName || team.ownerName === student?.name || team.ownerName === decodedName))
                  );
                  const studentMemberObj = (team.members || []).find(
                    (m: any) =>
                      (student?.id && m.userId && m.userId === student.id) ||
                      (m.name && (m.name === student?.fullName || m.name === student?.name || m.name === decodedName))
                  );
                  const studentRole = isStudentLead ? "Team Lead & Creator" : (studentMemberObj?.role || "Team Member");

                  return (
                    <Card key={team.id} className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            to={`/collab/${team.id}`}
                            className="font-semibold text-base hover:text-primary hover:underline transition-colors break-words"
                          >
                            {team.title}
                          </Link>

                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize shrink-0 ${
                              team.type === "HACKATHON" || team.type === "hackathon"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {team.type === "HACKATHON" || team.type === "hackathon"
                              ? "Hackathon Team"
                              : "Team Project"}
                          </Badge>

                          {isStudentLead ? (
                            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold shrink-0">
                              <Crown className="h-3 w-3" /> Creator
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold shrink-0">
                              <CheckCircle2 className="h-3 w-3" /> Hired as {studentRole}
                            </Badge>
                          )}

                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 font-medium shrink-0">
                            ✓ Completed
                          </Badge>
                        </div>

                        {!isStudentLead && team.ownerName && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                            <span>Project Lead:</span>
                            <Link
                              to={`/student/${encodeURIComponent(team.ownerName)}`}
                              className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                            >
                              {team.ownerName}
                            </Link>
                          </div>
                        )}

                        {team.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                            {team.description}
                          </p>
                        )}

                        {team.requiredExpertise && team.requiredExpertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {team.requiredExpertise.map((skill: string, idx: number) => (
                              <Badge key={`${team.id}-req-${skill}-${idx}`} variant="outline" className="text-[11px] px-2.5 py-0.5 font-medium bg-muted/40">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Responsive Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs h-8 px-2.5"
                            >
                              <Link to={`/collab/${team.id}`}>
                                <Eye className="h-3.5 w-3.5" /> View Details
                              </Link>
                            </Button>

                            {team.githubLink && (
                              <Button
                                asChild
                                size="sm"
                                variant="default"
                                className="gap-1 text-xs h-8 px-2.5"
                              >
                                <a
                                  href={
                                    team.githubLink.startsWith("http")
                                      ? team.githubLink
                                      : `https://${team.githubLink}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Github className="h-3.5 w-3.5" /> View Repo
                                </a>
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStar(team.id)}
                              className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${
                                team.starred ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "text-muted-foreground"
                              }`}
                            >
                              <Star className={`h-3.5 w-3.5 ${team.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                              <span className="font-semibold text-xs">{team.starsCount || 0}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-8 text-center shadow-card">
                  <p className="text-muted-foreground text-sm">No completed collaboration projects yet.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 4. myCons Tab */}
        <TabsContent value="mycon">
          <div className="space-y-4">
            <Card className="p-5 shadow-card border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">Verified Student</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verified student of {student?.collegeName || "campus"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md shrink-0">
                  ✓ Verified
                </span>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-card">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-heading font-semibold text-base">Skill Badges</h4>
                <p className="text-muted-foreground text-xs max-w-sm">
                  We will introduce automated skill verification badges soon.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Join Request Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Join {joinTarget}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your collaboration application to join this team.
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
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Why do you want to join?</Label>
                <span className="text-[10px] text-muted-foreground">
                  {joinReason.length}/1000
                </span>
              </div>
              <Textarea
                placeholder="Describe your experience, what you can contribute, and links to your work..."
                value={joinReason}
                maxLength={1000}
                onChange={(e) => setJoinReason(e.target.value)}
                className="min-h-[100px] text-xs leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                Supports clickable links and up to 2 line breaks.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setJoinOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-hero text-primary-foreground font-semibold text-xs"
              size="sm"
              onClick={handleJoinRequest}
            >
              Send Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfilePage;
