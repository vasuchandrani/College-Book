import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-illustration.png";
import DownloadAppButton from "@/components/DownloadAppButton";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }} />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-accent-foreground">Built for Campus Life</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Build Your{" "}
              <span className="text-gradient-hero">College Story.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
              A purpose-built digital campus platform — focused on collaboration,
              visibility, and meaningful academic interaction. No noise. No distractions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-gradient-hero text-primary-foreground hover:opacity-90 gap-2 text-base px-8" asChild>
                <Link to="/signup">Get Started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>

            {/* Download App Button */}
            <div className="mt-6">
              <DownloadAppButton />
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                Time-bound accounts
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                Zero distractions
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                Campus-only
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <img
              src={heroImg}
              alt="CollegeBook - Digital Campus Network"
              width={1024}
              height={768}
              className="w-full max-w-lg drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
