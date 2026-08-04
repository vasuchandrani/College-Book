/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { getColleges, sendOtp, verifyOtp, signup } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     getColleges()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, ChevronLeft, Check, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const colleges = [
  { name: "IIT Delhi", short: "IIT-D", domain: "iitd.ac.in" },
  { name: "IIT Bombay", short: "IIT-B", domain: "iitb.ac.in" },
  { name: "IIT Madras", short: "IIT-M", domain: "iitm.ac.in" },
  { name: "IIT Kanpur", short: "IIT-K", domain: "iitk.ac.in" },
  { name: "IIT Kharagpur", short: "IIT-KGP", domain: "iitkgp.ac.in" },
  { name: "BITS Pilani", short: "BITS-P", domain: "pilani.bits-pilani.ac.in" },
  { name: "NIT Trichy", short: "NIT-T", domain: "nitt.edu" },
  { name: "IIIT Hyderabad", short: "IIIT-H", domain: "iiit.ac.in" },
  { name: "DTU Delhi", short: "DTU", domain: "dtu.ac.in" },
  { name: "VIT Vellore", short: "VIT", domain: "vit.ac.in" },
  { name: "NIT Warangal", short: "NIT-W", domain: "nitw.ac.in" },
  { name: "IIT Roorkee", short: "IIT-R", domain: "iitr.ac.in" },
];

const courseYearMap: Record<string, number> = {
  "B.Tech": 4, "B.Sc": 4, "BCA": 4, "B.Des": 4,
  "M.Tech": 2, "M.Sc": 2, "MCA": 2, "M.Des": 2,
  "PhD": 5,
};

const courses = Object.keys(courseYearMap);
const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [form, setForm] = useState({
    college: "", collegeShort: "", collegeDomain: "",
    fullName: "", email: "", course: "", year: "", gender: "", password: "",
  });

  const [error, setError] = useState("");

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const selectCollege = (name: string) => {
    const college = colleges.find(c => c.name === name);
    if (college) {
      setForm({ ...form, college: college.name, collegeShort: college.short, collegeDomain: college.domain, email: "" });
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setStep(2);
    }
  };

  const getYearsForCourse = (course: string) => {
    const count = courseYearMap[course] || 4;
    return Array.from({ length: count }, (_, i) => `${i + 1}${["st", "nd", "rd"][i] || "th"} Year`);
  };

  const handleSendOtp = () => {
    if (!form.email.endsWith(`@${form.collegeDomain}`)) {
      setError(`Email must end with @${form.collegeDomain}`);
      return;
    }
    setError("");
    setOtpSent(true);
    toast.success("Verification code sent to your email!");
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setOtpVerified(true);
      setError("");
      toast.success("Email verified successfully!");
    } else {
      setError("Please enter a 6-digit code.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpVerified) {
      setError("Please verify your email first");
      return;
    }

    setSignupLoading(true);
    setTimeout(() => {
      localStorage.setItem("cb_user", JSON.stringify({
        role: "student",
        name: form.fullName,
        email: form.email,
        college: form.college,
        collegeShort: form.collegeShort,
        course: form.course,
        year: form.year,
        gender: form.gender,
        initials: form.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      }));
      navigate("/feed");
    }, 3500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
                <h2 className="font-heading font-semibold text-lg mb-1">Select Your College</h2>
                <p className="text-muted-foreground text-sm mb-4">Choose your institution to get started</p>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search colleges..." value={collegeSearch} onChange={(e) => setCollegeSearch(e.target.value)} className="pl-9" />
                </div>

                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {filteredColleges.map(college => (
                    <button
                      key={college.name}
                      onClick={() => selectCollege(college.name)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors hover:border-primary hover:bg-primary/5 ${
                        form.college === college.name ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <p className="font-medium text-sm">{college.name}</p>
                      <p className="text-xs text-muted-foreground">@{college.domain}</p>
                    </button>
                  ))}
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

                {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4">{error}</div>}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>College Email</Label>
                    <Input
                      type="email"
                      placeholder={`your.name@${form.collegeDomain}`}
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setOtpSent(false); setOtpVerified(false); }}
                      disabled={otpVerified}
                    />
                    <p className="text-xs text-muted-foreground">Must be your @{form.collegeDomain} email</p>
                  </div>

                  {!otpVerified && !otpSent && (
                    <Button onClick={handleSendOtp} className="w-full bg-gradient-hero text-primary-foreground" disabled={!form.email}>
                      Send Verification Code
                    </Button>
                  )}

                  {otpSent && !otpVerified && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Enter 6-digit Code</Label>
                        <Input placeholder="e.g. 123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="text-center text-lg tracking-[0.5em] font-semibold" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleSendOtp}>Resend</Button>
                        <Button onClick={handleVerifyOtp} className="flex-1 bg-gradient-hero text-primary-foreground" disabled={otp.length !== 6}>Verify</Button>
                      </div>
                    </div>
                  )}

                  {otpVerified && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-lg">
                      <Check className="h-4 w-4" /> Email verified successfully
                    </div>
                  )}

                  {otpVerified && (
                    <Button onClick={() => setStep(3)} className="w-full bg-gradient-hero text-primary-foreground gap-2">
                      Continue <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1 text-muted-foreground" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <h2 className="font-heading font-semibold text-lg mb-1">Your Details</h2>
                <p className="text-muted-foreground text-sm mb-4">Complete your profile for <strong>{form.college}</strong></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>}

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Select value={form.course} onValueChange={(v) => setForm({ ...form, course: v, year: "" })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })} disabled={!form.course}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {form.course && getYearsForCourse(form.course).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
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

                  <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground gap-2" disabled={signupLoading}>
                    {signupLoading ? (
                      <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Creating Account...</>
                    ) : (
                      <>Create Account <ChevronRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
