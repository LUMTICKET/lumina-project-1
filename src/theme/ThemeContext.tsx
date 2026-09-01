import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeColors, ThemeMode, getColors } from "./tokens";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveSystemMode = (): ThemeMode => {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
};

export function LumThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(() =>
    system === "dark" || system === "light" ? system : resolveSystemMode()
  );

  /* eslint-disable react-hooks/set-state-in-effect -- synchronize with the native appearance subscription. */
  useEffect(() => {
    const next = system === "dark" || system === "light" ? system : resolveSystemMode();
    setModeState(next);
  }, [system]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setMode = (next: ThemeMode) => {
    setModeState(next);
  };

  const toggle = () => setMode(mode === "light" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: getColors(mode), toggle, setMode }),
    // The callbacks intentionally close over the current mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useLumTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useLumTheme must be used within LumThemeProvider");
  return ctx;
}
