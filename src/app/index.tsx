import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import App from "../components/App";
import Navbar from "../components/Navbar";
import { useLumTheme } from "../theme/ThemeContext";

export default function LandingPage() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Navbar />
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
        <App />
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