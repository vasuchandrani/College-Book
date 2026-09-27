import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

/** Reusable sentinel that properly manages IntersectionObserver lifecycle */
export function PaginationSentinel({ onIntersect, loading }: { onIntersect: () => void; loading: boolean }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-4">
      {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
    </div>
  );
}
