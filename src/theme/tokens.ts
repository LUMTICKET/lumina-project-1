// Lumticket design tokens.
// Palette idea: "golden hour rail travel" — warm ivory/espresso by day,
// deep charcoal ember by night, gold as the one constant light source.

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
  gold: string;
  goldSoft: string;
  goldDeep: string;
  sunrise: string;
  rail: string;
  border: string;
  overlay: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  bg: "#FBF6EA",
  bgAlt: "#F2E9D4",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF9EC",
  ink: "#1C1509",
  inkMuted: "#6E5F45",
  gold: "#E3A231",
  goldSoft: "#F3D48A",
  goldDeep: "#B87415",
  sunrise: "#F17A3D",
  rail: "#2E6B4E",
  border: "rgba(28,21,9,0.10)",
  overlay: "rgba(24,17,7,0.55)",
  shadow: "rgba(120,84,20,0.18)",
};

export const darkColors: ThemeColors = {
  bg: "#120E08",
  bgAlt: "#1A140A",
  surface: "#1E170D",
  surfaceAlt: "#251C10",
  ink: "#F6EEDD",
  inkMuted: "#B7A587",
  gold: "#F0B93E",
  goldSoft: "#7A5A22",
  goldDeep: "#FFCF66",
  sunrise: "#FF9152",
  rail: "#4E9E76",
  border: "rgba(246,238,221,0.10)",
  overlay: "rgba(6,4,2,0.65)",
  shadow: "rgba(0,0,0,0.5)",
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const fontFamilies = {
  display: "Fraunces_600SemiBold",
  displayItalic: "Fraunces_500Medium_Italic",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === "light" ? lightColors : darkColors;
}
