import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

function Field({
  label,
  value,
  onChangeText,
  icon,
  flexBasis,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: keyof typeof Feather.glyphMap;
  flexBasis: number;
}) {
  const { colors } = useLumTheme();
  return (
    <View style={{ flexGrow: 1, flexBasis, minWidth: 140 }}>
      <Text style={[styles.fieldLabel, { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi }]}>
        {label}
      </Text>
      <View style={[styles.fieldBox, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
        <Feather name={icon} size={14} color={colors.inkMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[styles.fieldInput, { color: colors.ink, fontFamily: fontFamilies.bodyMedium }]}
          placeholderTextColor={colors.inkMuted}
        />
      </View>
    </View>
  );
}

export default function SearchCard() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const stacked = width < 760;

  const [from, setFrom] = useState("Kaduna");
  const [to, setTo] = useState("Abuja");
  const [date, setDate] = useState("Today, 27 Oct");
  const [time, setTime] = useState("17:00");

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.row, stacked && styles.rowStacked]}>
        <Field label="From" value={from} onChangeText={setFrom} icon="map-pin" flexBasis={160} />

        <Pressable
          onPress={swap}
          style={[styles.swapBtn, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}
        >
          <Feather name="repeat" size={15} color={colors.goldDeep} />
        </Pressable>

        <Field label="To" value={to} onChangeText={setTo} icon="map-pin" flexBasis={160} />
        <Field label="Date" value={date} onChangeText={setDate} icon="calendar" flexBasis={160} />
        <Field label="Time" value={time} onChangeText={setTime} icon="clock" flexBasis={110} />

        <Pressable style={[styles.searchBtn, { backgroundColor: colors.gold }]}>
          <Text style={[styles.searchBtnText, { color: colors.bg, fontFamily: fontFamilies.bodySemi }]}>
            Search
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.advanced}>
        <Feather name="sliders" size={12} color={colors.inkMuted} />
        <Text style={[styles.advancedText, { color: colors.inkMuted, fontFamily: fontFamilies.bodyMedium }]}>
          Advanced options
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing(5),
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing(3),
    flexWrap: "wrap",
  },
  rowStacked: { flexDirection: "column", alignItems: "stretch" },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  fieldInput: { flex: 1, fontSize: 14, outlineStyle: "none" } as any,
  swapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  searchBtn: {
    height: 46,
    paddingHorizontal: spacing(7),
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: { fontSize: 14, letterSpacing: 0.4 },
  advanced: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing(4),
  },
  advancedText: { fontSize: 12 },
});
