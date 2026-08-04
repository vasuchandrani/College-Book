import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  className?: string;
  maxHeight?: string;
}

const ImageCarousel = ({ images, className, maxHeight = "max-h-80" }: ImageCarouselProps) => {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        <img src={images[0]} alt="Post" className={cn("w-full h-auto object-cover rounded-lg", maxHeight)} />
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden group", className)}>
      <img src={images[current]} alt={`Slide ${current + 1}`} className={cn("w-full h-auto object-cover rounded-lg transition-opacity", maxHeight)} />

      {/* Navigation arrows */}
      {current > 0 && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur shadow-md"
          onClick={(e) => { e.stopPropagation(); setCurrent(c => c - 1); }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {current < images.length - 1 && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur shadow-md"
          onClick={(e) => { e.stopPropagation(); setCurrent(c => c + 1); }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === current ? "w-4 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50"
            )}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
