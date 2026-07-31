import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated, LayoutChangeEvent } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies } from "../theme/tokens";

// Four regular stops plus a raised center action — the one place on this bar
// that's allowed to be loud, since booking a ticket is the app's whole job.
const TABS: { label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { label: "Home", icon: "home" },
  { label: "Tickets", icon: "credit-card" },
  { label: "Wallet", icon: "bell" },
  { label: "Me", icon: "user" },
];

type LayoutMap = Record<number, { x: number; width: number }>;

export default function BottomTabBar() {
  const { colors } = useLumTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(0);
  const [layouts, setLayouts] = useState<LayoutMap>({});
  const capsuleX = useRef(new Animated.Value(0)).current;
  const capsuleWidth = useRef(new Animated.Value(0)).current;
  const ready = useRef(false);

  useEffect(() => {
    const l = layouts[selected];
    if (!l) return;
    Animated.parallel([
      Animated.timing(capsuleX, { toValue: l.x, duration: ready.current ? 260 : 0, useNativeDriver: false }),
      Animated.timing(capsuleWidth, { toValue: l.width, duration: ready.current ? 260 : 0, useNativeDriver: false }),
    ]).start(() => {
      ready.current = true;
    });
  }, [selected, layouts]);

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => ({ ...prev, [index]: { x, width } }));
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <Pressable style={[styles.bookBtn, { backgroundColor: colors.gold, borderColor: colors.bg }]}>
        <Feather name="plus" size={22} color={colors.bg} />
      </Pressable>

      <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <Animated.View
          style={[
            styles.capsule,
            { backgroundColor: colors.ink, transform: [{ translateX: capsuleX }], width: capsuleWidth },
          ]}
        />
        {TABS.map((tab, i) => {
          const active = i === selected;
          // leave a gap in the middle for the raised center button
          const marginRight = i === 1 ? 34 : 0;
          return (
            <Pressable
              key={tab.label}
              onLayout={onTabLayout(i)}
              onPress={() => setSelected(i)}
              style={[styles.tab, { marginRight }]}
            >
              <Feather name={tab.icon} size={17} color={active ? colors.gold : colors.inkMuted} />
              {active && (
                <Text style={[styles.tabLabel, { color: colors.bg, fontFamily: fontFamilies.bodySemi }]}>
                  {tab.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 58,
    width: "100%",
    maxWidth: 420,
    position: "relative",
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  capsule: {
    position: "absolute",
    top: 7,
    bottom: 7,
    left: 0,
    borderRadius: 999,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabLabel: { fontSize: 13 },
  bookBtn: {
    position: "absolute",
    top: -22,
    left: "50%",
    marginLeft: -26,
    zIndex: 2,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
