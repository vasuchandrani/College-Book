import { BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/80 py-14 bg-card/60 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-xs">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">CollegeBook</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The high-signal campus network for engineering and technology universities.
              Connect with purpose, build projects, and graduate with your complete story.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#experience" className="hover:text-primary transition-colors">
                  Interactive Demo
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Student Portal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/signup" className="hover:text-primary transition-colors">
                  Join Your Campus
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-primary transition-colors">
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/60 text-xs text-muted-foreground">
          <p>
            Built by{" "}
            <a
              href="https://vatsal-chandrani.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Vatsal Chandrani
            </a>{" "}
            — Turning ideas into software.
          </p>

          <p>© {new Date().getFullYear()} CollegeBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
