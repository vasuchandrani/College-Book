import { useRef, useCallback, useEffect } from "react";

interface PendingToggle {
  timer: NodeJS.Timeout;
  abortController?: AbortController;
  finalTargetState: boolean;
}

/**
 * Custom hook providing instant 0ms optimistic UI updates combined with
 * trailing debounce and AbortController request cancellation.
 *
 * If a user clicks Like/Save/Star 10 times rapidly, the UI flips instantly on each click,
 * but only a single network request for the final net state is dispatched to the server.
 */
export function useDebouncedToggle(debounceDelayMs: number = 400) {
  const pendingMapRef = useRef<Map<string | number, PendingToggle>>(new Map());

  // Clean up all pending timers and cancel in-flight requests on unmount
  useEffect(() => {
    const currentMap = pendingMapRef.current;
    return () => {
      currentMap.forEach((pending) => {
        clearTimeout(pending.timer);
        if (pending.abortController) {
          pending.abortController.abort();
        }
      });
      currentMap.clear();
    };
  }, []);

  const triggerToggle = useCallback(
    (
      id: string | number,
      currentState: boolean,
      updateOptimisticState: (newActive: boolean) => void,
      apiCall: (signal?: AbortSignal) => Promise<unknown>
    ) => {
      const key = id;
      const existing = pendingMapRef.current.get(key);

      // Determine next state from previous pending state or initial state
      const nextActive = existing ? !existing.finalTargetState : !currentState;

      // 1. Instant 0ms optimistic UI feedback
      updateOptimisticState(nextActive);

      // 2. Cancel existing timer and abort prior in-flight request
      if (existing) {
        clearTimeout(existing.timer);
        if (existing.abortController) {
          existing.abortController.abort();
        }
      }

      const controller = new AbortController();

      // 3. Set trailing debounce timer (default 400ms)
      const timer = setTimeout(async () => {
        try {
          await apiCall(controller.signal);
        } catch (err: any) {
          if (err?.name !== "AbortError" && !controller.signal.aborted) {
            console.error("Debounced toggle sync error:", err);
            // Revert optimistic update on hard error
            updateOptimisticState(!nextActive);
          }
        } finally {
          pendingMapRef.current.delete(key);
        }
      }, debounceDelayMs);

      pendingMapRef.current.set(key, {
        timer,
        abortController: controller,
        finalTargetState: nextActive,
      });
    },
    [debounceDelayMs]
  );

  return { triggerToggle };
}
