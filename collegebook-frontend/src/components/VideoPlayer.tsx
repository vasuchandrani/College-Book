import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, AlertCircle, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId?: string;
  videoUrl?: string;
  posterUrl?: string;
  className?: string;
  title?: string;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const VideoPlayer = ({
  videoId,
  videoUrl,
  posterUrl,
  className,
  title = "Post Video",
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(false);

  // Resolve direct S3 or stream URL
  const rawUrl = videoUrl || videoId || "";
  let resolvedUrl = rawUrl;
  if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://") && !rawUrl.startsWith("blob:")) {
    if (rawUrl.startsWith("posts/videos/")) {
      resolvedUrl = `https://collegebook-media-240704557167-eu-north-1-an.s3.eu-north-1.amazonaws.com/${rawUrl}`;
    }
  }

  const isStreamIframe =
    resolvedUrl.includes("cloudflarestream.com") ||
    resolvedUrl.includes("videodelivery.net") ||
    (Boolean(videoId) && (videoId!.length === 32 || videoId!.includes("-")) && !resolvedUrl.includes("."));

  // IntersectionObserver to auto-play (muted) when scrolled into view and pause when scrolled out
  useEffect(() => {
    if (isStreamIframe || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            video.muted = isMuted;
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => {});
              });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: [0.1, 0.35, 0.7],
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isStreamIframe, resolvedUrl, isMuted]);

  const handleTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video || !duration) return;

      const rect = progressBar.getBoundingClientRect();
      const clickPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = clickPosition / rect.width;
      const targetTime = percentage * duration;

      video.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration]
  );

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSeeking(true);
    handleSeek(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleSeek(moveEvent);
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }

    setShowControlsHint(true);
    setTimeout(() => setShowControlsHint(false), 1200);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!resolvedUrl) {
    return null;
  }

  if (hasError) {
    return (
      <div className={cn("rounded-xl border border-border/40 bg-muted/30 p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2", className)}>
        <AlertCircle className="h-5 w-5 text-destructive/80" />
        <span>Unable to load video playback</span>
        <button
          onClick={() => {
            setHasError(false);
            if (videoRef.current) {
              videoRef.current.load();
            }
          }}
          className="mt-1 text-[11px] font-medium text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isStreamIframe) {
    const streamEmbedUrl =
      resolvedUrl.startsWith("http")
        ? resolvedUrl
        : `https://iframe.videodelivery.net/${videoId}?preload=true&autoplay=true&muted=true`;

    return (
      <div className={cn("relative rounded-xl overflow-hidden bg-black aspect-video", className)}>
        <iframe
          src={streamEmbedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative rounded-xl overflow-hidden bg-black aspect-video group select-none shadow-sm", className)}
      onClick={togglePlayPause}
    >
      <video
        ref={videoRef}
        src={resolvedUrl}
        poster={posterUrl}
        autoPlay
        muted={isMuted}
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-contain bg-black cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      {/* Floating Center Play/Pause Feedback on click */}
      {showControlsHint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity">
          <div className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white shadow-xl animate-in fade-in zoom-in duration-200">
            {isPlaying ? <Play className="h-6 w-6 fill-current ml-0.5" /> : <Pause className="h-6 w-6 fill-current" />}
          </div>
        </div>
      )}

      {/* Big Play Button when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center transition-all group-hover:bg-black/35 pointer-events-none">
          <div className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Control Overlay Bar (Gradient backdrop for readability) */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 pt-8 pb-2.5 px-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col gap-1.5 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Interactive Progress Bar */}
        <div
          ref={progressBarRef}
          onMouseDown={handleProgressMouseDown}
          className="group/progress relative h-3 flex items-center cursor-pointer select-none"
        >
          {/* Background Track */}
          <div className="w-full h-1 group-hover/progress:h-1.5 rounded-full bg-white/25 transition-all overflow-hidden">
            {/* Filled Progress */}
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Draggable Thumb */}
          <div
            className="absolute h-3 w-3 rounded-full bg-white shadow-md border border-black/20 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom Metadata & Controls Row */}
        <div className="flex items-center justify-between text-xs text-white">
          {/* Video Duration / Current Time */}
          <div className="flex items-center gap-1 font-mono text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/40">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Mute/Unmute Circle Button: Black background + White symbol only */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            className="h-8 w-8 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md text-white border border-white/15 flex items-center justify-center shadow-lg transition-all active:scale-90"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
