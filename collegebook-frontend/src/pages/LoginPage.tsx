/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { login, forgotPassword } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     login()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email === "admin@collegebook.com" && password === "admin@123") {
      localStorage.setItem("cb_user", JSON.stringify({ role: "admin", name: "Admin", email }));
      navigate("/admin");
      return;
    }

    if (email && password) {
      localStorage.setItem("cb_user", JSON.stringify({
        role: "student",
        name: "Vatsal Chandrani",
        email,
        college: "IIT Delhi",
        collegeShort: "IIT-D",
        course: "B.Tech",
        year: "3rd Year",
        gender: "Male",
        initials: "VC",
      }));
      navigate("/feed");
      return;
    }

    setError("Please enter valid credentials");
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
          <p className="text-muted-foreground text-sm">Sign in to your campus account</p>
        </div>

        <Card className="p-6 shadow-elevated">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <Input id="email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
