import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, spacing } from "../theme/tokens";

const SOCIALS: (keyof typeof Feather.glyphMap)[] = ["facebook", "twitter", "instagram"];

export default function Footer() {
  const { colors } = useLumTheme();
  return (
    <View style={[styles.wrap, { borderTopColor: colors.border }]}>
      <Text style={[styles.copy, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
        © {new Date().getFullYear()} Lumticket. Travel toward something.
      </Text>
      <View style={styles.socials}>
        {SOCIALS.map((name) => (
          <Pressable key={name} style={[styles.socialBtn, { borderColor: colors.border }]}>
            <Feather name={name} size={14} color={colors.ink} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(4),
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(6),
  },
  copy: { fontSize: 12 },
  socials: { flexDirection: "row", gap: spacing(3) },
  socialBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
