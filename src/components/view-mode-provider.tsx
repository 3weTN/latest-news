"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ViewMode = "grid" | "list";

type ViewModeContextValue = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("view-mode");
    if (stored === "grid" || stored === "list") {
      setViewModeState(stored);
    }
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("view-mode", mode);
    }
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return ctx;
}
