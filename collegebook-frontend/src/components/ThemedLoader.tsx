import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface ThemedLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ThemedLoader: React.FC<ThemedLoaderProps> = ({
  size = "md",
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: {
      container: "h-14 w-14",
      ring: "h-14 w-14",
      logo: "h-8 w-8",
      aura: "h-16 w-16",
      icon: "h-4 w-4",
    },
    md: {
      container: "h-20 w-20",
      ring: "h-20 w-20",
      logo: "h-12 w-12",
      aura: "h-24 w-24",
      icon: "h-6 w-6",
    },
    lg: {
      container: "h-24 w-24",
      ring: "h-24 w-24",
      logo: "h-14 w-14",
      aura: "h-28 w-28",
      icon: "h-7 w-7",
    },
  };

  const { container, ring, logo, aura, icon } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className={`relative flex items-center justify-center ${container}`}>
        {/* Subtle background ambient pulse */}
        <motion.div
          animate={{
            scale: [0.85, 1.2, 0.85],
            opacity: [0.2, 0.55, 0.2],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute ${aura} rounded-full bg-primary/25 blur-xl pointer-events-none`}
        />

        {/* Clean Zoom-in Zoom-out Logo */}
        <motion.div
          animate={{
            scale: [0.88, 1.12, 0.88],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 flex items-center justify-center"
        >
          {!imgError ? (
            <img
              src="/logo.png"
              alt="CollegeBook"
              onError={() => setImgError(true)}
              className={`${logo} object-contain rounded-2xl drop-shadow-md select-none pointer-events-none`}
            />
          ) : (
            <div className={`${logo} rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg shadow-primary/25`}>
              <BookOpen className={`${icon} text-primary-foreground drop-shadow-xs`} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ThemedLoader;
