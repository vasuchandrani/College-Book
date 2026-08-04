/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { forgotPassword, resetPassword } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     forgotPassword()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSent(true);
      toast.success("Password reset link sent! (Mock)");
    }
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
          <p className="text-muted-foreground text-sm">Reset your password</p>
        </div>

        <Card className="p-6 shadow-elevated">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>College Email</Label>
                <Input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <p className="text-xs text-muted-foreground">We'll send a password reset link to your email</p>
              </div>
              <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground">
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Check your inbox</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              <Button variant="outline" onClick={() => setSent(false)} className="gap-1.5">
                Didn't receive it? Resend
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
