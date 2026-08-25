import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { features } from "./data/featuresData";

const FeaturesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, offsetWidth } = scrollContainerRef.current;
    const index = Math.round(scrollLeft / (offsetWidth * 0.82));
    setActiveIndex(Math.min(Math.max(index, 0), features.length - 1));
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
    <section id="features" className="py-14 sm:py-20 md:py-28 bg-muted/20 border-t border-border/70 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 sm:mb-4">
            <span>Platform Pillars</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            Six Core Pillars Built for Campus Life
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base md:text-lg max-w-2xl mx-auto">
            Everything students need to connect, build teams, share ideas, and preserve their college legacy.
          </p>
        </motion.div>

        {/* Desktop Grid (md and up) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

        {/* Mobile Horizontal Snap Carousel (< md) */}
        <div className="md:hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-3 px-1 no-scrollbar -mx-4 px-4"
          >
            {features.map((feature, idx) => (
              <div
                key={feature.id}
                className="w-[84vw] max-w-[340px] shrink-0 snap-center bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>

                <div>
                  {feature.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/50">
                      {feature.highlights.map((h) => (
                        <span
                          key={h.text}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground border border-accent/20"
                        >
                          <h.icon className="h-2.5 w-2.5 text-accent" />
                          {h.text}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Pillar {idx + 1} of {features.length}</span>
                    <span className="text-primary font-medium">Swipe &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots pagination */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {features.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => scrollToIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
