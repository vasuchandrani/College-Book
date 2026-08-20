import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  Compass,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const pillars = [
  {
    icon: Layers,
    tag: "Chronological Feed",
    title: "Pure, Non-Addictive Engagement",
    description:
      "Real student ideas, questions, hackathon achievements, and campus updates. Zero addictive algorithms, zero endless reels, and zero vanity clout — just high-signal student activity.",
  },
  {
    icon: Users,
    tag: "Collab Hub",
    title: "Intent-Based Team Building",
    description:
      "Find project partners and hackathon teammates across departments and campuses. Structured join requests ensure strong alignment with private, focused team channels.",
  },
  {
    icon: ShieldCheck,
    tag: "Pressure-Free",
    title: "Authentic Peer Recognition",
    description:
      "Anonymous likes allow students to appreciate ideas, projects, and moments freely without hesitation, anxiety, or social pressure.",
  },
  {
    icon: CheckCircle2,
    tag: "myCon System",
    title: "Proof-Driven Skill Badges",
    description:
      "Earn validated expertise badges backed by public competitive programming profiles, open-source pull requests, and project proofs — not empty self-declarations.",
  },
  {
    icon: Compass,
    tag: "Cross-Campus",
    title: "Breaking Campus Silos",
    description:
      "Students across all colleges and tiers can freely discover what peers everywhere are building, researching, and achieving, fostering broad collaboration without borders.",
  },
  {
    icon: GraduationCap,
    tag: "Time-Bound",
    title: "Timeless Graduation Archive",
    description:
      "Intentionally aligned with your degree journey (2 to 5 years). At graduation, all your achievements and collaborations are compiled into an exportable Memory Book archive.",
  },
];

const ProblemSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, offsetWidth } = scrollContainerRef.current;
    const index = Math.round(scrollLeft / (offsetWidth * 0.82));
    setActiveIndex(Math.min(Math.max(index, 0), pillars.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.offsetWidth * 0.84;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-muted/30 border-y border-border/70 relative">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 sm:mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The CollegeBook Model</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Engineered for Real Student Connection
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base">
            Built from the ground up for collaboration, student life, and cross-campus discovery — with non-addictive, high-signal design.
          </p>
        </div>

        {/* Desktop Grid (md and up) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-elevated hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Horizontal Snap Carousel (< md) */}
        <div className="md:hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-3 px-1 no-scrollbar -mx-4 px-4"
          >
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="w-[84vw] max-w-[340px] shrink-0 snap-center bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {pillar.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Pillar {idx + 1} of {pillars.length}</span>
                    <span className="text-primary font-medium">Swipe &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots pagination */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {pillars.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => scrollToIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
