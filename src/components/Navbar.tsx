import { Feather } from "@expo/vector-icons";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { radii, spacing } from "../theme/tokens";

const SIDEBAR_ICONS = [
  "home",
  "search",
  "plus-square",
  "message-circle",
  "bell",
] as const;

const BOTTOM_TABS = [
  { icon: "home" as const },
  { icon: "search" as const },
  { icon: "plus-circle" as const },
  { icon: "bell" as const },
  { icon: "user" as const },
];

function DesktopSidebar() {
  const { colors } = useLumTheme();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.bg,
          borderRightColor: colors.border,
        },
        Platform.OS === "web"
          ? ({ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1000 } as any)
          : { position: "absolute", top: 0, left: 0, bottom: 0 },
      ]}
    >
      {/* Logo */}
      <Pressable style={styles.logoWrap}>
        <View style={[styles.logoMark, { backgroundColor: colors.gold }]}>
          <Text style={[styles.logoLetter, { color: colors.black }]}>L</Text>
        </View>
      </Pressable>

      {/* Icons only — no labels, no indicators, no placeholders */}
      <View style={styles.navStack}>
        {SIDEBAR_ICONS.map((icon, index) => (
          <Pressable key={index} style={styles.iconBtn}>
            <Feather name={icon} size={24} color={colors.ink} />
          </Pressable>
        ))}
      </View>

      {/* Profile at bottom */}
      <Pressable style={styles.profileBtn}>
        <Feather name="settings" size={24} color={colors.ink} />
      </Pressable>
    </View>
  );
}

function MobileBottomNav() {
  const { colors } = useLumTheme();

  return (
    <View
      style={[
        styles.mobileNav,
        {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
        Platform.OS === "web"
          ? ({ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 } as any)
          : { position: "absolute", bottom: 0, left: 0, right: 0 },
      ]}
    >
      {BOTTOM_TABS.map((tab, index) => (
        <Pressable key={index} style={styles.tabItem}>
          <Feather name={tab.icon} size={26} color={colors.inkMuted} />
        </Pressable>
      ))}
    </View>
  );
}

export default function Navbar() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  return isDesktop ? <DesktopSidebar /> : <MobileBottomNav />;
}

// Need this import
import { useWindowDimensions } from "react-native";

const styles = StyleSheet.create({
  sidebar: {
    width: 72,
    borderRightWidth: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? spacing(10) : spacing(5),
    paddingBottom: spacing(4),
  },
  logoWrap: {
    marginBottom: spacing(6),
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: "800",
  },
  navStack: {
    gap: spacing(2),
    alignItems: "center",
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtn: {
    marginTop: "auto",
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileNav: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? spacing(2) : 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
});