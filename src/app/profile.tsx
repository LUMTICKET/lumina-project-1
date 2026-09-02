import ProfilePage from "@/components/ProfilePage";
import { useLumTheme } from "@/theme/ThemeContext";
import { StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { colors } = useLumTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ProfilePage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});