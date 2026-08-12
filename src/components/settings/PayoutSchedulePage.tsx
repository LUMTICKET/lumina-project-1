import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";
import { PayoutMethod } from "./types";

interface Props {
  onBack: () => void;
}

export default function PayoutSchedulePage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [methods, setMethods] = useState<PayoutMethod[]>([
    { id: "1", type: "mobile_money", name: "TNM Mpamba", account: "+265 88X XXX XXX", isDefault: true },
  ]);

  const [accName, setAccName] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [accType, setAccType] = useState<"bank" | "mobile_money">("mobile_money");

  const addMethod = () => {
    if (!accName.trim() || !accNumber.trim()) return;
    setMethods((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), type: accType, name: accName, account: accNumber, isDefault: false },
    ]);
    setAccName(""); setAccNumber("");
  };

  const setDefault = (id: string) =>
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));

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
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>Payout Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
      >
        {/* Frequency */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Payout Frequency</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, flexDirection: "row", gap: spacing(2) }]}>
          {(["daily", "weekly", "monthly"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFrequency(f)}
              style={[
                styles.freqBtn,
                {
                  backgroundColor: frequency === f ? colors.gold : "transparent",
                  borderColor: frequency === f ? colors.gold : colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 14, color: frequency === f ? colors.black : colors.ink, fontFamily: fontFamilies.bodySemi, textTransform: "capitalize" }}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Methods */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>Payout Methods</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, gap: spacing(3) }]}>
          {methods.map((method) => (
            <View key={method.id} style={[styles.methodRow, { borderColor: colors.border }]}>
              <View style={[styles.methodIcon, { backgroundColor: colors.bgAlt }]}>
                <Feather name={method.type === "bank" ? "globe" : "smartphone"} size={18} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>{method.name}</Text>
                <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body, fontSize: 12, marginTop: 2 }}>{method.account}</Text>
              </View>
              {method.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: colors.gold + "20" }]}>
                  <Text style={{ fontSize: 11, color: colors.gold, fontFamily: fontFamilies.bodySemi }}>Default</Text>
                </View>
              ) : (
                <Pressable onPress={() => setDefault(method.id)}>
                  <Text style={{ fontSize: 12, color: colors.inkMuted, fontFamily: fontFamilies.bodySemi }}>Set default</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Add method */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>Add Payout Method</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, gap: spacing(3) }]}>
          <View style={{ flexDirection: "row", gap: spacing(2) }}>
            {(["mobile_money", "bank"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setAccType(t)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: accType === t ? colors.gold : "transparent",
                    borderColor: accType === t ? colors.gold : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 13, color: accType === t ? colors.black : colors.ink, fontFamily: fontFamilies.bodySemi }}>
                  {t === "bank" ? "Bank Account" : "Mobile Money"}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            placeholder={accType === "bank" ? "Bank name" : "Provider name (TNM / Airtel)"}
            placeholderTextColor={colors.inkMuted}
            value={accName}
            onChangeText={setAccName}
            style={[styles.input, inputBase]}
          />
          <TextInput
            placeholder={accType === "bank" ? "Account number" : "Phone number"}
            placeholderTextColor={colors.inkMuted}
            value={accNumber}
            onChangeText={setAccNumber}
            style={[styles.input, inputBase]}
          />
          <Pressable onPress={addMethod} style={[styles.actionBtn, { backgroundColor: colors.gold }]}>
            <Text style={{ color: colors.black, fontFamily: fontFamilies.bodySemi }}>Add Method</Text>
          </Pressable>
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
  sectionLabel: { fontSize: 14, marginBottom: spacing(2), marginTop: spacing(2) },
  card: { borderRadius: radii.xl, padding: spacing(4) },
  freqBtn: { flex: 1, paddingVertical: spacing(3), borderRadius: radii.lg, borderWidth: 1.5, alignItems: "center" },
  methodRow: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingVertical: spacing(2), borderBottomWidth: 1 },
  methodIcon: { width: 40, height: 40, borderRadius: radii.lg, alignItems: "center", justifyContent: "center" },
  defaultBadge: { paddingHorizontal: spacing(2.5), paddingVertical: spacing(1), borderRadius: radii.full },
  typeChip: { flex: 1, paddingVertical: spacing(2.5), borderRadius: radii.lg, borderWidth: 1.5, alignItems: "center" },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    fontSize: 14,
  },
  actionBtn: { paddingVertical: spacing(3), borderRadius: radii.full, alignItems: "center", marginTop: spacing(2) },
});