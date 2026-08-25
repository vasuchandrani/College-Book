import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, ChevronRight, ChevronLeft, Check, Eye, EyeOff, Search, 
  AlertCircle, Building2, Send, CheckCircle2, GraduationCap, X, Loader2
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { 
  getColleges, getCoursesByCollege, getDepartmentsByCourse, sendOtp, verifyOtp, signup, 
  submitCollegeRequest, formatApiError, checkHandleAvailability, type Course, type Department 
} from "@/lib/api";

const defaultColleges: { name: string; short: string; domain: string; uuid?: string }[] = [
  // Nadiad & Anand
  { name: "Dharmsinh Desai University - Nadiad", short: "DDU", domain: "ddu.ac.in" },
  { name: "Birla Vishvakarma Mahavidyalaya - Anand", short: "BVM", domain: "bvmengineering.ac.in" },
  { name: "G H Patel College of Engineering & Technology - Anand", short: "GCET", domain: "gcet.ac.in" },
  { name: "Chandubhai S Patel Institute of Technology (CHARUSAT) - Changa", short: "CSPIT", domain: "charusat.ac.in" },
  { name: "Devang Patel Institute of Advance Technology and Research (CHARUSAT)", short: "DEPSTAR", domain: "charusat.ac.in" },
  { name: "A D Patel Institute of Technology - New Vallabh Vidyanagar", short: "ADIT", domain: "adit.ac.in" },
  { name: "Madhuben and Bhanubhai Patel Institute of Technology - Anand", short: "MBIT", domain: "mbit.edu.in" },

  // Ahmedabad & Gandhinagar
  { name: "Nirma University (Institute of Technology) - Ahmedabad", short: "Nirma", domain: "nirmauni.ac.in" },
  { name: "L.D. College of Engineering - Ahmedabad", short: "LDCE", domain: "ldce.ac.in" },
  { name: "Vishwakarma Government Engineering College - Chandkheda", short: "VGEC", domain: "vgecg.ac.in" },
  { name: "Dhirubhai Ambani University - Gandhinagar", short: "DAU", domain: "dau.ac.in,daiict.ac.in" },
  { name: "Indian Institute of Technology Gandhinagar", short: "IIT-GN", domain: "iitgn.ac.in" },
  { name: "Pandit Deendayal Energy University - Gandhinagar", short: "PDEU", domain: "pdeu.ac.in" },
  { name: "School of Engineering and Applied Science (Ahmedabad University)", short: "SEAS-AU", domain: "ahduni.edu.in" },
  { name: "Indus University - Ahmedabad", short: "Indus", domain: "indusuni.ac.in" },
  { name: "Silver Oak University - Ahmedabad", short: "Silver Oak", domain: "silveroakuni.ac.in" },
  { name: "SAL Institute of Technology & Engineering Research - Ahmedabad", short: "SAL", domain: "sal.edu.in" },
  { name: "L.J. Institute of Engineering and Technology - Ahmedabad", short: "LJ-IET", domain: "ljku.edu.in" },
  { name: "Government Engineering College - Gandhinagar", short: "GEC-G", domain: "gecg28.ac.in" },
  { name: "Government Engineering College - Modasa", short: "GEC-Modasa", domain: "gecmodasa.ac.in" },

  // Gujarat Top
  { name: "Maharaja Sayajirao University of Baroda (FTE) - Vadodara", short: "MSU", domain: "msubaroda.ac.in" },
  { name: "Sardar Vallabhbhai National Institute of Technology - Surat", short: "SVNIT", domain: "svnit.ac.in" },
  { name: "Indian Institute of Information Technology Surat", short: "IIIT-Surat", domain: "iiitsurat.ac.in" },
  { name: "Indian Institute of Information Technology Vadodara", short: "IIIT-Vadodara", domain: "iiitvadodara.ac.in" },
  { name: "Parul Institute of Engineering and Technology - Vadodara", short: "Parul", domain: "paruluniversity.ac.in" },
  { name: "Marwadi University - Rajkot", short: "Marwadi", domain: "marwadiuniversity.ac.in" },

  // IITs
  { name: "Indian Institute of Technology Bombay", short: "IIT-B", domain: "iitb.ac.in" },
  { name: "Indian Institute of Technology Delhi", short: "IIT-D", domain: "iitd.ac.in" },
  { name: "Indian Institute of Technology Madras", short: "IIT-M", domain: "iitm.ac.in" },
  { name: "Indian Institute of Technology Kanpur", short: "IIT-K", domain: "iitk.ac.in" },
  { name: "Indian Institute of Technology Kharagpur", short: "IIT-KGP", domain: "iitkgp.ac.in" },
  { name: "Indian Institute of Technology Roorkee", short: "IIT-R", domain: "iitr.ac.in" },
  { name: "Indian Institute of Technology Guwahati", short: "IIT-G", domain: "iitg.ac.in" },
  { name: "Indian Institute of Technology Hyderabad", short: "IIT-H", domain: "iith.ac.in" },
  { name: "Indian Institute of Technology (BHU) Varanasi", short: "IIT-BHU", domain: "iitbhu.ac.in" },
  { name: "Indian Institute of Technology Indore", short: "IIT-Indore", domain: "iiti.ac.in" },

  // NITs
  { name: "National Institute of Technology Tiruchirappalli", short: "NIT-T", domain: "nitt.edu" },
  { name: "National Institute of Technology Karnataka Surathkal", short: "NIT-K", domain: "nitk.edu.in" },
  { name: "National Institute of Technology Warangal", short: "NIT-W", domain: "nitw.ac.in" },
  { name: "National Institute of Technology Calicut", short: "NIT-C", domain: "nitc.ac.in" },
  { name: "National Institute of Technology Rourkela", short: "NIT-RKL", domain: "nitrkl.ac.in" },
  { name: "Malaviya National Institute of Technology Jaipur", short: "MNIT", domain: "mnit.ac.in" },
  { name: "Motilal Nehru National Institute of Technology Allahabad", short: "MNNIT", domain: "mnnit.ac.in" },

  // BITS
  { name: "Birla Institute of Technology and Science Pilani", short: "BITS-P", domain: "pilani.bits-pilani.ac.in" },
  { name: "BITS Pilani - K K Birla Goa Campus", short: "BITS-Goa", domain: "goa.bits-pilani.ac.in" },
  { name: "BITS Pilani - Hyderabad Campus", short: "BITS-Hyd", domain: "hyderabad.bits-pilani.ac.in" },

  // IIITs & Famous
  { name: "International Institute of Information Technology Hyderabad", short: "IIIT-H", domain: "iiit.ac.in" },
  { name: "International Institute of Information Technology Bangalore", short: "IIIT-B", domain: "iiitb.ac.in" },
  { name: "Indraprastha Institute of Information Technology Delhi", short: "IIIT-D", domain: "iiitd.ac.in" },
  { name: "Delhi Technological University", short: "DTU", domain: "dtu.ac.in" },
  { name: "Netaji Subhas University of Technology - Delhi", short: "NSUT", domain: "nsut.ac.in" },
  { name: "COEP Technological University - Pune", short: "COEP", domain: "coeptech.ac.in" },
  { name: "Vellore Institute of Technology - Vellore", short: "VIT", domain: "vit.ac.in" },
  { name: "Manipal Institute of Technology - Manipal", short: "MIT-Manipal", domain: "manipal.edu" },
  { name: "R.V. College of Engineering - Bangalore", short: "RVCE", domain: "rvce.edu.in" },
];

