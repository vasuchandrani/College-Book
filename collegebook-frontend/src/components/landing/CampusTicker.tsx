import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

const colleges = [
  "Dharmsinh Desai University (DDU)",
  "IIT Bombay",
  "Nirma University",
  "DA-IICT Gandhinagar",
  "BITS Pilani",
  "IIT Gandhinagar",
  "SVNIT Surat",
  "BVM Engineering College",
  "DEPSTAR / CSPIT Charusat",
  "LDCE Ahmedabad",
  "VGEC Chandkheda",
  "IIT Delhi",
  "IIIT Vadodara",
  "PDEU Gandhinagar",
  "GCET Anand",
  "MSU Baroda",
  "IIT Madras",
  "NIT Trichy",
];

const CampusTicker = () => {
  return (
    <section className="py-8 bg-muted/40 border-y border-border/60 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Connecting Campus Ecosystems</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-accent-foreground font-medium">
          <span>Active Student Communities</span>
        </div>
      </div>

      <div className="flex select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: [0, -1800] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
          className="flex items-center gap-4 shrink-0 pr-4"
        >
          {colleges.concat(colleges).map((college, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/70 text-xs font-medium text-foreground/80 shadow-2xs hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <span>{college}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CampusTicker;
