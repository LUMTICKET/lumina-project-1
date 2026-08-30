import { useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import AuthModal from "../components/AuthModal";
import Create from "../components/Create";
import Feeds from "../components/Feeds";
import HomePage from "../components/HomePage";
import Messaging from "../components/Messaging";
import Navbar from "../components/Navbar";
import SearchPage from "../components/SearchPage";
import Settings from "../components/Settings";
import { useLumTheme } from "../theme/ThemeContext";

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

      {/* Changed from ScrollView → View to avoid gesture conflicts with HomePage's horizontal swipe */}
      <View
        style={[
          styles.content,
          {
            paddingLeft: isDesktop ? 92 : 0,
            paddingBottom: isDesktop ? 0 : 60,
          },
        ]}
      >
        <PageComponent
          onOpenAuth={() => setAuthModalVisible(true)}
          onOpenSettings={() => setCurrentRoute("Settings")}
        />
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