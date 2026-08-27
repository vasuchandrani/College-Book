import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  Star,
  Camera,
  Trash2,
  Pencil,
  Github,
  Globe,
  Mail,
  Link as LinkIcon,
  FileText,
  Loader2,
  Plus,
  Settings,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Shield,
  Award,
  Bookmark,
  Heart,
  Share2,
  UsersRound,
  ExternalLink,
  Eye,
  Code2,
  Rocket,
  X as XIcon,
  Check,
  Inbox,
  AlertCircle,
  Clock,
  XCircle,
  Copy,
  Phone,
  MessageSquare,
  User,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import FormattedContent from "@/components/FormattedContent";
import ThemedLoader from "@/components/ThemedLoader";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import InlineCommentsSection from "@/components/InlineCommentsSection";
import { formatSmartDate } from "@/lib/dateUtils";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import {
  getProfile,
  updateProfile,
  getMyPosts,
  getSavedPosts,
  deletePost as apiDeletePost,
  likePost as apiLikePost,
  savePost as apiSavePost,
  sharePostLink,
  getMyTeams,
  getMyOpenSourceProjects,
  updateTeam,
  starProject,
  getStarredProjects,
  unstarProject,
  getMyJoinRequests,
  getMyIncomingRequests,
  getTeamJoinRequests,
  respondJoinRequest,
  markProjectComplete,
  updateJoinRequest,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  deleteJoinRequest,
  requestPresignedUpload,
  uploadFileToStorage,
  uploadImageFile,
  getCampusStudents,
  sendPasswordChangeOtp,
  changePasswordWithOtp,
  sendMemoryBookOtp,
  verifyMemoryBookEmail,
  removeMemoryBookEmail,
  getCoursesByCollege,
  getDepartmentsByCourse,
  normalizeCourseShort,
  type PublicStudentProfile,
  type Course,
  type Department,
} from "@/lib/api";
import { isValidHttpUrl, normalizeUrl } from "@/lib/urlUtils";
import { clientCache } from "@/lib/clientCache";

export interface CustomLink {
  id?: string;
  label: string;
  url: string;
}

export interface ContactDetail {
  id?: string;
  label: string;
  value: string;
}

const commonTechSuggestions = [
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "Docker",
  "Tailwind CSS",
  "PostgreSQL",
  "Next.js",
  "Go",
  "Rust",
  "Kubernetes",
  "Figma",
];

