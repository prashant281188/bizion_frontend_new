"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

function TopLoadingBarInner() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [completing, setCompleting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);
  const isStarted = useRef(false);
  const completedEarly = useRef(false); // pathname changed before start() ran

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const start = () => {
    if (completedEarly.current) {
      // Navigation already finished before the bar could show — cancel silently
      completedEarly.current = false;
      return;
    }
    clearTimers();
    isStarted.current = true;
    setCompleting(false);
    setVisible(true);
    setWidth(0);

    let w = 0;
    intervalRef.current = setInterval(() => {
      w = w + (90 - w) * 0.12;
      setWidth(Math.min(w, 90));
    }, 180);
  };

  const complete = () => {
    if (!isStarted.current) {
      // start() hasn't run yet (race condition on fast/cached routes)
      // Mark it so start() knows to cancel itself when it fires
      completedEarly.current = true;
      return;
    }
    isStarted.current = false;
    completedEarly.current = false;
    clearTimers();
    setCompleting(true);
    setWidth(100);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
      setCompleting(false);
    }, 450);
  };

  // Intercept pushState (Link clicks, router.push) and popstate (browser back/forward)
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);

    window.history.pushState = function (...args) {
      const result = originalPushState(...args);
      // Defer setState out of React's synchronous insertion phase (React 19)
      queueMicrotask(start);
      return result;
    };

    const onPopState = () => queueMicrotask(start);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Complete when the new page has fully rendered
  // Only watches pathname — searchParams changes (filter updates) do NOT trigger this
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2.5px] bg-amber-500 pointer-events-none"
      style={{
        width: `${width}%`,
        transition: completing
          ? "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
          : "width 0.18s ease-out",
        boxShadow: "0 0 8px 1px rgba(245,158,11,0.6)",
      }}
    >
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 h-[5px] w-[80px] rounded-full"
        style={{
          background: "linear-gradient(to left, rgba(255,255,255,0.9), transparent)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

export function TopLoadingBar() {
  return (
    <Suspense>
      <TopLoadingBarInner />
    </Suspense>
  );
}
