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

interface Props {
  onBack: () => void;
}

interface PayMethod {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  enabled: boolean;
}

/* ------------------------------------------------------------------ */
// Toggle — same as Settings.tsx
/* ------------------------------------------------------------------ */
function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors } = useLumTheme();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? colors.gold : colors.border },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          {
            backgroundColor: colors.white,
            transform: [{ translateX: value ? 20 : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

export default function PaymentMethodsPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [methods, setMethods] = useState<PayMethod[]>([
    { id: "tnm", name: "TNM Mpamba", icon: "smartphone", enabled: true },
    { id: "airtel", name: "Airtel Money", icon: "smartphone", enabled: true },
    { id: "card", name: "Credit / Debit Card", icon: "credit-card", enabled: true },
    { id: "bank", name: "Bank Transfer", icon: "globe", enabled: false },
  ]);

  const toggle = (id: string) =>
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          Accepted Payment Methods
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
        <Text
          style={[
            styles.hint,
            { color: colors.inkMuted, fontFamily: fontFamilies.body, marginBottom: spacing(4) },
          ]}
        >
          Choose which payment methods your customers can use when buying tickets from you.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {methods.map((method, i) => (
            <View
              key={method.id}
              style={[
                styles.row,
                i < methods.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.bgAlt }]}>
                <Feather name={method.icon} size={20} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.methodName,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  {method.name}
                </Text>
                <Text
                  style={[
                    styles.methodStatus,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  {method.enabled ? "Active" : "Disabled"}
                </Text>
              </View>
              <Toggle value={method.enabled} onValueChange={() => toggle(method.id)} />
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

  hint: { fontSize: 15, lineHeight: 22 },

  card: { borderRadius: radii.xl, overflow: "hidden" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  methodName: { fontSize: 15 },
  methodStatus: { fontSize: 13, marginTop: 2 },

  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});