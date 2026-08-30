import { Feather } from "@expo/vector-icons";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { radii, spacing } from "../theme/tokens";
import ReelsIcon from "./ReelsIcon";

type RouteName = "Home" | "Search" | "Create" | "Messaging" | "Feeds" | "Settings";

interface NavbarProps {
  currentRoute: RouteName;
  onNavigate: (route: RouteName) => void;
}

const SIDEBAR_ITEMS: { icon: keyof typeof Feather.glyphMap; route: RouteName; label: string }[] = [
  { icon: "home", route: "Home", label: "Home" },
  { icon: "shopping-bag", route: "Search", label: "Buy Tickets" },
  { icon: "plus-square", route: "Create", label: "Create" },
  { icon: "message-circle", route: "Messaging", label: "Messages" },
  { icon: "bell", route: "Feeds", label: "Feeds" },
];

const MOBILE_ITEMS: { icon: keyof typeof Feather.glyphMap; route: RouteName; label: string }[] = [
  { icon: "home", route: "Home", label: "Home" },
  { icon: "shopping-bag", route: "Search", label: "Buy" },
  { icon: "plus-circle", route: "Create", label: "Create" },
  { icon: "message-circle", route: "Messaging", label: "Messages" },
  { icon: "bell", route: "Feeds", label: "Feeds" },
];

function DesktopSidebar({ currentRoute, onNavigate }: NavbarProps) {
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
      <Pressable style={styles.logoWrap} onPress={() => onNavigate("Home")}>
        <View style={[styles.logoMark, { backgroundColor: colors.gold }]}>
          <Text style={[styles.logoLetter, { color: colors.black }]}>L</Text>
        </View>
      </Pressable>

      {/* Divider line */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.navStack}>
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.route === currentRoute;
          return (
            <Pressable
              key={item.route}
              style={[styles.iconBtn, isActive && styles.activeIconBtn]}
              onPress={() => onNavigate(item.route)}
            >
              {item.route === "Feeds" ? (
                <ReelsIcon
                  size={22}
                  color={isActive ? colors.inkMuted : colors.gold}
                />
              ) : (
                <Feather
                  name={item.icon}
                  size={22}
                  color={isActive ? colors.inkMuted : colors.gold}
                />
              )}
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: isActive ? colors.ink : colors.gold,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border, marginTop: "auto" }]} />

      <Pressable
        style={[styles.profileBtn, currentRoute === "Settings" && styles.activeIconBtn]}
        onPress={() => onNavigate("Settings")}
      >
        <Feather
          name="settings"
          size={22}
          color={currentRoute === "Settings" ? colors.inkMuted : colors.gold}
        />
        <Text
          style={[
            styles.navLabel,
            {
              color: currentRoute === "Settings" ? colors.ink : colors.gold,
            },
          ]}
        >
          Settings
        </Text>
      </Pressable>
    </View>
  );
}

function MobileBottomNav({ currentRoute, onNavigate }: NavbarProps) {
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
      {MOBILE_ITEMS.map((item) => {
        const isActive = item.route === currentRoute;
        return (
          <Pressable
            key={item.route}
            style={styles.tabItem}
            onPress={() => onNavigate(item.route)}
          >
            {item.route === "Feeds" ? (
              <ReelsIcon
                size={22}
                color={isActive ? colors.inkMuted : colors.gold}
              />
            ) : (
              <Feather
                name={item.icon}
                size={22}
                color={isActive ? colors.inkMuted : colors.gold}
              />
            )}
            <Text
              style={[
                styles.mobileLabel,
                {
                  color: isActive ? colors.ink : colors.gold,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Navbar(props: NavbarProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  return isDesktop ? <DesktopSidebar {...props} /> : <MobileBottomNav {...props} />;
}

const styles = StyleSheet.create({
  sidebar: {
    width: 92,
    borderRightWidth: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? spacing(10) : spacing(5),
    paddingBottom: spacing(4),
  },
  logoWrap: {
    marginBottom: spacing(4),
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
  divider: {
    width: 32,
    height: 1,
    marginVertical: spacing(2),
  },
  navStack: {
    gap: spacing(1.5),
    alignItems: "stretch",
    width: "100%",
    paddingHorizontal: spacing(2),
  },
  iconBtn: {
    width: "100%",
    minHeight: 56,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1),
    paddingVertical: spacing(1.5),
  },
  activeIconBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  profileBtn: {
    width: "100%",
    minHeight: 56,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1),
    paddingVertical: spacing(1.5),
    marginBottom: spacing(2),
  },
  mobileNav: {
    minHeight: 76,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: spacing(2),
    paddingBottom: Platform.OS === "web" ? spacing(2) : spacing(12),
    elevation: 50,
    zIndex: 50,
    overflow: "visible",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 50,
    gap: spacing(0.5),
  },
  mobileLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.15,
  },
});