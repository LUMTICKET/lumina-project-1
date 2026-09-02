import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, palette, radii, spacing } from "../theme/tokens";

export default function ProfilePage() {
  const router = useRouter();
  const { colors } = useLumTheme();
  const { user, logout } = useAuth();

  const initials = useMemo(
    () => (user?.name || user?.email || "U")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join(""),
    [user]
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/(tabs)/home" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityLabel="Back to home" onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={colors.ink} />
          <Text style={[styles.backText, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Home</Text>
        </Pressable>

        <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.gold, borderColor: colors.border }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarInitials, { color: colors.black, fontFamily: fontFamilies.display }]}>{initials}</Text>
            )}
          </View>
          <View style={styles.identity}>
            <Text style={[styles.name, { color: colors.ink, fontFamily: fontFamilies.display }]}>{user?.name || "LumTicket user"}</Text>
            <Text style={[styles.email, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>{user?.email || ""}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>Account</Text>
        <Pressable style={[styles.actionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.actionIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Feather name="user" size={18} color={colors.gold} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={[styles.actionTitle, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Profile</Text>
            <Text style={[styles.actionDetail, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>Manage your personal details</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkMuted} />
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)/settings" as any)} style={[styles.actionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.actionIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Feather name="settings" size={18} color={colors.gold} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={[styles.actionTitle, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Settings</Text>
            <Text style={[styles.actionDetail, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>Manage your LumTicket preferences</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkMuted} />
        </Pressable>

        <Pressable onPress={handleLogout} style={[styles.logoutButton, { borderColor: "#EF4444" }]}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={[styles.logoutText, { fontFamily: fontFamilies.bodySemi }]}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: "100%", maxWidth: 760, alignSelf: "center", padding: spacing(5), paddingBottom: spacing(10), gap: spacing(4) },
  backButton: { flexDirection: "row", alignItems: "center", gap: spacing(2), alignSelf: "flex-start", paddingVertical: spacing(2) },
  backText: { fontSize: 15 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: spacing(4), paddingBottom: spacing(6), borderBottomWidth: 1 },
  avatar: { width: 88, height: 88, borderRadius: radii.full, borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { fontSize: 28 },
  identity: { flex: 1, minWidth: 0 },
  name: { fontSize: 28 },
  email: { fontSize: 14, marginTop: spacing(1) },
  sectionTitle: { fontSize: 22 },
  actionRow: { minHeight: 76, borderWidth: 1, borderRadius: radii.lg, padding: spacing(3), flexDirection: "row", alignItems: "center", gap: spacing(3) },
  actionIcon: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { fontSize: 16 },
  actionDetail: { fontSize: 13, marginTop: 2 },
  logoutButton: { minHeight: 52, borderWidth: 1, borderRadius: radii.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing(2), marginTop: spacing(3) },
  logoutText: { color: "#EF4444", fontSize: 15 },
});