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
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-accent-foreground mb-4">
            <span>3 Simple Steps</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How CollegeBook Works
          </h2>
          <p className="text-muted-foreground text-base">
            From your first day on campus to your graduation ceremony — your structured academic journey.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Button size="lg" className="bg-gradient-hero text-primary-foreground gap-2 font-semibold px-8" asChild>
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
