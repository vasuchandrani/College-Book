import { motion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DownloadAppButton from "@/components/DownloadAppButton";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-hero p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-elevated border border-primary/20"
        >
          {/* Ambient Glows Inside Banner */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/15 blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white backdrop-blur-md">
              <GraduationCap className="h-3.5 w-3.5 text-accent" />
              <span>100% Free For All Students</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight leading-tight">
              Ready to Shape Your College Legacy?
            </h2>

            <p className="text-primary-foreground/80 text-base sm:text-lg leading-relaxed">
              Join students across 100+ premier colleges. Build hackathon projects,
              earn verified skill badges, and tell your story without social distraction.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base px-8 h-12 font-bold shadow-lg hover:scale-105 transition-all w-full sm:w-auto"
                asChild
              >
                <Link to="/signup">
                  Join Your Campus <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base px-6 h-12 font-medium w-full sm:w-auto"
                asChild
              >
                <Link to="/login">
                  Student Sign In
                </Link>
              </Button>
            </div>

            <div className="pt-4 flex items-center justify-center">
              <DownloadAppButton />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
