import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";

interface Props {
  onBack: () => void;
}

export default function ApprovalWorkflowPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [settings, setSettings] = useState({
    publishTickets: true,
    priceChanges: true,
    tierChanges: false,
    payoutRequests: true,
    teamInvites: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: "publishTickets" as const, label: "Publish new tickets", desc: "Require approval before a ticket goes live" },
    { key: "priceChanges" as const, label: "Price changes", desc: "Require approval for tier price updates" },
    { key: "tierChanges" as const, label: "Tier modifications", desc: "Require approval for adding or removing tiers" },
    { key: "payoutRequests" as const, label: "Payout requests", desc: "Require approval before processing withdrawals" },
    { key: "teamInvites" as const, label: "Team invites", desc: "Require approval for new team member invites" },
  ];

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>Approval Workflow</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {items.map((item, i) => (
            <View
              key={item.key}
              style={[
                styles.row,
                i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1, paddingRight: spacing(4) }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>{item.label}</Text>
                <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body, fontSize: 12, marginTop: 2 }}>{item.desc}</Text>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor={colors.white}
              />
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
  card: { borderRadius: radii.xl, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
});