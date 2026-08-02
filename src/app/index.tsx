import { useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import AuthModal from "../components/AuthModal";
import Create from "../components/Create";
import Feeds from "../components/Feeds";
import HomePage from "../components/HomePage";
import Messaging from "../components/Messaging";
import Navbar from "../components/Navbar";
import SearchPage from "../components/SearchPage";
import { useLumTheme } from "../theme/ThemeContext";

import Settings from "../components/Settings";

type RouteName = "Home" | "Search" | "Create" | "Messaging" | "Feeds" | "Settings";
type PageProps = {
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
};

const ROUTES: Record<RouteName, React.ComponentType<PageProps>> = {
  Home: HomePage,
  Search: SearchPage,
  Create: Create,
  Messaging: Messaging,
  Feeds: Feeds,
  Settings: Settings,
};

export default function LandingPage() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [currentRoute, setCurrentRoute] = useState<RouteName>("Home");
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const PageComponent = ROUTES[currentRoute];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingLeft: isDesktop ? 72 : 0,
            paddingBottom: isDesktop ? 0 : 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageComponent
          onOpenAuth={() => setAuthModalVisible(true)}
          onOpenSettings={() => setCurrentRoute("Settings")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});