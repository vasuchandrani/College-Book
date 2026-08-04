import { motion } from "framer-motion";
import {
  Newspaper, Compass, Users, UserCircle, BadgeCheck, BookHeart,
  Heart, Bookmark, Share2, Search, Handshake, MessageSquare,
} from "lucide-react";

const features = [
  {
    id: "features",
    icon: Newspaper,
    title: "Campus Feed",
    description: "A shared space for your college — post ideas, achievements, and opportunities. Like counts visible, no names. Save & share posts. No follow system, no chat. Clarity over noise.",
    highlights: [
      { icon: Heart, text: "Anonymous likes" },
      { icon: Bookmark, text: "Save posts" },
      { icon: Share2, text: "Share externally" },
    ],
  },
  {
    id: "explore",
    icon: Compass,
    title: "Explore",
    description: "Expand beyond your campus. Discover posts from students across other colleges. Broader ideas, same structured interaction model. No pressure.",
    highlights: [
      { icon: Search, text: "Cross-campus discovery" },
    ],
  },
  {
    id: "collab",
    icon: Users,
    title: "Collab Hub",
    description: "Find hackathon teams, start projects, join with intent. Request-based communication until accepted, then private team chat. Collaboration begins with purpose.",
    highlights: [
      { icon: Handshake, text: "Intent-based joining" },
      { icon: MessageSquare, text: "Private team chat" },
    ],
  },
  {
    id: "profile",
    icon: UserCircle,
    title: "Profile & Academic Identity",
    description: "Your profile represents your academic journey — education, activity, saved posts, collaborations, and team records. Skill-focused, not popularity-driven.",
    highlights: [],
  },
  {
    id: "mycon",
    icon: BadgeCheck,
    title: "myCon — Verified Skill Badges",
    description: "Earn validated expertise tags like cp, ml, design. Submit verifiable proof. Skills are earned — not self-declared.",
    highlights: [],
  },
  {
    id: "memory",
    icon: BookHeart,
    title: "Digital Memory Archive",
    description: "Your account is time-bound. At graduation, receive a downloadable PDF/HTML archive — posts, collaborations, achievements. Your complete college story.",
    highlights: [],
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything Your Campus Needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Six core pillars designed for intentional collaboration and academic growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              id={feature.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
              {feature.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span key={h.text} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground">
                      <h.icon className="h-3 w-3" />
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
