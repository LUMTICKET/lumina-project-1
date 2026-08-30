import Feeds from "@/components/Feeds";
import Navbar from "@/components/Navbar";
import { useLumTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";

type TabRoute = "Home" | "Search" | "Create" | "Messaging" | "Feeds" | "Settings";

const ROUTE_MAP: Record<TabRoute, string> = {
  Home: "/(tabs)/home",
  Search: "/(tabs)/search",
  Create: "/(tabs)/create",
  Messaging: "/(tabs)/messaging",
  Feeds: "/(tabs)/feeds",
  Settings: "/(tabs)/settings",
};

export default function FeedsTabScreen() {
  const router = useRouter();
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const handleNavigate = (route: TabRoute) => {
    router.push(ROUTE_MAP[route] as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Navbar currentRoute="Feeds" onNavigate={handleNavigate} />
      <View
        style={[
          styles.content,
          {
            paddingLeft: isDesktop ? 92 : 0,
            paddingBottom: isDesktop ? 0 : 60,
          },
        ]}
      >
        <Feeds />
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
  },
});
