export type ThemeMode = "light" | "dark";

export const palette = {
  black: "#040521",
  white: "#F8FAFC",
  navy: "#081D56",
  navyDeep: "#040521",
  orange: "#62AAE5",
  orangeDeep: "#081D56",
  emerald: "#62AAE5",
  emeraldDeep: "#081D56",
  inkLight: "#EAF4FF",
  inkDark: "#081D56",
  mutedDark: "#7A93B5",
  mutedLight: "#A9BEDB",
  surfaceLight: "#F8FAFC",
  surfaceAltLight: "#EAF4FF",
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
  brandGradient: [string, string, string, string];
}

export const getColors = (mode: ThemeMode): ThemeColors => {
  const isDark = mode === "dark";
  return {
    bg: isDark ? palette.navy : palette.white,
    bgAlt: isDark ? palette.navyDeep : palette.surfaceAltLight,
    surface: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)",
    surfaceAlt: isDark ? "rgba(98,170,229,0.08)" : "rgba(245,245,245,0.95)",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    ink: isDark ? palette.inkLight : palette.inkDark,
    inkMuted: isDark ? palette.mutedLight : palette.mutedDark,
    black: palette.black,
    white: palette.white,
    gold: palette.orange,
    goldDeep: palette.orangeDeep,
    emerald: palette.emerald,
    emeraldDeep: palette.emeraldDeep,
    shadow: isDark ? "rgba(2,6,23,0.68)" : "rgba(0,0,0,0.12)",
    glassBg: isDark ? "rgba(7,25,45,0.74)" : "rgba(255,255,255,0.72)",
    glassBorder: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)",
    glassHighlight: isDark ? "rgba(245,154,47,0.12)" : "rgba(255,255,255,0.35)",
    brandGradient: ["#040521", "#081D56", "#62AAE5", "#F59A2F"],
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