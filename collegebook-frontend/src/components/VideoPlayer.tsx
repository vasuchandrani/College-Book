import { useState } from "react";
import { Play, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId?: string;
  videoUrl?: string;
  posterUrl?: string;
  className?: string;
  title?: string;
}

export const VideoPlayer = ({
  videoId,
  videoUrl,
  posterUrl,
  className,
  title = "Post Video",
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Extract video ID or determine the stream embed URL
  let streamEmbedUrl = "";
  if (videoId) {
    streamEmbedUrl = `https://iframe.videodelivery.net/${videoId}?preload=true&autoplay=true`;
  } else if (videoUrl) {
    if (videoUrl.includes("cloudflarestream.com") || videoUrl.includes("videodelivery.net")) {
      streamEmbedUrl = videoUrl;
    } else if (videoUrl.startsWith("http")) {
      // Direct video URL (MP4 / HLS / YouTube fallback)
      streamEmbedUrl = videoUrl;
    } else {
      streamEmbedUrl = `https://iframe.videodelivery.net/${videoUrl}?preload=true&autoplay=true`;
    }
  }

  if (!streamEmbedUrl) {
    return null;
  }

  if (hasError) {
    return (
      <div className={cn("rounded-lg bg-muted/40 p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2", className)}>
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span>Unable to load video playback</span>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-black aspect-video group", className)}>
      {!isPlaying ? (
        <div
          className="relative w-full h-full cursor-pointer flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsPlaying(true)}
        >
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity"
            />
          )}
          <div className="relative z-10 h-12 w-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
          <div className="absolute bottom-2 left-3 text-[11px] text-white/80 font-medium">
            Click to play
          </div>
        </div>
      ) : (
        <iframe
          src={streamEmbedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
