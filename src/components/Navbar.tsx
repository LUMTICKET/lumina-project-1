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

const SIDEBAR_ITEMS: { icon: keyof typeof Feather.glyphMap; route: RouteName }[] = [
  { icon: "home", route: "Home" },
  { icon: "search", route: "Search" },
  { icon: "plus-square", route: "Create" },
  { icon: "message-circle", route: "Messaging" },
  { icon: "bell", route: "Feeds" },
];

const MOBILE_ITEMS: { icon: keyof typeof Feather.glyphMap; route: RouteName }[] = [
  { icon: "home", route: "Home" },
  { icon: "search", route: "Search" },
  { icon: "plus-circle", route: "Create" },
  { icon: "message-circle", route: "Messaging" }, // swapped user → message-circle so all 5 pages are reachable
  { icon: "bell", route: "Feeds" },
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

      {/* Icons only */}
      <View style={styles.navStack}>
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.route === currentRoute;
          return (
            <Pressable
              key={item.route}
              style={styles.iconBtn}
              onPress={() => onNavigate(item.route)}
            >
              {item.route === "Feeds" ? (
                <ReelsIcon
                  size={24}
                  color={isActive ? colors.ink : colors.inkMuted}
                />
              ) : (
                <Feather
                  name={item.icon}
                  size={24}
                  color={isActive ? colors.ink : colors.inkMuted}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Divider line before profile/settings */}
      <View style={[styles.divider, { backgroundColor: colors.border, marginTop: "auto" }]} />

      {/* Settings at bottom */}
      <Pressable
        style={styles.profileBtn}
        onPress={() => onNavigate("Settings")}
      >
        <Feather
          name="settings"
          size={24}
          color={currentRoute === "Settings" ? colors.ink : colors.inkMuted}
        />
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
                size={26}
                color={isActive ? colors.ink : colors.inkMuted}
              />
            ) : (
              <Feather
                name={item.icon}
                size={26}
                color={isActive ? colors.ink : colors.inkMuted}
              />
            )}
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
    width: 72,
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
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing(2),
  },
  mobileNav: {
    minHeight: 60,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: spacing(2),
    paddingBottom: Platform.OS === "web" ? spacing(2) : spacing(12),
    elevation: 20,
    zIndex: 1000,
    overflow: "hidden",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
});