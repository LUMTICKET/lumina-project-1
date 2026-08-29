import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";
import { TeamMember } from "./types";

interface Props {
  onBack: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "#E11D48",
  admin: "#2563EB",
  operator: "#059669",
  viewer: "#6B7280",
};

export default function TeamRolesPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "You", email: "owner@business.mw", role: "owner", joinedAt: "2025-01-10" },
    { id: "2", name: "Grace Mhango", email: "grace@business.mw", role: "admin", joinedAt: "2025-03-15" },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "operator" | "viewer">("operator");

  const addMember = () => {
    if (!name.trim() || !email.trim()) return;
    setMembers((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), name, email, role, joinedAt: new Date().toISOString().split("T")[0] },
    ]);
    setName(""); setEmail(""); setRole("operator");
  };

  const removeMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const inputBase = {
    color: colors.ink,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    fontFamily: fontFamilies.body,
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>Team Roles</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
      >
        {/* Add member */}
        <View style={[styles.card, { backgroundColor: colors.surface, gap: spacing(3) }]}>
          <Text style={[styles.label, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Invite Team Member</Text>
          <TextInput placeholder="Full name" placeholderTextColor={colors.inkMuted} value={name} onChangeText={setName} style={[styles.input, inputBase]} />
          <TextInput placeholder="Email address" placeholderTextColor={colors.inkMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={[styles.input, inputBase]} />
          <View style={styles.roleRow}>
            {(["admin", "operator", "viewer"] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: role === r ? colors.gold : "transparent",
                    borderColor: role === r ? colors.gold : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, color: role === r ? colors.black : colors.ink, fontFamily: fontFamilies.bodySemi }}>
                  {ROLE_LABELS[r]}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={addMember} style={[styles.actionBtn, { backgroundColor: colors.gold }]}>
            <Text style={{ color: colors.black, fontFamily: fontFamilies.bodySemi, fontSize: 16 }}>Send Invite</Text>
          </Pressable>
        </View>

        {/* List */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>Team Members</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, gap: 0 }]}>
          {members.map((member, i) => (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                i < members.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.bgAlt }]}>
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>{member.name}</Text>
                <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body, fontSize: 13, marginTop: 2 }}>{member.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[member.role] + "20" }]}>
                <Text style={{ fontSize: 12, color: ROLE_COLORS[member.role], fontFamily: fontFamilies.bodySemi }}>
                  {ROLE_LABELS[member.role]}
                </Text>
              </View>
              {member.role !== "owner" && (
                <Pressable onPress={() => removeMember(member.id)} hitSlop={8} style={{ marginLeft: spacing(3) }}>
                  <Feather name="trash-2" size={18} color={colors.inkMuted} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  card: { borderRadius: radii.xl, padding: spacing(4) },
  label: { fontSize: 15, marginBottom: spacing(1) },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    fontSize: 15,
  },

  roleRow: { flexDirection: "row", gap: spacing(2), marginTop: spacing(1) },
  roleChip: { flex: 1, paddingVertical: spacing(2), borderRadius: radii.lg, borderWidth: 1.5, alignItems: "center" },

  actionBtn: { paddingVertical: spacing(3.5), borderRadius: radii.full, alignItems: "center", marginTop: spacing(2) },

  sectionLabel: { fontSize: 15, marginBottom: spacing(2) },

  memberRow: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingVertical: spacing(3.5), paddingHorizontal: spacing(4) },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  roleBadge: { paddingHorizontal: spacing(2.5), paddingVertical: spacing(1), borderRadius: radii.full },
});