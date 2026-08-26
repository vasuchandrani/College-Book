import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-illustration.png";
import DownloadAppButton from "@/components/DownloadAppButton";

const HeroSection = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center pt-16 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-xs font-semibold text-primary">CollegeBook • The Digital Campus Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight">
              Build Your{" "}
              <span className="text-gradient-hero">College Story.</span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              A purpose-built digital campus platform — focused on collaboration, student life, and meaningful connections.
              Share fun activities across your campus and turn your awesome ideas into reality.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <Button
                size="lg"
                className="bg-gradient-hero text-primary-foreground hover:opacity-90 gap-2 text-base px-8 h-12 font-semibold shadow-sm w-full sm:w-auto"
                asChild
              >
                <Link to="/signup">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 font-medium w-full sm:w-auto"
                asChild
              >
                <a href="#experience">Explore Platform Demo</a>
              </Button>
            </div>

            {/* Download App Button */}
            <div className="pt-1 flex justify-center lg:justify-start">
              <DownloadAppButton />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-4 border-t border-border/60 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Degree time-bound
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Zero distractions
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Campus-only
              </div>
            </div>
          </motion.div>

          {/* Right Logo / Illustration Column (Centered and brought closer) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <img
              src={heroImg}
              alt="CollegeBook - Digital Campus Network"
              width={1024}
              height={768}
              className="w-full max-w-[260px] xs:max-w-xs sm:max-w-md lg:max-w-lg drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
