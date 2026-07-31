import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, spacing } from "../theme/tokens";

const ITEMS: { icon: keyof typeof Feather.glyphMap; label: string; hint: string }[] = [
  { icon: "corner-up-left", label: "Return tickets", hint: "Round trips, one booking" },
  { icon: "activity", label: "Live train status", hint: "Delays sent to your phone" },
  { icon: "percent", label: "Fare discounts", hint: "Students, seniors, groups" },
  { icon: "user-check", label: "Accessible travel", hint: "Step-free boarding support" },
];

export default function FeaturesStrip() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const columns = width < 640 ? 2 : 4;

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border }]}>
      {ITEMS.map((item, i) => (
        <View
          key={item.label}
          style={[
            styles.item,
            { width: `${100 / columns}%` },
            i % columns !== columns - 1 && width >= 640 ? { borderRightColor: colors.border, borderRightWidth: 1 } : null,
          ]}
        >
          <View style={[styles.iconRing, { borderColor: colors.gold }]}>
            <Feather name={item.icon} size={17} color={colors.gold} />
          </View>
          <Text style={[styles.label, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
            {item.label}
          </Text>
          <Text style={[styles.hint, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
            {item.hint}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    paddingVertical: spacing(9),
    paddingHorizontal: spacing(6),
  },
  item: { alignItems: "center", paddingHorizontal: spacing(3), marginBottom: spacing(6) },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing(3),
  },
  label: { fontSize: 14, marginBottom: 3, textAlign: "center" },
  hint: { fontSize: 12, textAlign: "center" },
});
