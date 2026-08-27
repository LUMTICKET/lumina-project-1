import { Slot } from "expo-router";
import { LumThemeProvider } from "../theme/ThemeContext";
import { AuthProvider } from "../auth/AuthContext";

export default function RootLayout() {
  return (
    <LumThemeProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </LumThemeProvider>
  );
}
