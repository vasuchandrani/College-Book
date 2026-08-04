import { motion } from "framer-motion";
import { AlertTriangle, Target, Eye } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Endless Distraction",
    description: "Algorithm-driven feeds, popularity metrics, and constant notifications steal focus from what matters.",
  },
  {
    icon: Target,
    title: "No Academic Focus",
    description: "Existing platforms optimize for engagement, not skill development or meaningful collaboration.",
  },
  {
    icon: Eye,
    title: "No Campus Identity",
    description: "There's no structured, distraction-free digital space built exclusively for college ecosystems.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 md:py-28 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            The Problem with Today's Platforms
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Modern social platforms are designed to maximize engagement — not academic growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm"
            >
              <item.icon className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">{item.title}</h3>
              <p className="text-primary-foreground/60 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
