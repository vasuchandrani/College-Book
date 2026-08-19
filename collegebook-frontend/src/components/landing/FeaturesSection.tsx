import { motion } from "framer-motion";
import {
  Newspaper,
  Compass,
  Users,
  UserCircle,
  BadgeCheck,
  BookHeart,
  Heart,
  Bookmark,
  Share2,
  Search,
  Handshake,
  MessageSquare,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";

const features = [
  {
    id: "campus-feed",
    icon: Newspaper,
    title: "Clean Campus Feed",
    description:
      "A distraction-free space for your university — post ideas, questions, and achievements. Like counts visible without usernames. Save and share posts cleanly.",
    highlights: [
      { icon: Heart, text: "Anonymous likes" },
      { icon: Bookmark, text: "Save posts" },
      { icon: Share2, text: "Share externally" },
    ],
  },
  {
    id: "collab-hub",
    icon: Users,
    title: "Collab Hub Team Building",
    description:
      "Find hackathon partners, start research projects, and apply with intent. Private, dedicated team communication channels unlock immediately upon acceptance.",
    highlights: [
      { icon: Handshake, text: "Intent-based joining" },
      { icon: MessageSquare, text: "Private team chat" },
    ],
  },
  {
    id: "cross-explore",
    icon: Compass,
    title: "Cross-Campus Explore",
    description:
      "Expand your horizons. Discover open-source projects, breakthroughs, and discussions from students across top engineering campuses nationwide.",
    highlights: [{ icon: Search, text: "Nationwide discovery" }],
  },
  {
    id: "academic-identity",
    icon: UserCircle,
    title: "Academic Identity Profile",
    description:
      "Your profile showcases your genuine academic journey — university, course, graduation year, team projects, and saved achievements. Skill-focused, not clout-driven.",
    highlights: [{ icon: Layers, text: "University-linked" }],
  },
  {
    id: "mycon-badges",
    icon: BadgeCheck,
    title: "myCon Verified Skill Badges",
    description:
      "Earn validated expertise badges in competitive programming, machine learning, and systems. Link verifiable proof instead of fake self-declarations.",
    highlights: [{ icon: CheckCircle2, text: "Proof-backed only" }],
  },
  {
    id: "memory-book",
    icon: BookHeart,
    title: "Graduation Memory Archive",
    description:
      "CollegeBook accounts are time-bound to your degree program (2 to 5 years). At graduation, download a timeless portfolio PDF containing your entire college story and achievements.",
    highlights: [{ icon: Lock, text: "Permanent PDF archive" }],
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/20 border-t border-border/70 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <span>Platform Pillars</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Six Core Pillars Built for Campus Life
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Everything students need to connect, build teams, share ideas, and preserve their college legacy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-all duration-300 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2.5 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              {feature.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                  {feature.highlights.map((h) => (
                    <span
                      key={h.text}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20"
                    >
                      <h.icon className="h-3 w-3 text-accent" />
                      {h.text}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