const roleOptions = [
  "Frontend Dev",
  "Backend Dev",
  "Full Stack Dev",
  "ML Engineer",
  "Data Engineer",
  "DevOps",
  "UI/UX Designer",
  "Mobile Dev",
  "Security Analyst",
  "Cloud Architect",
  "QA Engineer",
  "Technical Writer",
  "Other",
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editAboutOpen, setEditAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Settings State: Password Change
  const [passwordStep, setPasswordStep] = useState<"request" | "verify">("request");
  const [sendingPasswordOtp, setSendingPasswordOtp] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordOtpCooldown, setPasswordOtpCooldown] = useState(0);

  // Settings State: Memory Book Email
  const [memoryEmailInput, setMemoryEmailInput] = useState("");
  const [memoryStep, setMemoryStep] = useState<"idle" | "otp">("idle");
  const [memoryOtpInput, setMemoryOtpInput] = useState("");
  const [sendingMemoryOtp, setSendingMemoryOtp] = useState(false);
  const [verifyingMemoryEmail, setVerifyingMemoryEmail] = useState(false);
  const [memoryOtpCooldown, setMemoryOtpCooldown] = useState(0);

  useEffect(() => {
    if (passwordOtpCooldown <= 0 && memoryOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setPasswordOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setMemoryOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [passwordOtpCooldown, memoryOtpCooldown]);
  const [removingMemoryEmail, setRemovingMemoryEmail] = useState(false);
  const { triggerToggle } = useDebouncedToggle(400);

  const [activityPosts, setActivityPosts] = useState<any[]>(() => clientCache.get<any[]>("my_posts") || []);
  const [createdProjects, setCreatedProjects] = useState<any[]>(() => clientCache.get<any[]>("my_profile_teams") || []);
  const [myRequests, setMyRequests] = useState<any[]>(() => clientCache.get<any[]>("my_profile_requests") || []);
  const [incomingRequests, setIncomingRequests] = useState<any[]>(() => clientCache.get<any[]>("my_profile_incoming") || []);
  const [starredProjects, setStarredProjects] = useState<any[]>(() => clientCache.get<any[]>("my_starred_projects") || []);
  const [savedPostsList, setSavedPostsList] = useState<any[]>(() => clientCache.get<any[]>("my_saved_posts") || []);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | number | null>(null);
  const [campusStudents, setCampusStudents] = useState<PublicStudentProfile[]>(() => clientCache.get<PublicStudentProfile[]>("campus_students") || []);
  const [confirmAction, setConfirmAction] = useState<{
    projectId: string | number;
    requestId: string | number;
    action: "accepted" | "rejected";
  } | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | number | null>(null);
  const [completingProject, setCompletingProject] = useState(false);
  const [viewRequestsProject, setViewRequestsProject] = useState<any | null>(null);
  const [respondingReqId, setRespondingReqId] = useState<string | number | null>(null);

  // Edit team dialog
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [savingTeam, setSavingTeam] = useState(false);
  const [editCategory, setEditCategory] = useState<"open_source" | "hackathon" | "project">("open_source");
  const [editTeamForm, setEditTeamForm] = useState({
    title: "",
    hackathon: "",
    description: "",
    githubLink: "",
    maxMembers: "4",
  });
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");

  // Edit request dialog
  const [editReqOpen, setEditReqOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<any | null>(null);
  const [editReqForm, setEditReqForm] = useState({ role: "", reason: "" });
  const [savingReqEdit, setSavingReqEdit] = useState(false);

  // Delete team/project confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);

  // Delete/withdraw join request confirmation
  const [deleteReqConfirm, setDeleteReqConfirm] = useState<string | number | null>(null);
  const [deletingReq, setDeletingReq] = useState(false);

  // Member management in edit dialog
  const [editMembers, setEditMembers] = useState<any[]>([]);
  const [newMemberHandle, setNewMemberHandle] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("cb_user") || "{}");
  const userYearStr = user.currentYear
    ? `${user.currentYear}${user.currentYear === 1 ? "st" : user.currentYear === 2 ? "nd" : user.currentYear === 3 ? "rd" : "th"} Year`
    : user.year || "";
  const initialCourseShort = normalizeCourseShort(user.course);
  let defaultBio =
    user.defaultBio ||
    (initialCourseShort
      ? user.department
        ? `${initialCourseShort} ${user.department}`
        : initialCourseShort
      : "Student");
  if (defaultBio.includes("Bachelor of Technology")) {
    defaultBio = defaultBio.replace(/Bachelor of Technology/g, "B.Tech");
  }
  if (defaultBio.includes("Master of Technology")) {
    defaultBio = defaultBio.replace(/Master of Technology/g, "M.Tech");
  }
  if (defaultBio.includes("•")) {
    defaultBio = defaultBio.split("•")[0].trim();
  }

  const [profile, setProfile] = useState({
    name: user.name || "Student",
    handle: user.handle || "",
    bio: defaultBio,
    customBio: user.bioExtra || "",
    college: user.college || "Dharmsinh Desai University",
    collegeId: user.collegeId || "",
    courseId: user.courseId || "",
    courseName: user.course || "",
    departmentId: user.departmentId || "",
    departmentName: user.department || "",
    email: user.email || "",
    year: userYearStr || "4th Year",
    yearNum: user.currentYear || 4,
    avatarUrl: "",
    githubUrl: "",
    websiteUrl: "",
    authorNote: "",
    contactDetails: [] as ContactDetail[],
    memoryBookEmail: "",
    customLinks: [] as CustomLink[],
  });

  const [collegeCourses, setCollegeCourses] = useState<Course[]>([]);
  const [courseDepartments, setCourseDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [editForm, setEditForm] = useState({
    name: profile.name,
    customBio: profile.customBio,
    college: profile.college,
    collegeId: profile.collegeId,
    courseId: profile.courseId,
    courseName: profile.courseName,
    departmentId: profile.departmentId,
    departmentName: profile.departmentName,
    year: String(profile.yearNum || 1),
    avatarUrl: profile.avatarUrl,
  });

  const [editAboutForm, setEditAboutForm] = useState({
    authorNote: "",
    websiteUrl: "",
    githubUrl: "",
    contactDetails: [] as ContactDetail[],
    customLinks: [] as CustomLink[],
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);

  useEffect(() => {
    let alive = true;
    const existing = clientCache.get<any>("my_posts");
    if (!existing) {
      setLoading(true);
    }

    getProfile()
      .then((p) => {
          if (alive && p) {
            const localUser = JSON.parse(localStorage.getItem("cb_user") || "{}");
            const loadedCollege =
              p.collegeName || p.college || localUser.college || "Dharmsinh Desai University";
            const loadedCollegeShort =
              p.collegeShort ||
              p.collegeShortName ||
              localUser.collegeShort ||
              (loadedCollege === "Dharmsinh Desai University"
                ? "DDU"
                : loadedCollege.split(" ").map((w: string) => w[0]).join(""));

            let savedLinks: CustomLink[] = [];
            if (p.customLinks) {
              try {
                const parsed = typeof p.customLinks === "string" ? JSON.parse(p.customLinks) : p.customLinks;
                if (Array.isArray(parsed)) savedLinks = parsed;
              } catch (e) { }
            }
            if (savedLinks.length === 0) {
              try {
                const raw = localStorage.getItem("cb_custom_links_" + (p.userId || p.name || localUser.name));
                if (raw) savedLinks = JSON.parse(raw);
              } catch (e) { }
            }

            let savedContacts: ContactDetail[] = [];
            if (p.contactDetails) {
              try {
                const parsed = typeof p.contactDetails === "string" ? JSON.parse(p.contactDetails) : p.contactDetails;
                if (Array.isArray(parsed)) {
                  savedContacts = parsed;
                } else if (typeof parsed === "object" && parsed !== null) {
                  savedContacts = Object.entries(parsed).map(([label, value]) => ({ label, value: String(value) }));
                }
              } catch (e) {
                if (typeof p.contactDetails === "string" && p.contactDetails.trim()) {
                  savedContacts = [{ id: "c1", label: "Contact", value: p.contactDetails.trim() }];
                }
              }
            }
            if (savedContacts.length === 0) {
              try {
                const raw = localStorage.getItem("cb_contact_info_" + (p.userId || p.name || localUser.name));
                if (raw) {
                  try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) savedContacts = parsed;
                  } catch {
                    if (raw.trim()) savedContacts = [{ id: "c1", label: "Contact", value: raw.trim() }];
                  }
                }
              } catch (e) { }
            }

            const yearNum = p.currentYear || localUser.currentYear || 4;
            const yearSuffix = yearNum === 1 ? "st" : yearNum === 2 ? "nd" : yearNum === 3 ? "rd" : "th";
            const loadedYear = `${yearNum}${yearSuffix} Year`;

            const rawCourse = p.courseShortName || p.courseName || localUser.course || "";
            const cName = normalizeCourseShort(rawCourse);
            const dName = p.departmentName || localUser.department || "";
            let cleanBio = cName;
            if (dName && !cleanBio.toLowerCase().includes(dName.toLowerCase())) {
              cleanBio = `${cleanBio} ${dName}`.trim();
            }
            if (!cleanBio) {
              cleanBio = p.defaultBio ? p.defaultBio.split("•")[0].trim() : "Student";
            }
            if (cleanBio.includes("Bachelor of Technology")) {
              cleanBio = cleanBio.replace(/Bachelor of Technology/g, "B.Tech");
            }
            if (cleanBio.includes("Master of Technology")) {
              cleanBio = cleanBio.replace(/Master of Technology/g, "M.Tech");
            }

            const loaded = {
              name: p.fullName || p.name || localUser.name || "Student",
              handle: p.handle || localUser.handle || "",
              bio: cleanBio,
              customBio: p.bioExtra || "",
              college: loadedCollege,
              collegeId: p.collegeId || localUser.collegeId || "",
              courseId: p.courseId || localUser.courseId || "",
              courseName: cName,
              departmentId: p.departmentId || localUser.departmentId || "",
              departmentName: dName,
              email: localUser.email || "",
              year: loadedYear,
              yearNum: yearNum,
              avatarUrl: p.avatarUrl || "",
              githubUrl: p.githubUrl || "",
              linkedinUrl: p.linkedinUrl || "",
              websiteUrl: p.websiteUrl || "",
              authorNote: p.bioExtra || "",
              contactDetails: savedContacts,
              memoryBookEmail: p.memoryBookEmail || "",
              customLinks: savedLinks,
            };
            setProfile(loaded);
            setMemoryEmailInput(loaded.memoryBookEmail || "");
            setEditForm({
              name: loaded.name,
              customBio: loaded.customBio,
              college: loaded.college,
              collegeId: loaded.collegeId,
              courseId: loaded.courseId,
              courseName: loaded.courseName,
              departmentId: loaded.departmentId,
              departmentName: loaded.departmentName,
              year: String(loaded.yearNum),
              avatarUrl: loaded.avatarUrl,
            });

            if (loaded.collegeId) {
              getCoursesByCollege(loaded.collegeId).then((cList) => {
                if (alive && cList) setCollegeCourses(cList);
              }).catch(() => {});
            }
            if (loaded.courseId) {
              getDepartmentsByCourse(loaded.courseId).then((dList) => {
                if (alive && dList) setCourseDepartments(dList);
              }).catch(() => {});
            }

            setEditAboutForm({
              authorNote: loaded.authorNote,
              websiteUrl: loaded.websiteUrl,
              githubUrl: loaded.githubUrl,
              contactDetails: loaded.contactDetails,
              customLinks: loaded.customLinks,
            });

            const updatedUser = {
              ...localUser,
              name: loaded.name,
              handle: loaded.handle,
              college: loadedCollege,
              collegeId: loaded.collegeId,
              collegeShort: loadedCollegeShort,
              course: cName || localUser.course || "Student",
              courseId: loaded.courseId,
              department: dName || localUser.department,
              departmentId: loaded.departmentId,
              currentYear: yearNum,
              defaultBio: cleanBio,
              bioExtra: loaded.customBio,
            };
            localStorage.setItem("cb_user", JSON.stringify(updatedUser));
          }
        })
        .catch(() => { })
        .finally(() => {
          if (alive) setLoading(false);
        });

      // Background non-blocking fetches with client-side caching
      getMyPosts()
        .then((posts) => {
          if (alive && posts) {
            setActivityPosts(posts);
            clientCache.set("my_posts", posts, 300_000);
          }
        })
        .catch(() => { });

      getSavedPosts()
        .then((posts) => {
          if (alive && posts) {
            setSavedPostsList(posts);
            clientCache.set("my_saved_posts", posts, 300_000);
          }
        })
        .catch(() => { });

      getStarredProjects()
        .then((starred) => {
          if (alive && starred) {
            setStarredProjects(starred);
            clientCache.set("my_starred_projects", starred, 300_000);
          }
        })
        .catch(() => { });

      getMyTeams()
        .then((teams) => {
          if (alive && teams) {
            setCreatedProjects(teams);
            clientCache.set("my_profile_teams", teams, 300_000);
          }
        })
        .catch(() => { });

      getMyJoinRequests()
        .then((reqs) => {
          if (alive && reqs) {
            setMyRequests(reqs);
            clientCache.set("my_profile_requests", reqs, 300_000);
          }
        })
        .catch(() => { });

      getMyIncomingRequests()
        .then((inReqs) => {
          if (alive && inReqs) {
            setIncomingRequests(inReqs);
            clientCache.set("my_profile_incoming", inReqs, 300_000);
          }
        })
        .catch(() => { });

      getCampusStudents()
        .then((students) => {
          if (alive && students) {
            setCampusStudents(students);
            clientCache.set("campus_students", students, 300_000);
          }
        })
        .catch(() => { });

      return () => {
        alive = false;
      };
    }, []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleEditCourseChange = async (courseId: string) => {
    const found = collegeCourses.find((c) => c.id === courseId || c.name === courseId);
    const maxYears = found?.durationYears || 4;
    let nextYear = editForm.year;
    if (parseInt(nextYear) > maxYears) {
      nextYear = "1";
    }
    setLoadingDepartments(true);
    let depts: Department[] = [];
    if (found?.id) {
      try {
        depts = await getDepartmentsByCourse(found.id);
        setCourseDepartments(depts);
      } catch {
        depts = [];
      }
    }
    setLoadingDepartments(false);
    setEditForm((prev) => ({
      ...prev,
      courseId: found ? found.id : courseId,
      courseName: found ? found.name : courseId,
      departmentId: depts[0]?.id || "",
      departmentName: depts[0]?.name || "",
      year: nextYear,
    }));
  };

  const handleEditDepartmentChange = (deptId: string) => {
    const found = courseDepartments.find((d) => d.id === deptId || d.name === deptId);
    setEditForm((prev) => ({
      ...prev,
      departmentId: found ? found.id : deptId,
      departmentName: found ? found.name : deptId,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      let finalAvatarUrl = editForm.avatarUrl || "";

      if (avatarFile) {
        const uploadRes = await uploadImageFile(avatarFile, "AVATAR");
        finalAvatarUrl = uploadRes.publicUrl || uploadRes.url || uploadRes.objectKey;
      }

      await updateProfile({
        fullName: editForm.name,
        courseId: editForm.courseId || undefined,
        departmentId: editForm.departmentId || undefined,
        currentYear: parseInt(editForm.year) || undefined,
        bioExtra: editForm.customBio.slice(0, 250),
        avatarUrl: finalAvatarUrl,
      });

      const selCourse = collegeCourses.find((c) => c.id === editForm.courseId);
      const selDept = courseDepartments.find((d) => d.id === editForm.departmentId);
      const cName = selCourse?.shortName || selCourse?.name || editForm.courseName || profile.courseName;
      const dName = selDept?.name || editForm.departmentName || profile.departmentName;
      const yNum = parseInt(editForm.year) || profile.yearNum || 1;
      const ySuf = yNum === 1 ? "st" : yNum === 2 ? "nd" : yNum === 3 ? "rd" : "th";
      const yStr = `${yNum}${ySuf} Year`;

      let bioUpdated = cName;
      if (dName && !bioUpdated.toLowerCase().includes(dName.toLowerCase())) {
        bioUpdated = `${bioUpdated} ${dName}`.trim();
      }

      const updated = {
        ...profile,
        name: editForm.name,
        bio: bioUpdated || profile.bio,
        customBio: editForm.customBio.slice(0, 250),
        courseId: editForm.courseId,
        courseName: cName,
        departmentId: editForm.departmentId,
        departmentName: dName,
        year: yStr,
        yearNum: yNum,
        avatarUrl: finalAvatarUrl || "",
      };
      setProfile(updated);

      const updatedUser = {
        ...user,
        name: editForm.name,
        collegeId: profile.collegeId,
        course: cName,
        courseId: editForm.courseId,
        department: dName,
        departmentId: editForm.departmentId,
        currentYear: yNum,
        defaultBio: bioUpdated,
        bioExtra: editForm.customBio.slice(0, 250),
        avatarUrl: finalAvatarUrl || "",
      };
      localStorage.setItem("cb_user", JSON.stringify(updatedUser));
      localStorage.setItem("cb_profile", JSON.stringify(updated));

      setAvatarFile(null);
      setEditOpen(false);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAbout = async () => {
    try {
      setSavingAbout(true);
      const cleanedAuthorNote = editAboutForm.authorNote.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

      // Validate Website URL if provided
      if (editAboutForm.websiteUrl.trim() && !isValidHttpUrl(editAboutForm.websiteUrl.trim())) {
        toast.error("Please enter a valid Website / Portfolio link (e.g. https://portfolio.com or mywebsite.dev)");
        setSavingAbout(false);
        return;
      }

      // Validate GitHub URL if provided
      if (editAboutForm.githubUrl.trim() && !isValidHttpUrl(editAboutForm.githubUrl.trim())) {
        toast.error("Please enter a valid GitHub profile link (e.g. https://github.com/username)");
        setSavingAbout(false);
        return;
      }

      // Validate Custom Links
      for (let i = 0; i < editAboutForm.customLinks.length; i++) {
        const link = editAboutForm.customLinks[i];
        if (link.label.trim() || link.url.trim()) {
          if (!link.label.trim()) {
            toast.error(`Please provide a label for link #${i + 1}`);
            setSavingAbout(false);
            return;
          }
          if (!link.url.trim() || !isValidHttpUrl(link.url.trim())) {
            toast.error(`Please provide a valid web link for "${link.label || `link #${i + 1}`}" (e.g. https://leetcode.com/user)`);
            setSavingAbout(false);
            return;
          }
        }
      }

      // Validate Contact Details
      for (let i = 0; i < editAboutForm.contactDetails.length; i++) {
        const contact = editAboutForm.contactDetails[i];
        if (contact.label.trim() || contact.value.trim()) {
          if (!contact.label.trim()) {
            toast.error(`Please provide a label for contact detail #${i + 1} (e.g. Discord, Telegram)`);
            setSavingAbout(false);
            return;
          }
          if (!contact.value.trim()) {
            toast.error(`Please provide a value for "${contact.label}"`);
            setSavingAbout(false);
            return;
          }
        }
      }

      const validLinks = editAboutForm.customLinks
        .filter((l) => l.label.trim() && l.url.trim())
        .map((l) => ({ id: l.id || Date.now().toString(), label: l.label.trim(), url: normalizeUrl(l.url) }));

      const validContacts = editAboutForm.contactDetails
        .filter((c) => c.label.trim() && c.value.trim())
        .map((c) => ({ id: c.id || Date.now().toString(), label: c.label.trim(), value: c.value.trim() }));

      const normalizedWebsite = editAboutForm.websiteUrl.trim() ? normalizeUrl(editAboutForm.websiteUrl) : "";
      const normalizedGithub = editAboutForm.githubUrl.trim() ? normalizeUrl(editAboutForm.githubUrl) : "";

      await updateProfile({
        bioExtra: cleanedAuthorNote,
        websiteUrl: normalizedWebsite,
        githubUrl: normalizedGithub,
        customLinks: JSON.stringify(validLinks),
        contactDetails: JSON.stringify(validContacts),
      });

      const linkKey = "cb_custom_links_" + (profile.name || user.name);
      localStorage.setItem(linkKey, JSON.stringify(validLinks));

      const contactKey = "cb_contact_info_" + (profile.name || user.name);
      localStorage.setItem(contactKey, JSON.stringify(validContacts));

      setProfile((prev) => ({
        ...prev,
        authorNote: cleanedAuthorNote,
        websiteUrl: normalizedWebsite,
        githubUrl: normalizedGithub,
        contactDetails: validContacts,
        customLinks: validLinks,
      }));

      setEditAboutOpen(false);
      toast.success("About, contact & links updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update About details");
    } finally {
      setSavingAbout(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    try {
      setSendingPasswordOtp(true);
      await sendPasswordChangeOtp();
      setPasswordOtpCooldown(300);
      toast.success("Verification code sent to your campus email!");
      setPasswordStep("verify");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send password verification code.");
    } finally {
      setSendingPasswordOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordOtp || passwordOtp.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await changePasswordWithOtp(passwordOtp.trim(), newPassword);
      toast.success("Password changed successfully!");
      setPasswordOtpCooldown(0);
      setPasswordStep("request");
      setPasswordOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password. Please verify the code.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendMemoryBookOtp = async () => {
    if (!memoryEmailInput || !memoryEmailInput.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      setSendingMemoryOtp(true);
      await sendMemoryBookOtp(memoryEmailInput.trim());
      setMemoryOtpCooldown(300);
      toast.success(`Verification code sent to ${memoryEmailInput.trim()}!`);
      setMemoryStep("otp");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send memory book email verification code.");
    } finally {
      setSendingMemoryOtp(false);
    }
  };

  const handleVerifyMemoryBookEmail = async () => {
    if (!memoryOtpInput || memoryOtpInput.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    try {
      setVerifyingMemoryEmail(true);
      const updated = await verifyMemoryBookEmail(memoryEmailInput.trim(), memoryOtpInput.trim());
      setProfile((prev) => ({ ...prev, memoryBookEmail: updated.memoryBookEmail || memoryEmailInput.trim() }));
      setMemoryOtpCooldown(0);
      toast.success("Memory Book delivery email verified and saved!");
      setMemoryStep("idle");
      setMemoryOtpInput("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify email. Please check the code.");
    } finally {
      setVerifyingMemoryEmail(false);
    }
  };

  const handleRemoveMemoryBookEmail = async () => {
    try {
      setRemovingMemoryEmail(true);
      await removeMemoryBookEmail();
      setProfile((prev) => ({ ...prev, memoryBookEmail: "" }));
      setMemoryEmailInput("");
      setMemoryStep("idle");
      toast.success("Memory Book delivery email removed.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove email.");
    } finally {
      setRemovingMemoryEmail(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_refresh_token");
    localStorage.removeItem("cb_user");
    localStorage.removeItem("cb_profile");
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, avatarUrl: url });
    }
  };

  const deletePost = async (id: string | number) => {
    try {
      setIsDeletingPost(true);
      await apiDeletePost(id);
      setActivityPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete post");
    } finally {
      setIsDeletingPost(false);
      setPostToDelete(null);
    }
  };

  const togglePostLike = (id: string | number) => {
    const postInActivity = activityPosts.find((p) => p.id === id);
    const postInSaved = savedPostsList.find((p) => p.id === id);
    const targetPost = postInActivity || postInSaved;
    if (!targetPost) return;
    const currentLiked = !!targetPost.liked;

    triggerToggle(
      id,
      currentLiked,
      (newLiked) => {
        const updatePostItem = (p: any) =>
          p.id === id
            ? {
                ...p,
                liked: newLiked,
                likes: newLiked
                  ? p.liked
                    ? p.likes
                    : (p.likes || 0) + 1
                  : p.liked
                  ? Math.max(0, (p.likes || 0) - 1)
                  : p.likes || 0,
              }
            : p;

        setActivityPosts((prev) => prev.map(updatePostItem));
        setSavedPostsList((prev) => prev.map(updatePostItem));
      },
      (signal) => apiLikePost(id, signal)
    );
  };

  const togglePostSave = (id: string | number) => {
    const postInActivity = activityPosts.find((p) => p.id === id);
    const postInSaved = savedPostsList.find((p) => p.id === id);
    const targetPost = postInActivity || postInSaved;
    if (!targetPost) return;
    const currentSaved = !!targetPost.saved;

    triggerToggle(
      id,
      currentSaved,
      (newSaved) => {
        setActivityPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, saved: newSaved } : p))
        );
        setSavedPostsList((prev) => {
          if (!newSaved) {
            return prev.filter((p) => p.id !== id);
          }
          return prev.map((p) => (p.id === id ? { ...p, saved: newSaved } : p));
        });
        if (newSaved) {
          toast.success("Post saved!");
        } else {
          toast.success("Removed from saved posts");
        }
      },
      (signal) => apiSavePost(id, signal)
    );
  };

  const handleSharePost = async (id: string | number) => {
    await sharePostLink(id);
    toast.success("Post link copied to clipboard!");
  };

  const handleToggleStarProject = (projectId: string | number) => {
    const target = starredProjects.find((p) => p.id === projectId);
    const currentStarred = true;

    triggerToggle(
      projectId,
      currentStarred,
      (newStarred) => {
        if (!newStarred) {
          setStarredProjects((prev) => prev.filter((p) => p.id !== projectId));
          toast.success("Removed from Starred");
        }
      },
      (signal) => starProject(projectId, signal)
    );
  };

  const handleRespondRequest = async (
    requestId: string | number,
    statusOrAccept: boolean | "ACCEPTED" | "REJECTED" | "PENDING",
    projectId: string | number
  ) => {
    try {
      setRespondingReqId(requestId);
      const newStatus =
        typeof statusOrAccept === "boolean"
          ? statusOrAccept
            ? "ACCEPTED"
            : "REJECTED"
          : statusOrAccept;

      await respondJoinRequest(requestId, newStatus === "ACCEPTED");
      setIncomingRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: newStatus }
            : r
        )
      );
      if (newStatus === "ACCEPTED") {
        setCreatedProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, currentMembersCount: (p.currentMembersCount || 1) + 1 }
              : p
          )
        );
      }
      toast.success(
        newStatus === "ACCEPTED"
          ? "Applicant accepted! Team member added."
          : newStatus === "PENDING"
          ? "Rejection undone. Request restored to Pending."
          : "Join request rejected."
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to respond to join request");
    } finally {
      setRespondingReqId(null);
    }
  };

  const isUserCreatorOf = (project: any) => {
    if (!user || !project) return false;
    return Boolean(
      (user.id && project.ownerId && project.ownerId === user.id) ||
      (project.ownerName && (project.ownerName === user.name || project.ownerName === user.fullName)) ||
      project.isLead === true ||
      project.lead === user.name
    );
  };

  const handleOpenViewRequests = (project: any) => {
    if (!isUserCreatorOf(project)) {
      toast.error("Only the team creator/lead can view join requests.");
      return;
    }
    if (project.completed) {
      toast.info("Hiring is completed for this team. All join requests have been cleared.");
      return;
    }
    setViewRequestsProject(project);
  };

  const executeCompleteHiring = async () => {
    if (!completeConfirm) return;
    const project = createdProjects.find((p) => p.id === completeConfirm);
    if (project && !isUserCreatorOf(project)) {
      toast.error("Only the team creator/lead can complete hiring.");
      setCompleteConfirm(null);
      return;
    }
    try {
      setCompletingProject(true);
      await markProjectComplete(completeConfirm);
      setCreatedProjects((prev) =>
        prev.map((p) => (p.id === completeConfirm ? { ...p, completed: true } : p))
      );
      // Remove all join requests for this team from state since backend deleted them
      setIncomingRequests((prev) =>
        prev.filter((r) => r.teamId !== completeConfirm && r.projectId !== completeConfirm)
      );
      toast.success("Hiring completed! Team is now locked and all join requests deleted.");
    } catch (e: any) {
      toast.error(e.message || "Failed to complete hiring");
    } finally {
      setCompletingProject(false);
      setCompleteConfirm(null);
    }
  };

  const openEditReq = (req: any) => {
    setEditingReq(req);
    setEditReqForm({
      role: req.role || "",
      reason: req.message || req.reason || "",
    });
    setEditReqOpen(true);
  };

  const handleSaveReqEdit = async () => {
    if (!editingReq) return;
    if (!editReqForm.role.trim()) {
      toast.error("Please select or enter a role");
      return;
    }
    try {
      setSavingReqEdit(true);
      await updateJoinRequest(editingReq.id, editReqForm.role.trim(), editReqForm.reason.trim());
      setMyRequests((prev) =>
        prev.map((r) =>
          r.id === editingReq.id
            ? {
                ...r,
                role: editReqForm.role.trim(),
                message: editReqForm.reason.trim(),
                reason: editReqForm.reason.trim(),
              }
            : r
        )
      );
      toast.success("Join request updated successfully!");
      setEditReqOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update join request");
    } finally {
      setSavingReqEdit(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteConfirm) return;
    try {
      setDeletingTeam(true);
      await deleteTeam(deleteConfirm);
      setCreatedProjects((prev) => prev.filter((p) => p.id !== deleteConfirm));
      setStarredProjects((prev) => prev.filter((p) => p.id !== deleteConfirm));
      toast.success("Team/project deleted permanently.");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete team/project");
    } finally {
      setDeletingTeam(false);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteJoinRequest = async () => {
    if (!deleteReqConfirm) return;
    try {
      setDeletingReq(true);
      await deleteJoinRequest(deleteReqConfirm);
      setMyRequests((prev) => prev.filter((r) => r.id !== deleteReqConfirm));
      toast.success("Join request withdrawn.");
    } catch (e: any) {
      toast.error(e.message || "Failed to withdraw join request");
    } finally {
      setDeletingReq(false);
      setDeleteReqConfirm(null);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberHandle.trim()) {
      toast.error("Enter a CollegeBook handle/username");
      return;
    }
    if (!editingProject) return;
    const handle = newMemberHandle.trim().replace(/^@/, "");
    if (editMembers.some((m: any) => (m.handle || "").toLowerCase() === handle.toLowerCase())) {
      toast.error("Member already added");
      return;
    }
    try {
      setAddingMember(true);
      const updated: any = await addTeamMember(editingProject.id, handle);
      if (updated && Array.isArray(updated.members)) {
        setEditMembers(updated.members);
      } else {
        setEditMembers((prev) => [
          ...prev,
          { userId: `member-${Date.now()}`, name: handle, handle, role: "MEMBER" },
        ]);
      }
      setCreatedProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                members: updated?.members || editMembers,
                currentMembersCount: updated?.currentMembersCount || (p.currentMembersCount || 1) + 1,
              }
            : p
        )
      );
      setNewMemberHandle("");
      toast.success(`Member @${handle} added successfully!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!editingProject) return;
    const member = editMembers.find((m: any) => m.userId === memberId);
    if (member?.role === "OWNER") {
      toast.error("Cannot remove the team owner");
      return;
    }
    try {
      setRemovingMemberId(memberId);
      const updated: any = await removeTeamMember(editingProject.id, memberId);
      const newMemberList = updated?.members || editMembers.filter((m: any) => m.userId !== memberId);
      setEditMembers(newMemberList);
      setCreatedProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                members: newMemberList,
                currentMembersCount: updated?.currentMembersCount || Math.max(1, (p.currentMembersCount || 2) - 1),
              }
            : p
        )
      );
      toast.success("Member removed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const openEditTeam = (project: any) => {
    if (!isUserCreatorOf(project)) {
      toast.error("Only the team creator/lead can edit this project or team.");
      return;
    }
    if (project.completed) {
      toast.error("Hiring is completed for this team. Completed projects/teams cannot be edited.");
      return;
    }
    setEditingProject(project);
    const typeStr = String(project.type || "").toUpperCase();
    const cat =
      typeStr === "OPEN_SOURCE" || typeStr === "OPEN-SOURCE" || typeStr === "OPEN_SOURCE_PROJECT"
        ? "open_source"
        : typeStr === "HACKATHON" || typeStr === "HACKATHON_TEAM"
        ? "hackathon"
        : "project";
    setEditCategory(cat);

    let cleanDescription = project.description || "";
    let hackathonName = project.hackathon || "";

    if (cat === "hackathon") {
      const match = cleanDescription.match(/^Hackathon:\s*([^\n]+)(?:\n\n)?([\s\S]*)$/i);
      if (match) {
        hackathonName = match[1].trim();
        cleanDescription = match[2].trim();
      }
    }

    setEditTeamForm({
      title: project.title || "",
      hackathon: hackathonName,
      description: cleanDescription,
      githubLink: project.githubLink || "",
      maxMembers: String(project.maxMembers || 4),
    });

    const tags = Array.from(
      new Set([
        ...(Array.isArray(project.requiredExpertise) ? project.requiredExpertise : []),
        ...(Array.isArray(project.skills) ? project.skills : []),
      ])
    );
    setEditTags(tags);
    setEditTagInput("");

    // Load existing members
    const members = Array.isArray(project.members) ? project.members : [];
    setEditMembers(members);
    setNewMemberHandle("");

    setEditTeamOpen(true);
  };

  const addEditTag = (tagText: string) => {
    const trimmed = tagText.trim();
    if (!trimmed) return;
    if (editTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" already added`);
      return;
    }
    if (editTags.length >= 10) {
      toast.error("Maximum 10 tags allowed");
      return;
    }
    setEditTags((prev) => [...prev, trimmed]);
    setEditTagInput("");
  };

  const removeEditTag = (tagToRemove: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleEditTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEditTag(editTagInput);
    }
  };

  const handleSaveTeam = async () => {
    if (!editingProject) return;
    if (!editTeamForm.title.trim()) {
      toast.error(
        editCategory === "open_source"
          ? "Please enter a repository / project name"
          : editCategory === "hackathon"
          ? "Please enter a team name"
          : "Please enter a project title"
      );
      return;
    }
    if (editCategory === "open_source" && !editTeamForm.githubLink.trim()) {
      toast.error("GitHub repository URL is required for open-source projects");
      return;
    }
    if (editTeamForm.githubLink.trim() && !isValidHttpUrl(editTeamForm.githubLink.trim())) {
      toast.error("Please provide a valid repository or project web link (e.g. https://github.com/username/repo)");
      return;
    }

    try {
      setSavingTeam(true);
      const mappedType =
        editCategory === "open_source"
          ? "OPEN_SOURCE"
          : editCategory === "hackathon"
          ? "HACKATHON"
          : "PROJECT";

      const finalDescription =
        editCategory === "hackathon"
          ? editTeamForm.description.trim()
            ? editTeamForm.hackathon.trim()
              ? `Hackathon: ${editTeamForm.hackathon.trim()}\n\n${editTeamForm.description.trim()}`
              : editTeamForm.description.trim()
            : editTeamForm.hackathon.trim() || "Hackathon Team"
          : editTeamForm.description.trim();

      const payload = {
        title: editTeamForm.title.trim(),
        type: mappedType,
        description: finalDescription,
        githubLink: editCategory === "hackathon" ? "" : normalizeUrl(editTeamForm.githubLink.trim()),
        skills: editTags,
        requiredExpertise: editTags,
        maxMembers: editCategory === "open_source" ? 0 : parseInt(editTeamForm.maxMembers) || 4,
      };

      await updateTeam(editingProject.id, payload as any);

      setCreatedProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title: payload.title,
                type: payload.type,
                description: payload.description,
                githubLink: payload.githubLink,
                skills: payload.skills,
                requiredExpertise: payload.requiredExpertise,
                maxMembers: payload.maxMembers,
              }
            : p
        )
      );

      setEditTeamOpen(false);
      toast.success(
        editCategory === "open_source"
          ? "Open-source project updated successfully!"
          : editCategory === "hackathon"
          ? "Hackathon team updated successfully!"
          : "Team project updated successfully!"
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to update project");
    } finally {
      setSavingTeam(false);
    }
  };

  const handleToggleStar = (teamId: string | number) => {
    const team = createdProjects.find((t) => t.id === teamId);
    if (!team) return;
    const currentStarred = !!team.starred;

    triggerToggle(
      teamId,
      currentStarred,
      (newStarred) => {
        setCreatedProjects((prev) =>
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

  const myOpenSourceProjects = createdProjects.filter(
    (p) => p.type === "OPEN_SOURCE" || p.type === "open_source"
  );
  const myTeamProjects = createdProjects.filter(
    (p) => p.type !== "OPEN_SOURCE" && p.type !== "open_source"
  );

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex items-center justify-center">
        <ThemedLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 md:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-primary/20">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
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
                  <h1 className="font-heading text-xl md:text-2xl font-bold">{profile.name}</h1>
                  {(profile.handle || user.handle) && (
                    <p className="text-xs font-mono font-semibold text-primary mt-0.5">
                      @{profile.handle || user.handle}
                    </p>
                  )}
                  <p className="text-sm font-medium text-foreground/80 mt-0.5">{profile.bio}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border border-border/70 hover:bg-muted shadow-xs transition-all"
                      title="Settings & Options"
                    >
                      <Settings className="h-4 w-4 text-foreground/80" />
                      <span className="sr-only">Profile options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border shadow-lg">
                    <DropdownMenuItem
                      className="gap-2.5 cursor-pointer py-2 px-3 rounded-lg text-xs font-medium focus:bg-primary/10 focus:text-primary"
                      onClick={() => {
                        const cId = profile.courseId || editForm.courseId || "";
                        const dId = profile.departmentId || editForm.departmentId || "";
                        const yStr = String(profile.yearNum || editForm.year || "1");
                        const clgId = profile.collegeId || editForm.collegeId || "";
                        setEditForm({
                          name: profile.name,
                          customBio: profile.customBio || "",
                          college: profile.college,
                          collegeId: clgId,
                          courseId: cId,
                          courseName: profile.courseName || editForm.courseName || "",
                          departmentId: dId,
                          departmentName: profile.departmentName || editForm.departmentName || "",
                          year: yStr,
                          avatarUrl: profile.avatarUrl,
                        });
                        if (clgId) {
                          getCoursesByCollege(clgId).then((cList) => {
                            if (cList) setCollegeCourses(cList);
                          }).catch(() => {});
                        }
                        if (cId) {
                          getDepartmentsByCourse(cId).then((dList) => {
                            if (dList) setCourseDepartments(dList);
                          }).catch(() => {});
                        }
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2.5 cursor-pointer py-2 px-3 rounded-lg text-xs font-medium focus:bg-primary/10 focus:text-primary"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <Settings className="h-4 w-4 text-primary" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {profile.customBio && profile.customBio !== profile.bio && !profile.customBio.includes("•") && (
                <FormattedContent
                  content={profile.customBio}
                  className="text-sm text-muted-foreground mt-2 leading-relaxed"
                />
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> {profile.college}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {profile.year}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader className="pb-2 border-b border-border/50">
            <DialogTitle className="text-lg font-bold">Edit Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Update your public profile name and custom bio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  {editForm.avatarUrl ? (
                    <AvatarImage src={editForm.avatarUrl} alt="Preview" />
                  ) : (
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                  title="Upload new photo"
                >
                  <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors border border-primary/20">
                    <Camera className="h-3.5 w-3.5" />
                    <span>Change Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  {(editForm.avatarUrl || avatarFile) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setEditForm((prev) => ({ ...prev, avatarUrl: "" }));
                      }}
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Upload a profile photo or remove to show initials avatar.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">College / University</Label>
              <Input value={editForm.college} disabled className="h-9 opacity-70 bg-muted/50 cursor-not-allowed text-xs" />
              <p className="text-[11px] text-muted-foreground">Linked to your verified registration</p>
            </div>

            {/* Course / Degree Program */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Course / Degree</Label>
              <Select value={editForm.courseId} onValueChange={handleEditCourseChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select course (e.g. B.Tech, M.Tech, BCA)" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {collegeCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.shortName ? `${c.shortName} (${c.name})` : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department & Year of Study */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Department</Label>
                <Select
                  value={editForm.departmentId}
                  onValueChange={handleEditDepartmentChange}
                  disabled={courseDepartments.length === 0}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {courseDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold">Year of Study</Label>
                <Select value={editForm.year} onValueChange={(v) => setEditForm((prev) => ({ ...prev, year: v }))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      {
                        length:
                          collegeCourses.find((c) => c.id === editForm.courseId)?.durationYears || 4,
                      },
                      (_, i) => i + 1
                    ).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}{["st", "nd", "rd"][y - 1] || "th"} Year
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Bio with 250 Character Limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Custom Bio</Label>
                <span
                  className={`text-[11px] font-semibold ${(editForm.customBio || "").length >= 250
                      ? "text-destructive"
                      : "text-muted-foreground"
                    }`}
                >
                  {(editForm.customBio || "").length}/250
                </span>
              </div>
              <div className="p-0.5">
                <Textarea
                  placeholder="Short tagline or bio below your name (links are clickable)..."
                  maxLength={250}
                  value={editForm.customBio}
                  onChange={(e) => setEditForm({ ...editForm, customBio: e.target.value.slice(0, 250) })}
                  className="min-h-[80px] w-full text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Appears directly below your name on your profile header</p>
            </div>
          </div>

          <DialogFooter className="mt-1 pt-3 border-t border-border/50 flex gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={savingProfile}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-gradient-hero text-primary-foreground gap-1.5 shadow-xs"
            >
              {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit About & Links Dialog */}
      <Dialog open={editAboutOpen} onOpenChange={setEditAboutOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden rounded-2xl border shadow-xl">
          <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/20 shrink-0">
            <DialogTitle className="text-lg font-bold">Edit About & Author's Note</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share your author's note, portfolio, and social profiles with your campus.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto max-h-[62vh] px-6 py-5 space-y-5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.3)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/60 [&::-webkit-scrollbar-track]:bg-transparent">
            {/* Author's Note */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Author's Note
                </Label>
                <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  Unlimited length • Multiline
                </span>
              </div>
              <div className="p-0.5">
                <Textarea
                  placeholder="Write in-depth notes, background, technical focus, research, or interests (links are automatically clickable)..."
                  value={editAboutForm.authorNote}
                  onChange={(e) =>
                    setEditAboutForm({ ...editAboutForm, authorNote: e.target.value.replace(/\n{3,}/g, "\n\n") })
                  }
                  className="min-h-[130px] w-full text-sm leading-relaxed p-3 rounded-xl border border-input bg-background/50 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all resize-y"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Displayed in the Author's Note section of your profile About tab.
              </p>
            </div>

            {/* Profiles & Links Grid */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profiles & Portfolios
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Portfolio */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Portfolio Website
                  </Label>
                  <div className="p-0.5">
                    <Input
                      placeholder="https://yourportfolio.com"
                      value={editAboutForm.websiteUrl}
                      onChange={(e) =>
                        setEditAboutForm({ ...editAboutForm, websiteUrl: e.target.value })
                      }
                      className="h-9 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    />
                  </div>
                </div>

                {/* GitHub */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-primary" /> GitHub Profile
                  </Label>
                  <div className="p-0.5">
                    <Input
                      placeholder="https://github.com/username"
                      value={editAboutForm.githubUrl}
                      onChange={(e) =>
                        setEditAboutForm({ ...editAboutForm, githubUrl: e.target.value })
                      }
                      className="h-9 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details (Key-Value Pairs) */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Contact Details
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 rounded-lg"
                  onClick={() =>
                    setEditAboutForm({
                      ...editAboutForm,
                      contactDetails: [
                        ...editAboutForm.contactDetails,
                        { id: Date.now().toString(), label: "", value: "" },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Add Contact
                </Button>
              </div>

              {editAboutForm.contactDetails.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed border-border/60">
                  No contact details yet. Click "+ Add Contact" to add Discord, Telegram, alternate email, phone number, etc.
                </p>
              ) : (
                <div className="space-y-2">
                  {editAboutForm.contactDetails.map((contact, idx) => (
                    <div key={contact.id || idx} className="flex items-center gap-2 p-0.5">
                      <Input
                        placeholder="Label (e.g. Discord, Telegram, Phone)"
                        value={contact.label}
                        onChange={(e) => {
                          const updated = [...editAboutForm.contactDetails];
                          updated[idx].label = e.target.value;
                          setEditAboutForm({ ...editAboutForm, contactDetails: updated });
                        }}
                        className="w-1/3 h-8 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                      <Input
                        placeholder="Value (e.g. alex#1234, @alex_dev, +1234567890)"
                        value={contact.value}
                        onChange={(e) => {
                          const updated = [...editAboutForm.contactDetails];
                          updated[idx].value = e.target.value;
                          setEditAboutForm({ ...editAboutForm, contactDetails: updated });
                        }}
                        className="flex-1 h-8 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                        onClick={() => {
                          setEditAboutForm({
                            ...editAboutForm,
                            contactDetails: editAboutForm.contactDetails.filter((_, j) => j !== idx),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Custom Links */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-primary" /> Additional Custom Links
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 rounded-lg"
                  onClick={() =>
                    setEditAboutForm({
                      ...editAboutForm,
                      customLinks: [
                        ...editAboutForm.customLinks,
                        { id: Date.now().toString(), label: "", url: "" },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Add Link
                </Button>
              </div>

              {editAboutForm.customLinks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed border-border/60">
                  No custom links yet. Click "+ Add Link" to add links like LeetCode, Substack, Medium, etc.
                </p>
              ) : (
                <div className="space-y-2">
                  {editAboutForm.customLinks.map((link, idx) => (
                    <div key={link.id || idx} className="flex items-center gap-2 p-0.5">
                      <Input
                        placeholder="Label (e.g. LeetCode)"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...editAboutForm.customLinks];
                          updated[idx].label = e.target.value;
                          setEditAboutForm({ ...editAboutForm, customLinks: updated });
                        }}
                        className="w-1/3 h-8 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                      <Input
                        placeholder="URL (e.g. https://leetcode.com/user)"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...editAboutForm.customLinks];
                          updated[idx].url = e.target.value;
                          setEditAboutForm({ ...editAboutForm, customLinks: updated });
                        }}
                        className="flex-1 h-8 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                        onClick={() => {
                          setEditAboutForm({
                            ...editAboutForm,
                            customLinks: editAboutForm.customLinks.filter((_, j) => j !== idx),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-border/50 bg-muted/20 shrink-0 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditAboutOpen(false)}
              disabled={savingAbout}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAbout}
              disabled={savingAbout}
              className="bg-gradient-hero text-primary-foreground gap-1.5 shadow-xs"
            >
              {savingAbout && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save About
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden rounded-2xl border shadow-xl">
          <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Account Settings</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Manage security credentials, memory book backup, and campus account preferences.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto max-h-[62vh] px-6 py-5 space-y-6 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.3)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/60 [&::-webkit-scrollbar-track]:bg-transparent">

            {/* Section 1: Change Password via Email Verification */}
            <div className="space-y-3.5 p-4 rounded-xl border border-border/60 bg-muted/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-medium bg-primary/5 text-primary border-primary/20">
                  Email Verified Only
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For security, changing your password requires verifying a 6-digit one-time code sent to your registered campus email (<b>{user.email || profile.email || "Registered Student"}</b>).
              </p>

              {passwordStep === "request" ? (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendPasswordOtp}
                    disabled={sendingPasswordOtp}
                    className="gap-2 text-xs h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {sendingPasswordOtp ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    Send Verification Code to Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Code sent to email
                    </span>
                    <button
                      type="button"
                      onClick={handleSendPasswordOtp}
                      disabled={sendingPasswordOtp || passwordOtpCooldown > 0}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium disabled:opacity-50 disabled:no-underline"
                    >
                      {sendingPasswordOtp ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      {passwordOtpCooldown > 0
                        ? `Resend in ${Math.floor(passwordOtpCooldown / 60)}:${(passwordOtpCooldown % 60).toString().padStart(2, "0")}`
                        : "Resend Code"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">6-Digit Verification Code</Label>
                    <div className="p-0.5">
                      <Input
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={passwordOtp}
                        onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="h-9 text-sm font-mono tracking-widest text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">New Password</Label>
                      <div className="p-0.5">
                        <Input
                          type="password"
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Confirm New Password</Label>
                      <div className="p-0.5">
                        <Input
                          type="password"
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleChangePassword}
                      disabled={changingPassword || passwordOtp.length !== 6 || !newPassword}
                      className="bg-gradient-hero text-primary-foreground text-xs h-8 gap-1.5"
                    >
                      {changingPassword && <Loader2 className="h-3 w-3 animate-spin" />}
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPasswordStep("request");
                        setPasswordOtp("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="text-xs h-8 text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Memory Book Delivery Email Backup */}
            <div className="space-y-3.5 p-4 rounded-xl border border-border/60 bg-muted/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold text-foreground">Memory Book Delivery Email</h3>
                </div>
                {profile.memoryBookEmail && (
                  <Badge variant="outline" className="text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active Backup
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Specify the personal email address where you would like your digital <b>Campus Memory Book</b> (posts, projects, connections, and memories) delivered if your account is ever closed or deleted.
              </p>

              {profile.memoryBookEmail && memoryStep !== "otp" ? (
                <div className="p-3 rounded-lg bg-background border border-border/70 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Configured Backup Email</span>
                      <span className="text-xs font-semibold text-foreground font-mono">{profile.memoryBookEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMemoryEmailInput(profile.memoryBookEmail || "");
                          setMemoryStep("otp");
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        <Pencil className="h-3 w-3" /> Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveMemoryBookEmail}
                        disabled={removingMemoryEmail}
                        className="text-xs h-7 text-destructive hover:bg-destructive/10 gap-1"
                      >
                        {removingMemoryEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : memoryStep === "idle" ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-0.5">
                      <Input
                        type="email"
                        placeholder="personal.email@gmail.com"
                        value={memoryEmailInput}
                        onChange={(e) => setMemoryEmailInput(e.target.value)}
                        className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSendMemoryBookOtp}
                      disabled={sendingMemoryOtp || !memoryEmailInput.includes("@")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 shrink-0"
                    >
                      {sendingMemoryOtp && <Loader2 className="h-3 w-3 animate-spin" />}
                      Send Verification OTP
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">A 6-digit confirmation code will be dispatched to verify ownership of this email.</p>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Verifying: <b className="text-foreground font-mono">{memoryEmailInput}</b>
                    </span>
                    <button
                      type="button"
                      onClick={handleSendMemoryBookOtp}
                      disabled={sendingMemoryOtp || memoryOtpCooldown > 0}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium disabled:opacity-50 disabled:no-underline"
                    >
                      {sendingMemoryOtp ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      {memoryOtpCooldown > 0
                        ? `Resend in ${Math.floor(memoryOtpCooldown / 60)}:${(memoryOtpCooldown % 60).toString().padStart(2, "0")}`
                        : "Resend Code"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">6-Digit Verification Code</Label>
                    <div className="p-0.5">
                      <Input
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={memoryOtpInput}
                        onChange={(e) => setMemoryOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="h-9 text-sm font-mono tracking-widest text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleVerifyMemoryBookEmail}
                      disabled={verifyingMemoryEmail || memoryOtpInput.length !== 6}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5"
                    >
                      {verifyingMemoryEmail && <Loader2 className="h-3 w-3 animate-spin" />}
                      Confirm & Save Email
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMemoryStep("idle");
                        setMemoryOtpInput("");
                      }}
                      className="text-xs h-8 text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Campus Account Info & Session */}
            <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-muted/15">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Campus Account & Security</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-background border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Campus Account Email</span>
                  <span className="font-medium text-foreground break-all">{user.email || profile.email || "Registered Student"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Institution</span>
                  <span className="font-medium text-foreground truncate block">{profile.college}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Log Out Option */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Sign Out</h4>
                <p className="text-[11px] text-muted-foreground">Sign out of your active CollegeBook session on this device.</p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs h-8 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" /> Log Out
              </Button>
            </div>

          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-border/50 bg-muted/20 shrink-0 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPost}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deletePost(postToDelete)}
              disabled={isDeletingPost}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5"
            >
              {isDeletingPost && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Navigation Tabs */}
      <Tabs defaultValue="about" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-muted w-full flex overflow-x-auto no-scrollbar justify-start sm:justify-center p-1 rounded-xl gap-1">
          <TabsTrigger value="about" className="shrink-0 text-xs sm:text-sm px-3 py-1.5 font-medium">About</TabsTrigger>
          <TabsTrigger value="posts" className="shrink-0 text-xs sm:text-sm px-3 py-1.5 font-medium">Posts</TabsTrigger>
          <TabsTrigger value="mycon" className="shrink-0 text-xs sm:text-sm px-3 py-1.5 font-medium">myCon</TabsTrigger>
          <TabsTrigger value="starred" className="shrink-0 text-xs sm:text-sm px-3 py-1.5 font-medium">Starred</TabsTrigger>
          <TabsTrigger value="saved" className="shrink-0 text-xs sm:text-sm px-3 py-1.5 font-medium">Saved</TabsTrigger>
          <TabsTrigger value="peers" className="shrink-0 text-xs sm:text-sm px-3 py-1.5 font-medium">Campus</TabsTrigger>
        </TabsList>

        {/* 1. About Tab */}
        <TabsContent value="about" className="space-y-5">
          {/* Author's Note Section */}
          <Card className="p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span>Author's Note</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => {
                  setEditAboutForm({
                    authorNote: profile.authorNote || "",
                    websiteUrl: profile.websiteUrl || "",
                    githubUrl: profile.githubUrl || "",
                    contactDetails: [...(profile.contactDetails || [])],
                    customLinks: [...(profile.customLinks || [])],
                  });
                  setEditAboutOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit About
              </Button>
            </div>
            {profile.authorNote ? (
              <FormattedContent
                content={profile.authorNote}
                maxEnters={2}
                className="text-sm text-foreground/90 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No author's note added yet. Click "Edit About" to share your in-depth background, research, technical focus, and interests!
              </p>
            )}
          </Card>

          {/* Contact & Social Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card className="p-5 shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" /> Contact Details
              </h3>
              {profile.contactDetails && profile.contactDetails.length > 0 ? (
                <div className="space-y-2">
                  {profile.contactDetails.map((contact, idx) => {
                    const l = (contact.label || "").toLowerCase();
                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((contact.value || "").trim());
                    const isPhone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test((contact.value || "").trim().replace(/\s/g, ""));
                    
                    return (
                      <div
                        key={contact.id || idx}
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
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No contact details added yet. Click "Edit About" to add your contact details.
                </p>
              )}
            </Card>

            {/* Social & Portfolio Links */}
            <Card className="p-5 shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-primary" /> Links & Portfolios
              </h3>
              <div className="space-y-2">
                {/* Portfolio */}
                {profile.websiteUrl ? (
                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">Portfolio</span>
                    </div>
                    <a
                      href={
                        profile.websiteUrl.startsWith("http")
                          ? profile.websiteUrl
                          : `https://${profile.websiteUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-medium flex items-center gap-1 truncate max-w-[65%]"
                    >
                      <span className="truncate">{profile.websiteUrl.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                ) : null}

                {/* GitHub */}
                {profile.githubUrl ? (
                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Github className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">GitHub</span>
                    </div>
                    <a
                      href={
                        profile.githubUrl.startsWith("http")
                          ? profile.githubUrl
                          : `https://${profile.githubUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-medium flex items-center gap-1 truncate max-w-[65%]"
                    >
                      <span className="truncate">{profile.githubUrl.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                ) : null}

                {/* Custom Links */}
                {profile.customLinks &&
                  profile.customLinks.map((link) => {
                    if (!link.label || !link.url) return null;
                    const fullUrl = link.url.startsWith("http") ? link.url : `https://${link.url}`;
                    return (
                      <div key={link.id} className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/25 hover:bg-muted/45 border border-border/50 transition-all">
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
                  })}

                {!profile.websiteUrl &&
                  !profile.githubUrl &&
                  (!profile.customLinks || profile.customLinks.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">
                      No links added yet. Click "Edit About" to add your portfolio or social links.
                    </p>
                  )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Posts Tab */}
        <TabsContent value="posts">
          <div className="max-w-2xl mx-auto space-y-4">
            {activityPosts.length === 0 && (
              <Card className="p-8 text-center shadow-card">
                <p className="text-muted-foreground text-sm">No posts yet. Share something with your campus!</p>
              </Card>
            )}
            {activityPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                  {/* Top Section: Author Profile Header */}
                  <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-border shrink-0">
                        {profile.avatarUrl ? (
                          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm block leading-tight truncate">
                          {profile.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                          {profile.handle && (
                            <span className="font-mono text-primary/90 font-medium">
                              @{profile.handle.replace(/^@/, "")}
                            </span>
                          )}
                          {profile.handle && (profile.courseName || profile.bio) && <span>•</span>}
                          {(profile.courseName || profile.bio) && (
                            <span className="truncate">{profile.courseName || profile.bio}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                      onClick={() => setPostToDelete(post.id)}
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Bottom Section: Full Width Body, Media, Actions */}
                  <div className="w-full">
                    {/* Multiline clickable post content */}
                    <FormattedContent content={post.content} className="mt-1" />

                    {/* Post Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mt-3">
                        <ImageCarousel images={post.images} />
                      </div>
                    )}

                    {/* Post Video */}
                    {post.videoUrl && (
                      <div className="mt-3">
                        <VideoPlayer videoUrl={post.videoUrl} videoId={post.videoUrl} />
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {post.tags.map((t: string) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                          >
                            #{t.replace(/^#/, "")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Interactive Post Actions */}
                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-border gap-2 flex-wrap">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePostLike(post.id)}
                          className={`gap-1.5 text-xs ${
                            post.liked ? "text-red-500" : "text-muted-foreground"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              post.liked ? "fill-red-500" : ""
                            }`}
                          />
                          <span>{post.likes || 0}</span>
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
                          onClick={() => togglePostSave(post.id)}
                          className={`text-xs px-2.5 ${
                            post.saved ? "text-accent font-semibold" : "text-muted-foreground"
                          }`}
                          title={post.saved ? "Unsave post" : "Save post"}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${
                              post.saved ? "fill-current" : ""
                            }`}
                          />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSharePost(post.id);
                          }}
                        >
                          <Share2 className="h-4 w-4" /> Share
                        </Button>
                      </div>

                      <span className="text-[11px] text-muted-foreground shrink-0 select-none ml-auto">
                        {formatSmartDate(post.createdAt || post.time || post.date)}
                      </span>
                    </div>

                    {/* Inline Expandable Comments Stream */}
                    <AnimatePresence>
                      {expandedCommentsPostId === post.id && (
                        <InlineCommentsSection
                          post={post}
                          onCommentCountChange={(newCount) => {
                            setActivityPosts((prev) =>
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
        </TabsContent>

        {/* 3. myCon Tab */}
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
                      Verified college student badge on CollegeBook
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
                <h4 className="font-heading font-semibold text-base">Additional Skill Badges</h4>
                <p className="text-muted-foreground text-xs max-w-sm">
                  We will introduce automated skill verification badges soon.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* 5. Starred Tab */}
        <TabsContent value="starred" className="space-y-4 focus-visible:outline-none">
          {starredProjects.length === 0 ? (
            <Card className="p-10 text-center shadow-card space-y-3 border-dashed">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                <Star className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-base">No Starred Projects Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Projects and repositories you star in Collaboration Hub will be saved here for quick access.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
                <Link to="/collab">
                  <Rocket className="h-3.5 w-3.5 mr-1.5" /> Explore Collab Hub
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {starredProjects.map((project, i) => {
                const isOpenSource =
                  project.type === "OPEN_SOURCE" || project.type === "open_source";
                const isHackathon =
                  project.type === "HACKATHON" || project.type === "hackathon";

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <Card className="p-5 shadow-card hover:shadow-elevated transition-all border-border/80 hover:border-primary/40">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 space-y-2.5">
                          {/* Header badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/collab/${project.id}`}
                              className="font-bold text-base text-foreground tracking-tight hover:text-primary hover:underline transition-colors"
                            >
                              {project.title}
                            </Link>

                            {isOpenSource ? (
                              <Badge
                                variant="secondary"
                                className="text-[11px] bg-primary/10 text-primary border border-primary/20"
                              >
                                <Code2 className="h-3 w-3 mr-1" /> Open Source
                              </Badge>
                            ) : isHackathon ? (
                              <Badge
                                variant="secondary"
                                className="text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              >
                                <Users className="h-3 w-3 mr-1" /> Hackathon Team
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              >
                                <Rocket className="h-3 w-3 mr-1" /> Team Project
                              </Badge>
                            )}

                            {!isOpenSource && (
                              <Badge variant="outline" className="text-[11px]">
                                {project.currentMembersCount || 1}/{project.maxMembers || 4} members
                              </Badge>
                            )}

                            {project.completed && (
                              <Badge
                                variant="outline"
                                className="text-[11px] text-emerald-600 border-emerald-500/30"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-foreground/85 leading-relaxed line-clamp-2 text-ellipsis">
                            {project.description || "Collaboration project on CollegeBook."}
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
                          <div className="flex flex-wrap items-center gap-3 pt-0.5">
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
                              <span className="text-muted-foreground text-[10px]">
                                {isOpenSource ? "· Creator" : "· Lead"}
                              </span>
                            </div>

                            {project.ownerCollegeName && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>{project.ownerCollegeName}</span>
                              </div>
                            )}
                          </div>

                          {/* Tech stack badges */}
                          {((project.requiredExpertise && project.requiredExpertise.length > 0) ||
                            (project.skills && project.skills.length > 0)) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {Array.from(
                                new Set([
                                  ...(project.requiredExpertise || []),
                                  ...(project.skills || []),
                                ])
                              ).map((skill: string, idx: number) => (
                                <Badge
                                  key={`${project.id}-skill-${skill}-${idx}`}
                                  variant="outline"
                                  className="text-[11px] px-2 py-0.5 font-medium bg-muted/40"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right Actions: View Details, Star */}
                        <div className="flex sm:flex-col items-center justify-end sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-9 px-3 border border-border/70 hover:bg-muted font-medium w-full sm:w-auto"
                          >
                            <Link to={`/collab/${project.id}`}>
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStarProject(project.id)}
                            className="gap-1.5 text-xs h-9 px-3 border border-amber-400/40 text-amber-500 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 w-full sm:w-auto"
                            title="Unstar project"
                          >
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="font-semibold">{project.starsCount || 1}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 6. Saved Tab */}
        <TabsContent value="saved">
          <div className="max-w-2xl mx-auto space-y-4">
            {savedPostsList.length === 0 && (
              <Card className="p-8 text-center shadow-card">
                <p className="text-muted-foreground text-sm">No saved posts</p>
              </Card>
            )}
            {savedPostsList.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                  {/* Top Section: Author Profile Header */}
                  <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <Link
                        to={`/student/${encodeURIComponent(post.authorHandle || post.author || post.authorName || "")}`}
                        className="shrink-0 transition-transform active:scale-95"
                      >
                        <Avatar className="h-10 w-10 border border-border">
                          {post.avatarUrl && (
                            <AvatarImage src={post.avatarUrl} alt={post.author || post.authorName} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {post.initials || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/student/${encodeURIComponent(post.authorHandle || post.author || post.authorName || "")}`}
                          className="font-semibold text-sm hover:text-primary hover:underline transition-colors block leading-tight truncate"
                        >
                          {post.author || post.authorName || "Student"}
                        </Link>
                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                          {post.authorHandle && (
                            <span className="font-mono text-primary/90 font-medium">
                              @{post.authorHandle.replace(/^@/, "")}
                            </span>
                          )}
                          {post.authorHandle && (post.college || post.collegeName || post.course) && <span>•</span>}
                          {(post.college || post.collegeName || post.course) && (
                            <span className="truncate max-w-[200px] sm:max-w-xs">
                              {post.college || post.collegeName || post.course}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Full Width Body, Media, Actions */}
                  <div className="w-full">
                    {/* Multiline clickable post content */}
                    <FormattedContent content={post.content} className="mt-1" />

                    {/* Saved Post Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mt-3">
                        <ImageCarousel images={post.images} />
                      </div>
                    )}

                    {/* Saved Post Video */}
                    {post.videoUrl && (
                      <div className="mt-3">
                        <VideoPlayer videoUrl={post.videoUrl} videoId={post.videoUrl} />
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {post.tags.map((t: string) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                          >
                            #{t.replace(/^#/, "")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Interactive Post Actions */}
                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-border gap-2 flex-wrap">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePostLike(post.id)}
                          className={`gap-1.5 text-xs ${
                            post.liked ? "text-red-500" : "text-muted-foreground"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              post.liked ? "fill-red-500" : ""
                            }`}
                          />
                          <span>{post.likes || 0}</span>
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
                          onClick={() => togglePostSave(post.id)}
                          className="text-xs px-2.5 text-accent font-semibold"
                          title="Unsave post"
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSharePost(post.id);
                          }}
                        >
                          <Share2 className="h-4 w-4" /> Share
                        </Button>
                      </div>

                      <span className="text-[11px] text-muted-foreground shrink-0 select-none ml-auto">
                        {formatSmartDate(post.createdAt || post.time || post.date)}
                      </span>
                    </div>

                    {/* Inline Expandable Comments Stream */}
                    <AnimatePresence>
                      {expandedCommentsPostId === post.id && (
                        <InlineCommentsSection
                          post={post}
                          onCommentCountChange={(newCount) => {
                            setSavedPostsList((prev) =>
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
        </TabsContent>

        {/* 7. Campus / Peers Tab */}
        <TabsContent value="peers">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Students from {profile.college}</p>
            {campusStudents.length === 0 ? (
              <Card className="p-8 text-center shadow-card">
                <p className="text-muted-foreground text-sm">
                  No other students registered from your college yet.
                </p>
              </Card>
            ) : (
              campusStudents.map((peer, i) => (
                <motion.div
                  key={peer.slug || peer.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/student/${encodeURIComponent(peer.slug || peer.name)}`}>
                    <Card className="p-4 shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {peer.avatarUrl ? (
                              <AvatarImage src={peer.avatarUrl} alt={peer.name} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {peer.initials}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{peer.name || peer.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {peer.courseName
                                ? `${peer.courseName}${peer.currentYear ? ` • ${peer.currentYear}${peer.currentYear === 1 ? "st" : peer.currentYear === 2 ? "nd" : peer.currentYear === 3 ? "rd" : "th"} Year` : ""}`
                                : peer.defaultBio || "Student"}
                            </p>
                          </div>
                        </div>
                        <UsersRound className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 1. Edit Collab Team / Project Modal */}
      <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/50 bg-card/60 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {editCategory === "open_source"
                    ? "Edit Open-Source Project"
                    : editCategory === "hackathon"
                    ? "Edit Hackathon Team"
                    : "Edit Project Collaboration"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update details for your collaboration listing.
                </DialogDescription>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs px-2.5 py-1 capitalize font-medium ${
                  editCategory === "open_source"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    : editCategory === "hackathon"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {editCategory === "open_source"
                  ? "Open Source"
                  : editCategory === "hackathon"
                  ? "Hackathon"
                  : "Team Project"}
              </Badge>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
            {/* Hackathon Name Field (for Hackathons) */}
            {editCategory === "hackathon" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hackathon Name & Edition *</Label>
                <Input
                  placeholder="e.g. Smart India Hackathon 2025, ETHIndia 2025"
                  value={editTeamForm.hackathon}
                  onChange={(e) =>
                    setEditTeamForm((prev) => ({ ...prev, hackathon: e.target.value }))
                  }
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Title / Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {editCategory === "open_source"
                  ? "Repository / Project Name *"
                  : editCategory === "hackathon"
                  ? "Team Name *"
                  : "Project Title *"}
              </Label>
              <Input
                placeholder={
                  editCategory === "open_source"
                    ? "e.g. college-book-web, react-native-ui"
                    : editCategory === "hackathon"
                    ? "e.g. Binary Beasts, Code Crusaders"
                    : "e.g. AI-Powered Notes Summarizer"
                }
                value={editTeamForm.title}
                onChange={(e) =>
                  setEditTeamForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-9 text-xs"
              />
            </div>

            {/* GitHub URL (Required for Open Source, Optional for Project) */}
            {editCategory === "open_source" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GitHub Repository URL *</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://github.com/username/repository"
                    value={editTeamForm.githubLink}
                    onChange={(e) =>
                      setEditTeamForm((prev) => ({ ...prev, githubLink: e.target.value }))
                    }
                    className="h-9 text-xs pl-9"
                  />
                </div>
              </div>
            )}

            {editCategory === "project" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">GitHub Repository URL (Optional)</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://github.com/username/repo"
                      value={editTeamForm.githubLink}
                      onChange={(e) =>
                        setEditTeamForm((prev) => ({ ...prev, githubLink: e.target.value }))
                      }
                      className="h-9 text-xs pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Max Team Size</Label>
                  <Select
                    value={editTeamForm.maxMembers}
                    onValueChange={(val) =>
                      setEditTeamForm((prev) => ({ ...prev, maxMembers: val }))
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2" className="text-xs">2 Members</SelectItem>
                      <SelectItem value="3" className="text-xs">3 Members</SelectItem>
                      <SelectItem value="4" className="text-xs">4 Members</SelectItem>
                      <SelectItem value="5" className="text-xs">5 Members</SelectItem>
                      <SelectItem value="6" className="text-xs">6 Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {editCategory === "hackathon" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Max Team Size</Label>
                <Select
                  value={editTeamForm.maxMembers}
                  onValueChange={(val) =>
                    setEditTeamForm((prev) => ({ ...prev, maxMembers: val }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2" className="text-xs">2 Members</SelectItem>
                    <SelectItem value="3" className="text-xs">3 Members</SelectItem>
                    <SelectItem value="4" className="text-xs">4 Members</SelectItem>
                    <SelectItem value="5" className="text-xs">5 Members</SelectItem>
                    <SelectItem value="6" className="text-xs">6 Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Description & Goals</Label>
                <span className="text-[10px] text-muted-foreground">
                  Supports links & multi-line formatting
                </span>
              </div>
              <Textarea
                placeholder="Describe your project, features, what you are building, or what help you need..."
                value={editTeamForm.description}
                onChange={(e) =>
                  setEditTeamForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="min-h-[100px] text-xs leading-relaxed"
              />
            </div>

            {/* Tech Stack / Tags with suggestions */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Tech Stack / Skills Required</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill/tag and press Enter or comma..."
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={handleEditTagKeyDown}
                  className="h-9 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={() => addEditTag(editTagInput)}
                >
                  Add Tag
                </Button>
              </div>

              {/* Tag Pills */}
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  {editTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs gap-1 py-1 pl-2.5 pr-1.5 bg-background border border-border shadow-2xs group"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeEditTag(tag)}
                        className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-muted-foreground">Suggested tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {commonTechSuggestions
                    .filter((s) => !editTags.some((t) => t.toLowerCase() === s.toLowerCase()))
                    .slice(0, 8)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addEditTag(s)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Team Members Management (Hackathon & Project) */}
            {editCategory !== "open_source" && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" /> Team Members ({editMembers.length}/{editTeamForm.maxMembers})
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Add by CollegeBook username</span>
                </div>

                {/* Add Member Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">@</span>
                    <Input
                      placeholder="username (e.g. vasu_c)"
                      value={newMemberHandle}
                      onChange={(e) => setNewMemberHandle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      className="h-9 text-xs pl-7"
                      disabled={addingMember}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs gap-1 shrink-0"
                    onClick={handleAddMember}
                    disabled={addingMember || !newMemberHandle.trim()}
                  >
                    {addingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Add Member
                  </Button>
                </div>

                {/* Members List */}
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {editMembers.map((m: any) => {
                    const isOwner = m.role === "OWNER" || m.userId === editingProject?.ownerId;
                    const memberHandle = m.handle || m.name || "member";
                    return (
                      <div
                        key={m.userId || memberHandle}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                              {(m.name || memberHandle).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground truncate block">
                              {m.name || memberHandle}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              @{memberHandle} {isOwner ? "• Team Lead" : `• ${m.role || "Member"}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isOwner ? (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              Lead
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                              onClick={() => handleRemoveMember(m.userId)}
                              disabled={removingMemberId === m.userId}
                            >
                              {removingMemberId === m.userId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XIcon className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {editMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2 text-center">
                      No other members added yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-border/50 bg-muted/30 shrink-0 gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTeamOpen(false)}
              disabled={savingTeam}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTeam}
              size="sm"
              disabled={savingTeam}
              className="bg-gradient-hero text-primary-foreground font-semibold min-w-[120px]"
            >
              {savingTeam ? (
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

      {/* 2. View Incoming Requests Modal for Project Lead */}
      <Dialog
        open={!!viewRequestsProject}
        onOpenChange={(open) => !open && setViewRequestsProject(null)}
      >
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/50 bg-card/60 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Join Requests — {viewRequestsProject?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Review student applications and build your collaboration team.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {viewRequestsProject?.currentMembersCount || 1}/{viewRequestsProject?.maxMembers || 4} members
              </Badge>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
            {(() => {
              const currentRequests = incomingRequests.filter(
                (r: any) =>
                  r.teamId === viewRequestsProject?.id ||
                  r.projectId === viewRequestsProject?.id
              );

              if (currentRequests.length === 0) {
                return (
                  <div className="py-10 text-center space-y-2">
                    <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">No applications yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      When students apply to collaborate on this project, their requests will appear here for review.
                    </p>
                  </div>
                );
              }

              return currentRequests.map((r: any) => {
                const statusUpper = String(r.status || "pending").toUpperCase();
                const isPending = statusUpper === "PENDING";
                const isAccepted = statusUpper === "ACCEPTED";
                const isRejected = statusUpper === "REJECTED";

                return (
                  <Card key={r.id} className="p-4 shadow-card border-border/70 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/student/${encodeURIComponent(r.applicantName || "")}`}>
                          <Avatar className="h-9 w-9 hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer">
                            {r.applicantAvatar ? (
                              <AvatarImage src={r.applicantAvatar} alt={r.applicantName} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {(r.applicantName || "S").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </Link>
                        <div>
                          <Link
                            to={`/student/${encodeURIComponent(r.applicantName || "")}`}
                            className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors block"
                          >
                            {r.applicantName || "Student Applicant"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {r.applicantCourse || "Student"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {r.role}
                        </Badge>
                        <Badge
                          variant={
                            isAccepted
                              ? "default"
                              : isRejected
                              ? "destructive"
                              : "secondary"
                          }
                          className={`text-xs capitalize ${
                            isAccepted
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : ""
                          }`}
                        >
                          {isAccepted ? "Accepted" : isRejected ? "Rejected" : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    {(r.message || r.reason) && (
                      <div className="text-xs space-y-1">
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Application Pitch / Links:
                        </p>
                        <FormattedContent
                          content={r.message || r.reason}
                          maxEnters={2}
                          className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-foreground/90 leading-relaxed"
                        />
                      </div>
                    )}

                    {isPending ? (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30 gap-1 text-xs h-8"
                          disabled={respondingReqId === r.id}
                          onClick={() =>
                            handleRespondRequest(r.id, "REJECTED", viewRequestsProject.id)
                          }
                        >
                          {respondingReqId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XIcon className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs h-8 font-semibold"
                          disabled={respondingReqId === r.id}
                          onClick={() =>
                            handleRespondRequest(r.id, "ACCEPTED", viewRequestsProject.id)
                          }
                        >
                          {respondingReqId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Accept Teammate
                        </Button>
                      </div>
                    ) : isRejected ? (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground bg-muted/60 border border-border/40 px-2.5 py-1 rounded-md">
                          <XCircle className="h-3.5 w-3.5 text-rose-500/70" /> Application Declined
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-primary hover:bg-primary/10 border-primary/30 gap-1 text-xs h-7"
                          disabled={respondingReqId === r.id}
                          onClick={() =>
                            handleRespondRequest(r.id, "PENDING", viewRequestsProject.id)
                          }
                        >
                          {respondingReqId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Undo2 className="h-3 w-3" />
                          )}
                          Undo Rejection
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Teammate Accepted
                        </span>
                      </div>
                    )}
                  </Card>
                );
              });
            })()}
          </div>

          <DialogFooter className="px-6 py-3 border-t border-border/50 bg-muted/30 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewRequestsProject(null)}
              className="text-xs h-8"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Complete Hiring Confirmation Dialog */}
      <AlertDialog
        open={!!completeConfirm}
        onOpenChange={(open) => !open && !completingProject && setCompleteConfirm(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Complete Team Hiring?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed space-y-2 text-muted-foreground">
              <span className="block">
                Completing hiring will close recruitment, lock team member slots, remove the project from public Collab Hub listings, and permanently delete all remaining pending and rejected join requests.
              </span>
              <span className="block text-destructive font-medium">
                ⚠️ All pending and rejected join requests for this team will be permanently deleted. This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel disabled={completingProject} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={completingProject}
              onClick={(e) => {
                e.preventDefault();
                executeCompleteHiring();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold min-w-[140px]"
            >
              {completingProject ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Locking Team...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Yes, Complete Hiring</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 4. Edit Join Request Modal */}
      <Dialog open={editReqOpen} onOpenChange={setEditReqOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Join Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your desired role or pitch note for this team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Desired Role</Label>
              <Select
                value={editReqForm.role}
                onValueChange={(val) =>
                  setEditReqForm((prev) => ({ ...prev, role: val }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select role" />
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
                <Label className="text-xs font-semibold">Why do you want to join? (Pitch)</Label>
                <span className="text-[10px] text-muted-foreground">
                  {editReqForm.reason.length}/1000
                </span>
              </div>
              <Textarea
                placeholder="Describe what you can contribute, experience, and links to your work..."
                value={editReqForm.reason}
                maxLength={1000}
                onChange={(e) =>
                  setEditReqForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="min-h-[110px] text-xs leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                Supports clickable links and up to 2 line breaks.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditReqOpen(false)}
              disabled={savingReqEdit}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReqEdit}
              size="sm"
              disabled={savingReqEdit}
              className="bg-gradient-hero text-primary-foreground font-semibold text-xs h-8 min-w-[110px]"
            >
              {savingReqEdit ? (
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

      {/* 5. Delete Team/Project Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Team / Project?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
              This action is permanent and cannot be undone. All associated team data, member assignments, join requests, and stars will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel disabled={deletingTeam} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingTeam}
              onClick={handleDeleteTeam}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-8 font-semibold"
            >
              {deletingTeam ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 6. Withdraw/Delete Join Request Confirmation Dialog */}
      <AlertDialog
        open={!!deleteReqConfirm}
        onOpenChange={(open) => !open && setDeleteReqConfirm(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Withdraw Join Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Are you sure you want to withdraw this application? The team lead will no longer see your pitch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel disabled={deletingReq} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingReq}
              onClick={handleDeleteJoinRequest}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-8 font-semibold"
            >
              {deletingReq ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Withdrawing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Confirm Withdraw</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
