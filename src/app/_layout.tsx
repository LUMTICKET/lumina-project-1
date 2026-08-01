import { Slot } from "expo-router";
import { LumThemeProvider } from "../theme/ThemeContext";

export default function RootLayout() {
  return (
    <LumThemeProvider>
      <Slot />
    </LumThemeProvider>
  );
}