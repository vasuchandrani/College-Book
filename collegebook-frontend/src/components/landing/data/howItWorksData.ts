import { GraduationCap, Users, BookOpen, LucideIcon } from "lucide-react";

export interface StepItem {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
}

export const steps: StepItem[] = [
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
