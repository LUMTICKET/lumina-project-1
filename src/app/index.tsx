import { Platform, ScrollView, useWindowDimensions, View } from "react-native";
import BottomTabBar from "../components/BottomTabBar";
import FeaturesStrip from "../components/FeaturesStrip";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import { useLumTheme } from "../theme/ThemeContext";

export default function LandingPage() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  // Native apps always get the bottom tab bar; on web it only shows up once
  // the viewport is phone-sized, so a resized browser window mirrors the app.
  const isMobile = Platform.OS !== "web" || width < 760;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: isMobile ? 100 : 0 }}
      >
        <Navbar />
        <Hero />
        <FeaturesStrip />
        <Footer />
      </ScrollView>
    </View>
  );
}