const courseYearMap: Record<string, number> = {
  "B.Tech": 4, "B.Tech CSE": 4, "B.Tech IT": 4, "B.Tech AI-ML": 4, "B.Tech Data Science": 4,
  "B.Tech EC": 4, "B.Tech EE": 4, "B.Tech ME": 4, "B.Tech CE": 4, "B.Tech Chemical": 4,
  "B.Sc": 3, "BCA": 3, "B.Des": 4, "B.Com": 3, "BBA": 3, "B.Arch": 5, "B.Pharm": 4, "MBBS": 5,
  "M.Tech": 2, "M.Tech CSE": 2, "M.Tech VLSI": 2, "M.Sc": 2, "MCA": 2, "M.Des": 2, "MBA": 2, "M.Pharm": 2,
  "PhD": 5, "Diploma": 3, "Integrated M.Tech": 5, "Dual Degree": 5,
};

const getCourseDuration = (courseName: string, durationYearsFromDb?: number): number => {
  if (durationYearsFromDb && durationYearsFromDb > 0) return durationYearsFromDb;
  if (!courseName) return 4;
  const lower = courseName.toLowerCase();
  if (lower.includes("phd") || lower.includes("doctor") || lower.includes("dual") || lower.includes("integrated") || lower.includes("b.arch") || lower.includes("mbbs")) return 5;
  if (lower.includes("m.tech") || lower.includes("mtech") || lower.includes("mca") || lower.includes("m.sc") || lower.includes("msc") || lower.includes("mba") || lower.includes("m.des") || lower.includes("master")) return 2;
  if (lower.includes("bca") || lower.includes("b.sc") || lower.includes("bsc") || lower.includes("bba") || lower.includes("b.com") || lower.includes("diploma")) return 3;
  if (lower.includes("b.tech") || lower.includes("btech") || lower.includes("b.e") || lower.includes("be") || lower.includes("bachelor")) return 4;
  return courseYearMap[courseName] || 4;
};

