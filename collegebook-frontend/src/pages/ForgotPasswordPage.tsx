import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { forgotPassword, formatApiError } from "@/lib/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      setSent(true);
      setCooldown(300);
      toast.success("If an account exists with this email, a password reset link has been sent.");
    } catch (err: any) {
      toast.error(formatApiError(err, "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setSent(false);
      return;
    }

    try {
      setResending(true);
      await forgotPassword(email.trim());
      setCooldown(300);
      toast.success("Password reset email resent! Please check your inbox and spam folder.");
    } catch (err: any) {
      toast.error(formatApiError(err, "Failed to resend reset email"));
    } finally {
      setResending(false);
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
                <Input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send a password reset link and token to your registered college email.
                </p>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-hero text-primary-foreground">
                {loading ? "Sending Reset Email..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Check your inbox</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please check your spam or junk folder if you don't see it within a couple of minutes.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  asChild
                  className="w-full bg-gradient-hero text-primary-foreground font-semibold"
                >
                  <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
                    Enter Reset Token / Set New Password
                  </Link>
                </Button>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resending || cooldown > 0}
                    onClick={handleResend}
                    className="text-xs"
                  >
                    {resending
                      ? "Resending..."
                      : cooldown > 0
                      ? `Resend in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}`
                      : "Didn't receive it? Resend Email"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSent(false);
                      setCooldown(0);
                    }}
                    className="text-xs text-muted-foreground"
                  >
                    Change Email
                  </Button>
                </div>
              </div>
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
