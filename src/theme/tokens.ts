export type ThemeMode = "light" | "dark";

export const palette = {
  black: "#000000",
  white: "#FFFFFF",
  gold: "#83a3df",
  goldDeep: "#5d8fec",
  inkLight: "#FFFFFF",
  inkDark: "#000000",
  mutedDark: "#3d5d9c",
  mutedLight: "#3d5d9c",
  surfaceLight: "#FFFFFF",
  surfaceAltLight: "#F5F5F5",
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
  shadow: string;
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;
}

export const getColors = (mode: ThemeMode): ThemeColors => {
  const isDark = mode === "dark";
  return {
    bg: isDark ? palette.black : palette.white,
    bgAlt: isDark ? palette.black : palette.surfaceAltLight,
    surface: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)",
    surfaceAlt: isDark ? "rgba(255,255,255,0.03)" : "rgba(245,245,245,0.95)",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    ink: isDark ? palette.inkLight : palette.inkDark,
    inkMuted: isDark ? palette.mutedLight : palette.mutedDark,
    black: palette.black,
    white: palette.white,
    gold: palette.gold,
    goldDeep: palette.goldDeep,
    shadow: isDark ? "rgba(0,0,0,0.60)" : "rgba(0,0,0,0.12)",
    glassBg: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.72)",
    glassBorder: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)",
    glassHighlight: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.35)",
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