const defaultCourses = [
  "B.Tech Computer Science & Engineering",
  "B.Tech Information Technology",
  "B.Tech Artificial Intelligence & Machine Learning",
  "B.Tech Data Science & Analytics",
  "B.Tech Electronics & Communication Engineering",
  "B.Tech Electrical Engineering",
  "B.Tech Mechanical Engineering",
  "B.Tech Civil Engineering",
  "B.Tech Chemical Engineering",
  "Master of Computer Applications (MCA)",
  "M.Tech Computer Science & Engineering",
  "Bachelor of Computer Applications (BCA)",
  "Doctor of Philosophy (PhD) in Engineering / Computing"
];

const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];

const categories = ["All", "Gujarat", "IITs", "NITs", "BITS", "IIITs"];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [colleges, setColleges] = useState(() => shuffleArray(defaultColleges));
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Request College Dialog State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestCollegeName, setRequestCollegeName] = useState("");
  const [requestCity, setRequestCity] = useState("");
  const [requestState, setRequestState] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestName, setRequestName] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const [form, setForm] = useState({
    collegeUuid: "", college: "", collegeShort: "", collegeDomain: "",
    fullName: "", handle: "", email: "", 
    courseUuid: "", course: "", 
    departmentUuid: "", department: "",
    year: "1", gender: "Male", password: "",
  });

  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "invalid">("idle");
  const [handleMessage, setHandleMessage] = useState("");

  const [error, setError] = useState("");

  // Debounced real-time Bloom filter handle checking
  useEffect(() => {
    const raw = form.handle.trim().replace(/^@/, "");
    if (!raw) {
      setHandleStatus("idle");
      setHandleMessage("");
      return;
    }

    if (raw.length < 3) {
      setHandleStatus("invalid");
      setHandleMessage("Handle must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9._]+$/.test(raw)) {
      setHandleStatus("invalid");
      setHandleMessage("Only letters, numbers, '.', and '_' allowed");
      return;
    }

    if (raw.length > 30) {
      setHandleStatus("invalid");
      setHandleMessage("Handle cannot exceed 30 characters");
      return;
    }

    setHandleStatus("checking");
    const timeoutId = setTimeout(async () => {
      try {
        const res = await checkHandleAvailability(raw);
        if (res.available) {
          setHandleStatus("available");
          setHandleMessage(`@${res.handle} is available!`);
        } else {
          setHandleStatus("unavailable");
          setHandleMessage(res.message || `@${res.handle} is already taken`);
        }
      } catch (err: any) {
        setHandleStatus("unavailable");
        setHandleMessage("Failed to check handle availability");
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [form.handle]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    let alive = true;
    getColleges()
      .then((data) => {
        if (alive && data && data.length > 0) {
          const mapped = data.map((c) => ({
            uuid: c.uuid,
            name: c.name,
            short: c.short,
            domain: c.emailDomain || "ac.in",
          }));
          setColleges(shuffleArray(mapped));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (form.collegeUuid) {
      getCoursesByCollege(form.collegeUuid)
        .then(async (cList) => {
          if (cList && cList.length > 0) {
            setCoursesList(cList);
            const initialCourse = cList[0];
            try {
              const dList = await getDepartmentsByCourse(initialCourse.id);
              setDepartmentsList(dList);
              setForm((f) => ({
                ...f,
                courseUuid: initialCourse.id,
                course: initialCourse.name,
                departmentUuid: dList?.[0]?.id || "",
                department: dList?.[0]?.name || "",
              }));
            } catch {
              setForm((f) => ({
                ...f,
                courseUuid: initialCourse.id,
                course: initialCourse.name,
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [form.collegeUuid]);

  const filteredColleges = useMemo(() => {
    return colleges.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
        c.short.toLowerCase().includes(collegeSearch.toLowerCase()) ||
        c.domain.toLowerCase().includes(collegeSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "All") return true;
      if (selectedCategory === "Gujarat") {
        return (
          c.name.includes("Nadiad") || c.name.includes("Anand") || c.name.includes("Ahmedabad") ||
          c.name.includes("Gandhinagar") || c.name.includes("Vadodara") || c.name.includes("Surat") ||
          c.name.includes("Rajkot") || c.name.includes("Changa") || c.name.includes("Vidyanagar") ||
          c.short === "DDU" || c.short === "BVM" || c.short === "GCET" || c.short === "CSPIT" ||
          c.short === "Nirma" || c.short === "LDCE" || c.short === "VGEC" || c.short === "DA-IICT"
        );
      }
      if (selectedCategory === "IITs") return c.short.startsWith("IIT") || c.name.includes("Indian Institute of Technology");
      if (selectedCategory === "NITs") return c.short.startsWith("NIT") || c.short === "SVNIT" || c.short === "VNIT" || c.short === "MNIT" || c.short === "MNNIT" || c.name.includes("National Institute of Technology");
      if (selectedCategory === "BITS") return c.short.startsWith("BITS") || c.name.includes("Birla Institute of Technology and Science");
      if (selectedCategory === "IIITs") return c.short.startsWith("IIIT") || c.name.includes("Information Technology");
      return true;
    });
  }, [colleges, collegeSearch, selectedCategory]);

  const selectCollege = async (name: string) => {
    const college = colleges.find(c => c.name === name || c.short === name);
    let collegeUuid = college?.uuid || "";
    let collegeDomain = college?.domain || "ddu.ac.in";
    let collegeShort = college?.short || "DDU";
    let collegeName = college?.name || name;

    if (!collegeUuid) {
      try {
        const fetched = await getColleges();
        if (fetched && fetched.length > 0) {
          const matched = fetched.find(
            f => f.name.toLowerCase().includes(name.toLowerCase()) ||
                 f.short.toLowerCase() === name.toLowerCase() ||
                 name.toLowerCase().includes(f.short.toLowerCase())
          );
          if (matched) {
            collegeUuid = matched.uuid;
            collegeName = matched.name;
            collegeShort = matched.short;
            collegeDomain = matched.emailDomain || collegeDomain;
          }
        }
      } catch {
        // Ignore fallback error
      }
    }

    setForm(prev => ({
      ...prev,
      collegeUuid,
      college: collegeName,
      collegeShort,
      collegeDomain,
      email: "",
    }));
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");

    if (collegeUuid) {
      try {
        const cList = await getCoursesByCollege(collegeUuid);
        setCoursesList(cList);
        if (cList.length > 0) {
          setForm(prev => ({ ...prev, courseUuid: cList[0].id, course: cList[0].name, year: "1" }));
        }
      } catch {
        // Fallback gracefully
      }
    }
    setStep(2);
  };

  const handleSendOtp = async () => {
    if (!form.email.trim()) {
      setError("Please enter your college email address");
      return;
    }
    if (form.collegeDomain && !form.email.toLowerCase().endsWith(`@${form.collegeDomain.toLowerCase()}`)) {
      setError(`Email must end with @${form.collegeDomain}`);
      return;
    }
    setError("");
    setSendingOtp(true);
    try {
      const res = await sendOtp(form.email.trim(), "SIGNUP");
      if (res.userExists || !res.sent) {
        setError(res.message || "An account with this email already exists. Please sign in instead.");
        return;
      }
      setOtpSent(true);
      setCooldown(300);
      toast.success(`Verification code sent to ${form.email}!`);
    } catch (e: any) {
      setError(formatApiError(e, "Failed to send verification email."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setError("");
    setVerifyingOtp(true);
    try {
      const res = await verifyOtp(form.email.trim(), otp.trim(), "SIGNUP");
      if (res.verified) {
        setOtpVerified(true);
        setCooldown(0);
        setError("");
        toast.success("Email verified successfully!");
      } else {
        setError("Invalid OTP code. Please check your email.");
      }
    } catch (e: any) {
      setError(formatApiError(e, "Invalid or expired verification code."));
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Selected course duration calculation for dynamic years
  const currentCourseDuration = useMemo(() => {
    const found = coursesList.find(c => c.id === form.courseUuid || c.name === form.course);
    return getCourseDuration(form.course, found?.durationYears);
  }, [coursesList, form.courseUuid, form.course]);

  const handleCourseChange = async (courseValue: string) => {
    const found = coursesList.find(c => c.id === courseValue || c.name === courseValue || c.shortName === courseValue);
    const duration = getCourseDuration(found?.name || courseValue, found?.durationYears);
    let newYear = form.year;
    if (parseInt(newYear) > duration) {
      newYear = "1";
    }

    setLoadingDepartments(true);
    let dList: Department[] = [];
    if (found?.id) {
      try {
        dList = await getDepartmentsByCourse(found.id);
        setDepartmentsList(dList);
      } catch (err) {
        dList = [];
      }
    }
    setLoadingDepartments(false);

    setForm(prev => ({
      ...prev,
      course: found ? found.name : courseValue,
      courseUuid: found ? found.id : prev.courseUuid,
      department: dList[0]?.name || "",
      departmentUuid: dList[0]?.id || "",
      year: newYear,
    }));
  };

  const handleDepartmentChange = (deptValue: string) => {
    const found = departmentsList.find(d => d.id === deptValue || d.name === deptValue);
    setForm(prev => ({
      ...prev,
      department: found ? found.name : deptValue,
      departmentUuid: found ? found.id : deptValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpVerified) {
      setError("Please verify your email first");
      return;
    }

    setSignupLoading(true);
    try {
      let resolvedCollegeUuid = form.collegeUuid;
      let resolvedCourseUuid = form.courseUuid;
      let resolvedDepartmentUuid = form.departmentUuid;

      // Auto-resolve collegeUuid from API if empty
      if (!resolvedCollegeUuid) {
        try {
          const fetched = await getColleges();
          const emailDomain = form.email.substring(form.email.indexOf("@") + 1).toLowerCase();
          const matched = fetched.find(
            f => (f.emailDomain && f.emailDomain.toLowerCase() === emailDomain) ||
                 f.name.toLowerCase().includes(form.college.toLowerCase()) ||
                 f.short.toLowerCase() === form.collegeShort.toLowerCase()
          );
          if (matched?.uuid) {
            resolvedCollegeUuid = matched.uuid;
          }
        } catch (e) {}
      }

      // Auto-resolve courseUuid from courses API if empty
      if (!resolvedCourseUuid && resolvedCollegeUuid) {
        try {
          const cList = await getCoursesByCollege(resolvedCollegeUuid);
          if (cList && cList.length > 0) {
            resolvedCourseUuid = cList[0].id;
          }
        } catch (e) {}
      }

      // Auto-resolve departmentUuid from departments API if empty
      if (!resolvedDepartmentUuid && resolvedCourseUuid) {
        try {
          const dList = await getDepartmentsByCourse(resolvedCourseUuid);
          if (dList && dList.length > 0) {
            resolvedDepartmentUuid = dList[0].id;
          }
        } catch (e) {}
      }

      if (!form.handle.trim()) {
        setError("Please choose a unique username handle");
        setSignupLoading(false);
        return;
      }

      if (handleStatus === "unavailable" || handleStatus === "invalid") {
        setError(handleMessage || "Please choose a valid and available username handle");
        setSignupLoading(false);
        return;
      }

      const user = await signup({
        name: form.fullName.trim(),
        handle: form.handle.trim().toLowerCase().replace(/^@/, ""),
        email: form.email.trim(),
        password: form.password,
        collegeId: resolvedCollegeUuid || undefined,
        courseId: resolvedCourseUuid || undefined,
        departmentId: resolvedDepartmentUuid || undefined,
        currentYear: parseInt(form.year) || 1,
        gender: form.gender,
        college: form.college,
        course: form.course,
        department: form.department,
      });

      localStorage.setItem("cb_user", JSON.stringify({
        role: "student",
        name: user.name,
        handle: user.handle,
        email: user.email,
        college: user.college,
        collegeShort: user.collegeShort,
        course: user.course,
        department: user.department,
        currentYear: user.currentYear,
        defaultBio: user.defaultBio,
        initials: user.initials,
      }));

      toast.success("Welcome to CollegeBook!");
      window.location.replace("/feed");
    } catch (e: any) {
      setError(formatApiError(e, "Registration failed. Please check your details."));
    } finally {
      setSignupLoading(false);
    }
  };

  const handleRequestCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestCollegeName.trim() || !requestEmail.trim()) {
      toast.error("Please fill in your college name and email");
      return;
    }
    setRequestLoading(true);
    try {
      await submitCollegeRequest({
        collegeName: requestCollegeName.trim(),
        city: requestCity.trim(),
        state: requestState.trim(),
        requesterEmail: requestEmail.trim(),
        requesterName: requestName.trim(),
      });
      setRequestSuccess(true);
      toast.success("College request submitted successfully!");
    } catch (err: any) {
      toast.error(formatApiError(err, "Failed to submit request. Please try again."));
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <SEO
        title="Join Your Campus"
        description="Sign up for CollegeBook with your university student credentials and join your dedicated college network."
        keywords="collegebook signup, join collegebook, campus registration, student account"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">CollegeBook</span>
          </Link>
          <p className="text-muted-foreground text-sm">Create your campus account</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? "bg-gradient-hero text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6 shadow-elevated">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-heading font-semibold text-lg">Select Your College</h2>
                  <span className="text-xs text-muted-foreground font-medium">{filteredColleges.length} colleges</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">Choose your institution to get started</p>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search your college" 
                    value={collegeSearch} 
                    onChange={(e) => setCollegeSearch(e.target.value)} 
                    className="pl-9 text-sm" 
                  />
                </div>

                {/* Quick Category Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                        selectedCategory === cat 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                  {filteredColleges.length > 0 ? (
                    filteredColleges.map(college => (
                      <button
                        key={college.name}
                        onClick={() => selectCollege(college.name)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors hover:border-primary hover:bg-primary/5 ${
                          form.college === college.name ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm leading-snug line-clamp-1">{college.name}</p>
                          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">{college.short}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">@{college.domain}</p>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-muted/30 rounded-lg border border-dashed">
                      <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-foreground">No college found matching "{collegeSearch}"</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">Don't see your college or university listed?</p>
                      <Button size="sm" variant="default" onClick={() => { setRequestCollegeName(collegeSearch); setShowRequestModal(true); }}>
                        Request to Add College &rarr;
                      </Button>
                    </div>
                  )}
                </div>

                {/* Request College Footer Link */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Can't find your campus?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestCollegeName(collegeSearch);
                      setRequestSuccess(false);
                      setShowRequestModal(true);
                    }}
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Send className="h-3.5 w-3.5" /> Request addition
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1 text-muted-foreground" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <h2 className="font-heading font-semibold text-lg mb-1">Verify Your Email</h2>
                <p className="text-muted-foreground text-sm mb-4">Registering for <strong>{form.college}</strong></p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed mb-4"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{error}</span>
                      {error.includes("already exists") && (
                        <div className="mt-1">
                          <Link to="/login" className="font-semibold underline hover:opacity-80 text-xs inline-flex items-center gap-1">
                            Sign in to your account &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>College Email</Label>
                    <Input
                      type="email"
                      placeholder={`your.name@${form.collegeDomain}`}
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setOtpSent(false); setOtpVerified(false); setCooldown(0); setError(""); }}
                      disabled={otpVerified}
                    />
                    <p className="text-xs text-muted-foreground">Must end with @{form.collegeDomain}</p>
                  </div>

                  {!otpVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || cooldown > 0}
                    >
                      {sendingOtp ? "Sending verification code..." : cooldown > 0 ? `Resend code in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}` : otpSent ? "Resend Verification Code" : "Send Verification Code"}
                    </Button>
                  )}

                  {otpSent && !otpVerified && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label>Verification Code (OTP)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          className="font-mono text-center tracking-widest text-lg"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otp.length !== 6}
                        >
                          {verifyingOtp ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Check your inbox and spam folder for the 6-digit code.</p>
                    </div>
                  )}

                  {otpVerified && (
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Email verified successfully!</span>
                    </div>
                  )}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => { setError(""); setStep(3); }}
                    disabled={!otpVerified}
                  >
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1 text-muted-foreground" onClick={() => { setStep(2); setError(""); }}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <h2 className="font-heading font-semibold text-lg mb-1">Your Details</h2>
                <p className="text-muted-foreground text-sm mb-4">Complete your profile for <strong>{form.college}</strong></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{error}</span>
                        {error.includes("already exists") && (
                          <div className="mt-1">
                            <Link to="/login" className="font-semibold underline hover:opacity-80 text-xs inline-flex items-center gap-1">
                              Sign in to your account &rarr;
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="handle">Username / Handle</Label>
                      {handleStatus === "checking" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" /> Checking...
                        </span>
                      )}
                      {handleStatus === "available" && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Available
                        </span>
                      )}
                      {(handleStatus === "unavailable" || handleStatus === "invalid") && (
                        <span className="text-xs text-destructive font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {handleMessage || "Unavailable"}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold select-none">
                        @
                      </div>
                      <Input
                        id="handle"
                        placeholder="your_handle"
                        value={form.handle}
                        onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") })}
                        className={`pl-8 font-mono text-sm ${
                          handleStatus === "available"
                            ? "border-emerald-500/70 focus-visible:ring-emerald-500/30"
                            : handleStatus === "unavailable" || handleStatus === "invalid"
                            ? "border-destructive/70 focus-visible:ring-destructive/30"
                            : ""
                        }`}
                        required
                        minLength={3}
                        maxLength={30}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Unique platform handle (letters, numbers, '.', '_')
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={form.courseUuid || form.course}
                      onValueChange={handleCourseChange}
                    >
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent className="max-h-56">
                        {coursesList.length > 0
                          ? coursesList.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.shortName ? `${c.shortName} (${c.name})` : c.name}
                              </SelectItem>
                            ))
                          : defaultCourses.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Department</Label>
                      <Select
                        value={form.departmentUuid || form.department}
                        onValueChange={handleDepartmentChange}
                        disabled={departmentsList.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-56">
                          {departmentsList.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.shortName ? `${d.name} (${d.shortName})` : d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                      <Label>Year</Label>
                      <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: currentCourseDuration }, (_, i) => i + 1).map(y => (
                            <SelectItem key={y} value={String(y)}>
                              {y}{["st", "nd", "rd"][y - 1] || "th"} Year
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        minLength={8}
                        required
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={signupLoading}>
                    {signupLoading ? "Creating Account..." : "Create Account"} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>

      {/* Request College Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-elevated p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>

              {!requestSuccess ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <GraduationCap className="h-6 w-6" />
                    <h3 className="text-lg font-heading font-bold text-foreground">Add Your College</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Can't find your college in the list? Submit the details below and our team will add your campus shortly!
                  </p>

                  <form onSubmit={handleRequestCollegeSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">College / University Name *</Label>
                      <Input
                        placeholder="e.g. Government Engineering College, Dahod"
                        value={requestCollegeName}
                        onChange={(e) => setRequestCollegeName(e.target.value)}
                        required
                        className="text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">City</Label>
                        <Input
                          placeholder="e.g. Dahod"
                          value={requestCity}
                          onChange={(e) => setRequestCity(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">State</Label>
                        <Input
                          placeholder="e.g. Gujarat"
                          value={requestState}
                          onChange={(e) => setRequestState(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Your College Email Address *</Label>
                      <Input
                        type="email"
                        placeholder="e.g. student@gecdahod.ac.in"
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        required
                        className="text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">Used to configure the official email domain verification</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Your Name (Optional)</Label>
                      <Input
                        placeholder="e.g. Vatsal Chandrani"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setShowRequestModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 text-xs gap-1.5" disabled={requestLoading}>
                        {requestLoading ? "Submitting..." : <><Send className="h-3.5 w-3.5" /> Submit Request</>}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-heading font-bold mb-1">Request Received!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Thank you for submitting <strong>{requestCollegeName}</strong>. Our campus integration team will review and add your college to the list shortly.
                  </p>
                  <Button className="w-full" onClick={() => setShowRequestModal(false)}>
                    Got it
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupPage;
