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
  LucideIcon,
} from "lucide-react";

export interface FeatureHighlight {
  icon: LucideIcon;
  text: string;
}

export interface FeatureItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: FeatureHighlight[];
}

export const features: FeatureItem[] = [
  {
    id: "campus-feed",
    icon: Newspaper,
    title: "Clean Campus Feed",
    description:
      "Real student ideas, questions, hackathon achievements, and campus updates. Zero addictive algorithms, zero endless reels, and zero vanity clout — just high-signal student activity.",
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
      "Earn validated expertise badges backed by public competitive programming profiles, open-source pull requests, and project proofs — not empty self-declarations.",
    highlights: [{ icon: CheckCircle2, text: "Proof-backed only" }],
  },
  {
    id: "memory-book",
    icon: BookHeart,
    title: "Graduation Memory Archive",
    description:
      "Intentionally aligned with your degree journey (2 to 5 years). At graduation, all your achievements and collaborations are compiled into an exportable Memory Book archive.",
    highlights: [{ icon: Lock, text: "Permanent PDF archive" }],
  },
];
