import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";
import { BusinessHour } from "./types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Props {
  onBack: () => void;
}

export default function BusinessHoursPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [hours, setHours] = useState<BusinessHour[]>(
    DAYS.map((day) => ({ day, open: "08:00", close: "17:00", isOpen: day !== "Sunday" }))
  );

  const updateHour = (index: number, key: keyof BusinessHour, value: any) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [key]: value } : h)));
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>Business Hours</Text>
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
          {hours.map((h, i) => (
            <View key={h.day} style={[styles.row, i < hours.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Switch
                  value={h.isOpen}
                  onValueChange={(v) => updateHour(i, "isOpen", v)}
                  trackColor={{ false: colors.border, true: colors.gold }}
                  thumbColor={colors.white}
                  style={{ marginRight: spacing(3) }}
                />
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 14, width: 90 }}>{h.day}</Text>
              </View>
              {h.isOpen ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2) }}>
                  <TextInput
                    value={h.open}
                    onChangeText={(v) => updateHour(i, "open", v)}
                    style={[styles.timeInput, { color: colors.ink, backgroundColor: colors.bg, borderColor: colors.border, fontFamily: fontFamilies.body }]}
                  />
                  <Text style={{ color: colors.inkMuted }}>to</Text>
                  <TextInput
                    value={h.close}
                    onChangeText={(v) => updateHour(i, "close", v)}
                    style={[styles.timeInput, { color: colors.ink, backgroundColor: colors.bg, borderColor: colors.border, fontFamily: fontFamilies.body }]}
                  />
                </View>
              ) : (
                <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body }}>Closed</Text>
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
  card: { borderRadius: radii.xl, padding: spacing(2), gap: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
  },
  timeInput: {
    width: 70,
    height: 36,
    borderWidth: 1,
    borderRadius: radii.lg,
    textAlign: "center",
    fontSize: 13,
  },
});