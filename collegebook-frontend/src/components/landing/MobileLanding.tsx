import { ArrowRight, BookOpen } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { isAuthTokenValid } from "@/lib/api";
import DownloadAppButton from "@/components/DownloadAppButton";
import logo from "@/assets/logo.png";

const MobileLanding = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;

  if (isAuthTokenValid(token)) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="md:hidden h-[100svh] max-h-[100svh] overflow-hidden bg-background text-foreground">
      <div className="relative flex h-full flex-col items-center justify-between px-6 py-8 text-center">
        <div className="absolute inset-0 -z-0 opacity-[0.05] bg-[radial-gradient(circle_at_50%_25%,hsl(var(--primary))_0,transparent_55%)]" />
        <div className="relative z-10 flex flex-col items-center pt-6">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-white p-4 shadow-sm">
            <img src={logo} alt="" className="h-full w-full object-contain" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Digital campus network</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight">CollegeBook</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Connect with your campus, collaborate on ideas, and build your college story.
          </p>
        </div>

        <div className="relative z-10 flex w-full max-w-sm flex-col gap-3">
          <ButtonLink to="/signup" label="Create your account" primary />
          <ButtonLink to="/login" label="I already have an account" />
          <DownloadAppButton />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Build Your College Story.
        </div>
      </div>
    </div>
  );
};

const ButtonLink = ({ to, label, primary = false }: { to: string; label: string; primary?: boolean }) => (
  <Link
    to={to}
    className={`flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90 ${
      primary ? "bg-gradient-hero text-primary-foreground" : "border border-border bg-background text-foreground"
    }`}
  >
    {label}
    {primary && <ArrowRight className="h-4 w-4" />}
  </Link>
);

export default MobileLanding;
