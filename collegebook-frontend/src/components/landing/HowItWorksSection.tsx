import { motion } from "framer-motion";
import { GraduationCap, Users, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    step: "01",
    icon: GraduationCap,
    title: "Verify Your Campus Identity",
    description:
      "Select your university or use your institutional student email. Instant access to your dedicated college ecosystem.",
    highlights: ["100+ Pre-mapped engineering colleges", "Automatic course & graduation year alignment"],
  },
  {
    step: "02",
    icon: Users,
    title: "Build Projects & Earn Badges",
    description:
      "Discover hackathon teammates, share technical breakthroughs, filter open-source teams, and link verifiable myCon skill badges.",
    highlights: ["Intent-based team join requests", "Private encrypted team channels"],
  },
  {
    step: "03",
    icon: BookOpen,
    title: "Graduate with Your Digital Story",
    description:
      "Your complete college journey automatically packages into a downloadable graduation yearbook PDF with all your achievements.",
    highlights: ["Lifetime verifiable portfolio", "Complete archive of collaborations"],
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-14 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-accent-foreground mb-3 sm:mb-4">
            <span>3 Simple Steps</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            How CollegeBook Works
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base">
            From your first day on campus to your graduation ceremony — your structured academic journey.
          </p>
        </div>

        {/* Desktop Steps Grid (md and up) */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top row with step number & icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-heading text-3xl font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-2 text-xs text-foreground/80">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Connected Roadmap Timeline (< md) */}
        <div className="md:hidden space-y-4 max-w-md mx-auto relative pl-7 before:content-[''] before:absolute before:left-3 before:top-4 before:bottom-8 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-accent before:to-muted-foreground/20">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative">
                {/* Connected step dot */}
                <div className="absolute -left-7 top-4 h-6 w-6 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-[10px] font-bold shadow-xs z-10">
                  {idx + 1}
                </div>

                <div className="bg-card border border-border rounded-2xl p-4.5 shadow-card space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-muted-foreground/50">
                      Step {item.step}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-border/40 space-y-1.5 text-[11px] text-foreground/80">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <Button size="lg" className="w-full sm:w-auto bg-gradient-hero text-primary-foreground gap-2 font-semibold px-8 h-12" asChild>
            <Link to="/signup">
              Get Started in 60 Seconds <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
