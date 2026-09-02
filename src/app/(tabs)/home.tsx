import Navbar from "@/components/Navbar";
import { useLumTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import HomePage from "@/components/HomePage";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

type TabRoute = "Home" | "BuyTicket" | "Create" | "Messaging" | "Feeds" | "Settings";

const ROUTE_MAP: Record<TabRoute, string> = {
  Home: "/(tabs)/home",
  BuyTicket: "/(tabs)/buyticket",
  Create: "/(tabs)/create",
  Messaging: "/(tabs)/messaging",
  Feeds: "/(tabs)/feeds",
  Settings: "/(tabs)/settings",
};

export default function HomeTabScreen() {
  const router = useRouter();
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const handleNavigate = (route: TabRoute) => {
    router.push(ROUTE_MAP[route] as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Navbar currentRoute="Home" onNavigate={handleNavigate} />

      <View
        style={[
          styles.content,
          {
            paddingLeft: isDesktop ? 92 : 0,
            paddingBottom: isDesktop ? 0 : 60,
          },
        ]}
      >
        <HomePage />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
  },
});
