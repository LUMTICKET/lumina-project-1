export type ThemeMode = "light" | "dark";

export const palette = {
  black: "#061522",
  white: "#F8FAFC",
  navy: "#0B1F3A",
  navyDeep: "#081B30",
  orange: "#F59E0B",
  orangeDeep: "#E67E22",
  emerald: "#10B981",
  emeraldDeep: "#0F766E",
  inkLight: "#EAF4FF",
  inkDark: "#0B1F3A",
  mutedDark: "#7A93B5",
  mutedLight: "#A9BEDB",
  surfaceLight: "#F8FAFC",
  surfaceAltLight: "#EAF7F3",
};

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  ink: string;
  inkMuted: string;
  black: string;
  white: string;
  gold: string;
  goldDeep: string;
  emerald: string;
  emeraldDeep: string;
  shadow: string;
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;
}

export const getColors = (mode: ThemeMode): ThemeColors => {
  const isDark = true;
  return {
    bg: isDark ? palette.navy : palette.white,
    bgAlt: isDark ? palette.navyDeep : palette.surfaceAltLight,
    surface: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)",
    surfaceAlt: isDark ? "rgba(16,185,129,0.08)" : "rgba(245,245,245,0.95)",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    ink: isDark ? palette.inkLight : palette.inkDark,
    inkMuted: isDark ? palette.mutedLight : palette.mutedDark,
    black: palette.black,
    white: palette.white,
    gold: palette.orange,
    goldDeep: palette.emerald,
    emerald: palette.emerald,
    emeraldDeep: palette.emeraldDeep,
    shadow: isDark ? "rgba(2,6,23,0.68)" : "rgba(0,0,0,0.12)",
    glassBg: isDark ? "rgba(7,25,45,0.74)" : "rgba(255,255,255,0.72)",
    glassBorder: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)",
    glassHighlight: isDark ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.35)",
  };
};

export const fontFamilies = {
  display: "Inter-Bold",
  displayItalic: "Inter-BoldItalic",
  body: "Inter-Regular",
  bodySemi: "Inter-SemiBold",
  bodyMedium: "Inter-Medium",
};

export const spacing = (n: number) => n * 4;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
};