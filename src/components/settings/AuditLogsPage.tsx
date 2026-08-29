import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";
import { AuditLog } from "./types";

interface Props {
  onBack: () => void;
}

export default function AuditLogsPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [logs] = useState<AuditLog[]>([
    { id: "1", action: "Published ticket 'Captain Bus Express'", user: "You", timestamp: "2026-08-12 14:30", ip: "102.67.123.45" },
    { id: "2", action: "Updated business profile", user: "Grace Mhango", timestamp: "2026-08-11 09:15", ip: "102.67.98.12" },
    { id: "3", action: "Added venue 'Bingu Stadium'", user: "You", timestamp: "2026-08-10 16:45", ip: "102.67.123.45" },
    { id: "4", action: "Changed payout schedule to Weekly", user: "You", timestamp: "2026-08-09 11:00", ip: "102.67.123.45" },
    { id: "5", action: "Team invite sent to john@business.mw", user: "Grace Mhango", timestamp: "2026-08-08 13:22", ip: "102.67.98.12" },
  ]);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>Audit Logs</Text>
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
          {logs.map((log, i) => (
            <View
              key={log.id}
              style={[
                styles.row,
                i < logs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: colors.gold }]} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 16 }}>{log.action}</Text>
                <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body, fontSize: 14, marginTop: 4 }}>
                  {log.user} · {log.timestamp} {log.ip ? `· ${log.ip}` : ""}
                </Text>
              </View>
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
    alignItems: "flex-start",
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});