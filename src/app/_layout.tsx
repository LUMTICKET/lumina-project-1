import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { LumThemeProvider } from "../theme/ThemeContext";

export default function RootLayout() {
  return (
    <LumThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </LumThemeProvider>
  );
}