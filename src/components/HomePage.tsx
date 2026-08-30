import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
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
import TicketConfigPage, { PurchasePayload, TicketConfig } from "./TicketConfigPage";
import TourismTickets from "./TourismTickets";

const CATEGORIES = [
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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex !== null) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollToIndex?.({
          index: selectedIndex,
          animated: true,
          viewPosition: 0.5,
        } as any);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [selectedIndex]);

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
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContent}
        scrollEventThrottle={16}
        decelerationRate="normal"
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
                  transform: isSelected ? [{ scale: 1.05 }] : [{ scale: 1 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? colors.black : colors.ink,
                    fontFamily: fontFamilies.bodySemi,
                    fontWeight: isSelected ? "700" : "600",
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
  const mobileSearchWidth = Math.min(220, Math.max(140, width * 0.52));

  const { user, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<TicketConfig | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<PurchasePayload | null>(null);
  const [standaloneCategory, setStandaloneCategory] = useState<number | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notificationCount] = useState(3);

  const iconOffset = Platform.OS !== "web" ? { marginTop: 45 } : {};
  const pageScrollRef = useRef<ScrollView>(null);

  /* ---------- Sync tab press → horizontal page scroll ---------- */
  useEffect(() => {
    pageScrollRef.current?.scrollTo({
      x: selectedCategory * width,
      animated: true,
    });
  }, [selectedCategory, width]);

  /* ---------- Sync horizontal swipe end → active tab ---------- */
  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex >= 0 && newIndex < CATEGORIES.length) {
      setSelectedCategory(newIndex);
    }
  };

  /* ---------- Standalone category (self-contained, no tabs) ---------- */
  if (standaloneCategory !== null) {
    const handleBackFromStandalone = () => setStandaloneCategory(null);
    switch (standaloneCategory) {
      case 0:
        return <BusTickets onBack={handleBackFromStandalone} />;
      case 1:
        return <EventsTickets onBack={handleBackFromStandalone} />;
      case 2:
        return <TourismTickets onBack={handleBackFromStandalone} />;
      case 3:
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
            Create Account
          </Text>
        </Pressable>
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

            <View style={styles.rightIcons}>
              <Pressable style={[styles.iconBtn, { backgroundColor: colors.bgAlt }]}>
                <View style={{ position: "relative" }}>
                  <Feather name="bell" size={20} color={colors.inkMuted} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                </View>
              </Pressable>

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
            {isSearchOpen && (
              <View
                style={[
                  styles.mobileSearchExpander,
                  {
                    backgroundColor: colors.bgAlt,
                    borderColor: colors.gold,
                    width: mobileSearchWidth,
                    zIndex: 25,
                    elevation: 25,
                  },
                ]}
              >
                <Feather name="search" size={16} color={colors.gold} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search"
                  placeholderTextColor={colors.inkMuted}
                  selectionColor={colors.gold}
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery.trim()) setIsSearchOpen(false);
                  }}
                  style={[
                    styles.mobileSearchInput,
                    { color: colors.ink, fontFamily: fontFamilies.body },
                  ]}
                />
              </View>
            )}

            {!isSearchOpen && (
              <Pressable
                style={[
                  styles.iconBtn,
                  { backgroundColor: colors.bgAlt },
                  iconOffset,
                  { zIndex: 10, elevation: 10 },
                ]}
                onPress={() => setIsSearchOpen((prev) => !prev)}
              >
                <Feather name="search" size={18} color={colors.gold} />
              </Pressable>
            )}

            <Pressable
              style={[styles.iconBtn, { backgroundColor: colors.bgAlt }, iconOffset]}
            >
              <View style={{ position: "relative" }}>
                <Feather name="bell" size={18} color={colors.inkMuted} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              </View>
            </Pressable>

            <View style={{ position: "relative", zIndex: 20, elevation: 20 }}>
              <Pressable
                style={[styles.iconBtn, { backgroundColor: colors.bgAlt }, iconOffset]}
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
                        backgroundColor: colors.bg,
                        borderColor: colors.gold,
                        shadowColor: colors.shadow,
                        right: 0,
                        left: "auto",
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
          </View>
        </View>
      )}

      {/* Category tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        selectedIndex={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Horizontal swipeable pages */}
      <ScrollView
        ref={pageScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        <View style={{ width, flex: 1 }}>
          <BusTickets onSelectTicket={setSelectedTicket} />
        </View>
        <View style={{ width, flex: 1 }}>
          <EventsTickets onSelectTicket={setSelectedTicket} />
        </View>
        <View style={{ width, flex: 1 }}>
          <TourismTickets onSelectTicket={setSelectedTicket} />
        </View>
        <View style={{ width, flex: 1 }}>
          <FlightTickets onSelectTicket={setSelectedTicket} />
        </View>
      </ScrollView>
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
    minWidth: 0,
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
    justifyContent: "flex-end",
    gap: spacing(2),
    overflow: "visible",
  },
  mobileSearchExpander: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    minWidth: 140,
    maxWidth: "72%",
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    gap: spacing(2),
    marginRight: spacing(1),
    overflow: "visible",
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
  dropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    minWidth: 180,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2),
    zIndex: 5000,
    elevation: 5000,
    ...Platform.select({
      web: {
        boxShadow: "0 12px 28px rgba(11,31,58,0.28)",
      },
      default: {
        shadowOpacity: 0.22,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
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