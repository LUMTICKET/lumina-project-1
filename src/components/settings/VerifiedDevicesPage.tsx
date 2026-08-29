import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";

interface Device {
  id: string;
  name: string;
  lastActive: string;
  location: string;
  isCurrent: boolean;
}

interface Props {
  onBack: () => void;
}

export default function VerifiedDevicesPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "iPhone 15 Pro", lastActive: "Active now", location: "Lilongwe, MW", isCurrent: true },
    { id: "2", name: "Chrome on macOS", lastActive: "2 hours ago", location: "Blantyre, MW", isCurrent: false },
    { id: "3", name: "Safari on iPad", lastActive: "3 days ago", location: "Mzuzu, MW", isCurrent: false },
  ]);

  const removeDevice = (id: string) => setDevices((prev) => prev.filter((d) => d.id !== id));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          Verified Devices
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
      >
        <Text style={[styles.hint, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
          These devices are authorized to access your business account. Remove any you do not recognize.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {devices.map((device, i) => (
            <View
              key={device.id}
              style={[
                styles.row,
                i < devices.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.bgAlt }]}>
                <Feather name={device.isCurrent ? "smartphone" : "monitor"} size={18} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2) }}>
                  <Text style={[styles.deviceName, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
                    {device.name}
                  </Text>
                  {device.isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.gold + "20" }]}>
                      <Text style={{ fontSize: 10, color: colors.gold, fontFamily: fontFamilies.bodySemi }}>This device</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.deviceMeta, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                  {device.lastActive} · {device.location}
                </Text>
              </View>
              {!device.isCurrent && (
                <Pressable onPress={() => removeDevice(device.id)} hitSlop={8}>
                  <Feather name="log-out" size={18} color={colors.inkMuted} />
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
  hint: { fontSize: 13, marginBottom: spacing(4), lineHeight: 20 },
  card: { borderRadius: radii.xl, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  iconWrap: { width: 40, height: 40, borderRadius: radii.lg, alignItems: "center", justifyContent: "center" },
  deviceName: { fontSize: 15 },
  deviceMeta: { fontSize: 12, marginTop: 2 },
  currentBadge: { paddingHorizontal: spacing(2), paddingVertical: 2, borderRadius: radii.full },
});