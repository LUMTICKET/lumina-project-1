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
import { useAuth } from "../context/AuthContext";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

import BusTickets from "./BusTickets";
import EventsTickets from "./EventsTickets";
import FlightTickets from "./FlightTickets";
import PaymentPage from "./PaymentPage";
import PopularTickets from "./PopularTickets";
import TicketConfigPage, { PurchasePayload, TicketConfig } from "./TicketConfigPage";
import TourismTickets from "./TourismTickets";

const CATEGORIES = [
  "Popular Tickets",
  "Bus Tickets",
  "Events Tickets",
  "Tourism Tickets",
  "Flight Tickets",
];

/* ------------------------------------------------------------------ */
// Category tabs
/* ------------------------------------------------------------------ */
function CategoryTabs({
  categories,
  selectedIndex,
  onSelect,
}: {
  categories: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const { colors } = useLumTheme();

  return (
    <View
      style={[
        styles.pillsWrapper,
        {
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContent}
      >
        {categories.map((cat, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(index)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.gold : colors.bgAlt,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? colors.white : colors.ink,
                    fontFamily: fontFamilies.bodySemi,
                  },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Home page
/* ------------------------------------------------------------------ */
interface HomePageProps {
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

export default function HomePage({ onOpenAuth, onOpenSettings }: HomePageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const { user, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  /** Full-screen ticket purchase flow (config → payment) — hides tabs/search */
  const [selectedTicket, setSelectedTicket] = useState<TicketConfig | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<PurchasePayload | null>(null);

  /** Standalone category view (no tabs, category handles its own list→config→payment) */
  const [standaloneCategory, setStandaloneCategory] = useState<number | null>(null);

  /** Profile dropdown */
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  /** Notification badge (default) */
  const [notificationCount] = useState(3);

  const iconOffset = Platform.OS !== "web" ? { marginTop: 45 } : {};

  /* ---------- Standalone category (self-contained, no tabs) ---------- */
  if (standaloneCategory !== null) {
    const handleBackFromStandalone = () => setStandaloneCategory(null);
    switch (standaloneCategory) {
      case 0:
        return <PopularTickets onBack={handleBackFromStandalone} />;
      case 1:
        return <BusTickets onBack={handleBackFromStandalone} />;
      case 2:
        return <EventsTickets onBack={handleBackFromStandalone} />;
      case 3:
        return <TourismTickets onBack={handleBackFromStandalone} />;
      case 4:
        return <FlightTickets onBack={handleBackFromStandalone} />;
      default:
        setStandaloneCategory(null);
    }
  }

  /* ---------- Full-screen Payment ---------- */
  if (purchasePayload) {
    return (
      <PaymentPage
        payload={purchasePayload}
        onClose={() => setPurchasePayload(null)}
        onComplete={() => {
          setPurchasePayload(null);
          setSelectedTicket(null);
        }}
      />
    );
  }

  /* ---------- Full-screen Ticket Config ---------- */
  if (selectedTicket) {
    return (
      <TicketConfigPage
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onNavigateToPayment={setPurchasePayload}
      />
    );
  }

  /* ---------- Normal tabbed view ---------- */
  const renderCategoryPage = () => {
    switch (selectedCategory) {
      case 0:
        return <PopularTickets onSelectTicket={setSelectedTicket} />;
      case 1:
        return <BusTickets onSelectTicket={setSelectedTicket} />;
      case 2:
        return <EventsTickets onSelectTicket={setSelectedTicket} />;
      case 3:
        return <TourismTickets onSelectTicket={setSelectedTicket} />;
      case 4:
        return <FlightTickets onSelectTicket={setSelectedTicket} />;
      default:
        return null;
    }
  };

  const handleDropdownAction = async (action: string) => {
    setShowProfileDropdown(false);
    if (action === "createAccount") onOpenAuth?.();
    if (action === "settings") onOpenSettings?.();
    if (action === "logout") await logout();
  };

  const renderDropdownContent = () => {
    if (user) {
      return (
        <View style={{ gap: spacing(1) }}>
          {/* User Info Header */}
          <View style={[styles.userInfoContainer, { borderBottomColor: colors.border }]}>
            <Text
              style={[
                styles.userNameText,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
              numberOfLines={1}
            >
              {user.name || "User"}
            </Text>
            <Text
              style={[
                styles.userEmailText,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
              numberOfLines={1}
            >
              {user.email}
            </Text>
          </View>

          {!isDesktop && (
            <Pressable
              onPress={() => handleDropdownAction("settings")}
              style={styles.dropdownItem}
            >
              <Feather name="settings" size={18} color={colors.ink} />
              <Text
                style={[
                  styles.dropdownText,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                Settings
              </Text>
            </Pressable>
          )}

          {/* Logout Button */}
          <Pressable
            onPress={() => handleDropdownAction("logout")}
            style={[
              styles.dropdownItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <Feather name="log-out" size={18} color="#EF4444" />
            <Text
              style={[
                styles.dropdownText,
                { color: "#EF4444", fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Log Out
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={{ gap: spacing(1) }}>
        <Pressable
          onPress={() => handleDropdownAction("createAccount")}
          style={styles.dropdownItem}
        >
          <Feather name="user-plus" size={18} color={colors.ink} />
          <Text
            style={[
              styles.dropdownText,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            Create Account / Log In
          </Text>
        </Pressable>

        {!isDesktop && (
          <Pressable
            onPress={() => handleDropdownAction("settings")}
            style={styles.dropdownItem}
          >
            <Feather name="settings" size={18} color={colors.ink} />
            <Text
              style={[
                styles.dropdownText,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Settings
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Desktop top bar */}
      {isDesktop && (
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: colors.bg,
              borderBottomColor: colors.border,
            },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
              : {},
          ]}
        >
          <View style={styles.topBarInner}>
            <View
              style={[
                styles.desktopSearchBar,
                {
                  backgroundColor: colors.bgAlt,
                  borderWidth: 1,
                  borderColor: colors.gold,
                },
              ]}
            >
              <Feather name="search" size={20} color={colors.inkMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor={colors.inkMuted}
                selectionColor={colors.gold}
                style={[
                  styles.desktopSearchInput,
                  { color: colors.ink, fontFamily: fontFamilies.body },
                ]}
              />
            </View>

            {/* Right-side icons: notification + profile */}
            <View style={styles.rightIcons}>
              {/* Notification bell */}
              <Pressable
                style={[styles.iconBtn, { backgroundColor: colors.bgAlt }]}
              >
                <View style={{ position: "relative" }}>
                  <Feather name="bell" size={20} color={colors.inkMuted} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                </View>
              </Pressable>

              {/* Profile with dropdown */}
              <View style={{ position: "relative", zIndex: 60 }}>
                <Pressable
                  style={[styles.iconBtn, { backgroundColor: colors.bgAlt }]}
                  onPress={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <Feather name="user" size={20} color={colors.gold} />
                </Pressable>

                {showProfileDropdown && (
                  <>
                    <Pressable
                      style={StyleSheet.absoluteFill}
                      pointerEvents="auto"
                      onPress={() => setShowProfileDropdown(false)}
                    />
                    <View
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          shadowColor: colors.shadow,
                        },
                      ]}
                    >
                      {renderDropdownContent()}
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Mobile search */}
      {!isDesktop && (
        <View
          style={[
            styles.mobileSearchWrap,
            {
              paddingHorizontal: spacing(3),
              paddingTop: spacing(3),
              zIndex: 1,
              elevation: 1,
            },
          ]}
        >
          <View style={styles.mobileActionRow}>
            {/* Profile with dropdown */}
            <View style={{ position: "relative", zIndex: 20, elevation: 20 }}>
              <Pressable
                style={[
                  styles.iconBtn,
                  { backgroundColor: colors.bgAlt },
                  iconOffset,
                ]}
                onPress={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <Feather name="user" size={18} color={colors.inkMuted} />
              </Pressable>

              {showProfileDropdown && (
                <>
                  <Pressable
                    style={StyleSheet.absoluteFill}
                    pointerEvents="auto"
                    onPress={() => setShowProfileDropdown(false)}
                  />
                  <View
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        shadowColor: colors.shadow,
                        left: 0,
                        right: "auto",
                        zIndex: 50,
                        elevation: 50,
                      },
                    ]}
                  >
                    {renderDropdownContent()}
                  </View>
                </>
              )}
            </View>

            {/* Notification bell */}
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: colors.bgAlt },
                iconOffset,
              ]}
            >
              <View style={{ position: "relative" }}>
                <Feather name="bell" size={18} color={colors.inkMuted} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              </View>
            </Pressable>
          </View>
          <View
            style={[
              styles.mobileSearchBar,
              {
                backgroundColor: colors.bgAlt,
                borderWidth: 1,
                borderColor: colors.gold,
                zIndex: 2,
              },
            ]}
          >
            <Feather name="search" size={20} color={colors.gold} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor={colors.inkMuted}
              selectionColor={colors.gold}
              style={[
                styles.mobileSearchInput,
                { color: colors.ink, fontFamily: fontFamilies.body },
              ]}
            />
          </View>
        </View>
      )}

      {/* Category tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        selectedIndex={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Active category page */}
      <View style={{ flex: 1 }}>{renderCategoryPage()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
  },
  topBar: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6),
  },
  topBarInner: {
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
  },
  desktopSearchBar: {
    flex: 1,
    height: 56,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  mobileSearchBar: {
    width: "100%",
    height: 50,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
    zIndex: 2,
    overflow: "visible",
  },
  desktopSearchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  mobileSearchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
  },
  mobileSearchWrap: {
    paddingBottom: spacing(2),
    gap: spacing(2),
    zIndex: 1,
    elevation: 1,
    overflow: "visible",
  },
  mobileActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing(2),
  },
  pillsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
  },
  pillsContent: {
    paddingHorizontal: spacing(3),
    gap: spacing(2),
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    borderRadius: radii.full,
  },
  pillText: {
    fontSize: 14,
  },

  /* ---- Dropdown ---- */
  dropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    minWidth: 220,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2),
    zIndex: 5000,
    elevation: 5000,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
      },
      default: {
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5000,
      },
    }),
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    borderRadius: radii.lg,
  },
  dropdownText: {
    fontSize: 15,
  },
  userInfoContainer: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderBottomWidth: 1,
    marginBottom: spacing(1),
  },
  userNameText: {
    fontSize: 15,
  },
  userEmailText: {
    fontSize: 13,
    marginTop: 2,
  },

  /* ---- Notification Badge ---- */
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fontFamilies.bodySemi,
  },
});