import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useLumTheme } from "../theme/ThemeContext";

// The one signature move on this page: a toggle that IS the brand.
// Lumticket = "light" + ticket. Rays extend at full sun (light mode)
// and retract into a crescent as the knob slides to dark mode —
// the control performs the exact thing the brand is named for.
export default function SunMoonToggle() {
  const { mode, toggle, colors } = useLumTheme();
  const progress = useRef(new Animated.Value(mode === "dark" ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: mode === "dark" ? 1 : 0,
      duration: 380,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  const knobTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [3, 33] });
  const rayScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const rayOpacity = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0, 0] });
  const crescentOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.goldSoft, colors.surfaceAlt],
  });

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityLabel="Toggle light or dark theme"
      accessibilityState={{ checked: mode === "dark" }}
      hitSlop={10}
      style={styles.wrap}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor, borderColor: colors.border }]}>
        {/* rays, radiating from the knob position in light mode */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ray,
              {
                backgroundColor: colors.goldDeep,
                opacity: rayOpacity,
                transform: [
                  { translateX: 15 },
                  { translateY: 15 },
                  { rotate: `${deg}deg` },
                  { translateY: -16 },
                  { scale: rayScale },
                ],
              },
            ]}
          />
        ))}
        <Animated.View style={[styles.knob, { left: knobTranslate, backgroundColor: colors.gold }]}>
          <Animated.View
            style={[
              styles.crescentBite,
              { opacity: crescentOpacity, backgroundColor: mode === "dark" ? colors.surfaceAlt : colors.bgAlt },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 4 },
  track: {
    width: 60,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "visible",
  },
  ray: {
    position: "absolute",
    width: 3,
    height: 7,
    borderRadius: 2,
  },
  knob: {
    position: "absolute",
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  crescentBite: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    left: 6,
  },
});
