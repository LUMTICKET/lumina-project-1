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

const resolveSystemMode = (): ThemeMode => "dark";

export function LumThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(() =>
    system === "dark" || system === "light" ? "dark" : resolveSystemMode()
  );

  useEffect(() => {
    setModeState("dark");
  }, [system]);

  const setMode = (next: ThemeMode) => {
    if (next === "dark") {
      setModeState("dark");
    }
  };

  const toggle = () => setMode("dark");

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: getColors(mode), toggle, setMode }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useLumTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useLumTheme must be used within LumThemeProvider");
  return ctx;
}