import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">CollegeBook</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a
              href="https://vatsal-chandrani.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Vatsal Chandrani
            </a>{" "}
            — Turning ideas into digital systems.
          </p>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CollegeBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
