import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
  LayoutChangeEvent,
  useColorScheme,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const getThemeColors = (scheme: "light" | "dark") => {
  const isDark = scheme === "dark";
  return {
    ink: isDark ? "#FFFFFF" : "#0F172A",
    inkMuted: isDark ? "#94A3B8" : "#64748B",
    activePill: isDark ? "#FFFFFF" : "#0F172A",
    activeText: isDark ? "#0F172A" : "#FFFFFF",
    trackBorder: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.08)",
    gold: "#F59E0B",
    iconBtnBg: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.04)",
  };
};

const LINKS = [
  { label: "Home" },
  { label: "Book" },
  { label: "Stations" },
  { label: "Support" },
];

type LayoutMap = Record<number, { x: number; width: number }>;

export default function Navbar() {
  const systemScheme = useColorScheme() ?? "light";
  const resolvedScheme = systemScheme === "dark" ? "dark" : "light";
  const colors = getThemeColors(resolvedScheme);
  const { width } = useWindowDimensions();
  const compact = width < 768;

  const [selected, setSelected] = useState(0);
  const [layouts, setLayouts] = useState<LayoutMap>({});
  const pillX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const pillReady = useRef(false);

  useEffect(() => {
    const l = layouts[selected];
    if (!l) return;
    Animated.parallel([
      Animated.spring(pillX, {
        toValue: l.x,
        tension: 60,
        friction: 10,
        useNativeDriver: false,
      }),
      Animated.spring(pillWidth, {
        toValue: l.width,
        tension: 60,
        friction: 10,
        useNativeDriver: false,
      }),
    ]).start(() => {
      pillReady.current = true;
    });
  }, [selected, layouts]);

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width: w } = e.nativeEvent.layout;
    setLayouts((prev) => ({ ...prev, [index]: { x, width: w } }));
  };

  return (
    <View style={styles.container}>
      {/* Brand Logo */}
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: colors.gold }]}>
          <View style={[styles.markCore, { backgroundColor: colors.ink }]} />
        </View>
        <Text style={[styles.brandText, { color: colors.ink }]}>
          lumticket
        </Text>
      </View>

      {/* Floating Center Tabs */}
      {!compact && (
        <View style={[styles.linksTrack, { borderColor: colors.trackBorder }]}>
          <Animated.View
            style={[
              styles.pill,
              {
                backgroundColor: colors.activePill,
                transform: [{ translateX: pillX }],
                width: pillWidth,
              },
            ]}
          />
          {LINKS.map((link, i) => {
            const active = i === selected;
            return (
              <Pressable
                key={link.label}
                onLayout={onTabLayout(i)}
                onPress={() => setSelected(i)}
                style={({ pressed }) => [
                  styles.tab,
                  { opacity: pressed ? 0.7 : 1.0 },
                ]}
              >
                <Text
                  style={[
                    styles.linkText,
                    {
                      color: active ? colors.activeText : colors.inkMuted,
                      fontWeight: active ? "600" : "500",
                    },
                  ]}
                >
                  {link.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* App Action Controls */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.iconBtnBg, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="user" size={18} color={colors.ink} />
        </Pressable>

        {compact && (
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.iconBtnBg, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="grid" size={18} color={colors.ink} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  markCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandText: {
    fontSize: 18,
    letterSpacing: -0.3,
    fontWeight: "700",
  },
  linksTrack: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
    position: "relative",
    backgroundColor: "transparent",
  },
  pill: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: 999,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  linkText: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});