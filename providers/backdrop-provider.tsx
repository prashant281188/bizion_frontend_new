"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface BackdropContextValue {
  show: (message?: string) => void;
  hide: () => void;
}

const BackdropContext = createContext<BackdropContextValue | null>(null);

export function BackdropProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  const show = useCallback((message = "Processing…") => {
    setState({ visible: true, message });
  }, []);

  const hide = useCallback(() => {
    setState({ visible: false, message: "" });
  }, []);

  return (
    <BackdropContext.Provider value={{ show, hide }}>
      {children}
      {state.visible && (
        <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-xl ring-1 ring-black/5">
            {/* Spinner */}
            <div className="h-9 w-9 rounded-full border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">{state.message}</p>
          </div>
        </div>
      )}
    </BackdropContext.Provider>
  );
}

export function useBackdrop() {
  const ctx = useContext(BackdropContext);
  if (!ctx) throw new Error("useBackdrop must be used inside BackdropProvider");
  return ctx;
}
