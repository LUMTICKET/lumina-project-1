import { Feather } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import TicketConfigPage, { PurchasePayload, TicketConfig } from "./TicketConfigPage";
import PaymentPage, { PaymentMethod } from "./PaymentPage";

/* ------------------------------------------------------------------ */
// Data
/* ------------------------------------------------------------------ */
const ITEMS: TicketConfig[] = [
  {
    id: "bus-1",
    title: "Captain Bus Express",
    subtitle: "Blantyre to Songwe Border, one comfortable journey",
    category: "bus",
    image: require("@/assets/images/bus3.jpg"),
    organizer: "Captain Tours",
    date: "2026-08-06T06:00:00",
    time: "6:00 AM",
    location: "Blantyre Bus Terminal",
    route: {
      from: "Blantyre",
      to: "Songwe Border",
      stops: ["Lilongwe", "Mzuzu", "Karonga"],
      duration: "12h 00m",
    },
    tiers: [
      { id: "economy", name: "Economy", price: 18500, currency: "MWK", perks: ["Recliner Seat", "AC"], remaining: 32 },
      { id: "business", name: "Business", price: 35000, currency: "MWK", perks: ["Wi-Fi", "Charging Ports", "Entertainment"], remaining: 8 },
      { id: "sleeper", name: "Sleeper", price: 55000, currency: "MWK", perks: ["Flat Bed", "Private Curtain", "Meals"], remaining: 4 },
    ],
    description: "Captain Tours' state-of-the-art buses now ply the Blantyre–Songwe Border route via Lilongwe, Mzuzu and Karonga. Enjoy free Wi-Fi, charging ports, a fridge, water dispenser and TV entertainment on board — all at Captain's signature affordable fares.",
    tags: ["Buses", "Travel", "Comfort"],
    maxPerUser: 3,
  },
  {
    id: "bus-2",
    title: "Matours Express",
    subtitle: "Blantyre to Lilongwe in comfort",
    category: "Matours",
    image: require("@/assets/images/bus1.jpg"),
    organizer: "Matours.",
    date: "2026-08-07T05:00:00",
    time: "5:00 AM",
    location: "Thembalethu Square, Blantyre",
    route: {
      from: "Blantyre",
      to: "Lilongwe",
      duration: "4h 30m",
    },
    tiers: [
      { id: "standard", name: "Standard", price: 45000, currency: "MWK", perks: ["Window Seat"], remaining: 20 },
      { id: "premium", name: "Premium", price: 70000, currency: "MWK", perks: ["Panoramic Roof", "Snacks"], remaining: 6 },
    ],
    description: "Matours runs modern Marcopolo and Irizar coaches on Scania chassis between Blantyre and Lilongwe, offering a clean, reliable and comfortable ride for both local and cross-border travellers.",
    tags: ["Intercity", "Comfort", "Bus"],
    maxPerUser: 5,
  },
];

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */
function getAllLocations(items: TicketConfig[]): string[] {
  const set = new Set<string>();
  items.forEach((item) => {
    if (item.route?.from) set.add(item.route.from);
    if (item.route?.to) set.add(item.route.to);
    item.route?.stops?.forEach((stop) => set.add(stop));
  });
  return Array.from(set).sort();
}

/* ------------------------------------------------------------------ */
// Flow
/* ------------------------------------------------------------------ */
type Screen = "list" | "config" | "payment";

interface BusTicketsProps {
  /** Tabbed mode: lets HomePage render the config page */
  onSelectTicket?: (ticket: TicketConfig) => void;
  /** Standalone mode: renders a sticky header with a back button */
  onBack?: () => void;
}

export default function BusTickets({ onSelectTicket, onBack }: BusTicketsProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [screen, setScreen] = useState<Screen>("list");
  const [selectedTicket, setSelectedTicket] = useState<TicketConfig | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<PurchasePayload | null>(null);

  // Journey search state
  const [fromLocation, setFromLocation] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const allLocations = useMemo(() => getAllLocations(ITEMS), []);

  const filteredFromOptions = useMemo(() => {
    if (!fromQuery) return allLocations;
    return allLocations.filter((loc) =>
      loc.toLowerCase().includes(fromQuery.toLowerCase())
    );
  }, [fromQuery, allLocations]);

  const filteredToOptions = useMemo(() => {
    if (!toQuery) return allLocations;
    return allLocations.filter((loc) =>
      loc.toLowerCase().includes(toQuery.toLowerCase())
    );
  }, [toQuery, allLocations]);

  const filteredItems = useMemo(() => {
    return ITEMS.filter((item) => {
      const route = item.route;
      if (!route) return false;
      const matchesFrom = !fromLocation || route.from === fromLocation || route.stops?.includes(fromLocation);
      const matchesTo = !toLocation || route.to === toLocation || route.stops?.includes(toLocation);
      return matchesFrom && matchesTo;
    });
  }, [fromLocation, toLocation]);

  const clearJourney = () => {
    setFromLocation("");
    setToLocation("");
    setFromQuery("");
    setToQuery("");
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  // 1. List → Config (or delegate to parent in tabbed mode)
  const handleSelectTicket = (ticket: TicketConfig) => {
    if (onSelectTicket && !onBack) {
      onSelectTicket(ticket);
      return;
    }
    setSelectedTicket(ticket);
    setScreen("config");
  };

  // 2. Config → Payment
  const handleNavigateToPayment = (payload: PurchasePayload) => {
    setPurchasePayload(payload);
    setScreen("payment");
  };

  // 3. Payment back → Config
  const handlePaymentClose = () => {
    setScreen("config");
  };

  // 4. Payment done → List
  const handlePaymentComplete = (result: { success: boolean; method: PaymentMethod; reference?: string }) => {
    console.log("Payment result:", result);
    setScreen("list");
    setSelectedTicket(null);
    setPurchasePayload(null);
  };

  // 5. Config back → List
  const handleConfigClose = () => {
    setScreen("list");
    setSelectedTicket(null);
  };

  /* ---------------- RENDER: Ticket Config ---------------- */
  if (screen === "config" && selectedTicket) {
    return (
      <TicketConfigPage
        ticket={selectedTicket}
        onClose={handleConfigClose}
        onNavigateToPayment={handleNavigateToPayment}
      />
    );
  }

  /* ---------------- RENDER: Payment ---------------- */
  if (screen === "payment" && purchasePayload) {
    return (
      <PaymentPage
        payload={purchasePayload}
        onClose={handlePaymentClose}
        onComplete={handlePaymentComplete}
      />
    );
  }

  /* ---------------- RENDER: List (default) ---------------- */
  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: Array<typeof filteredItems> = Array.from({ length: columnCount }, () => []);
  filteredItems.forEach((item, i) => columns[i % columnCount].push(item));

  const showHeader = !!onBack;
  const hasActiveFilter = fromLocation || toLocation;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Standalone Header */}
      {showHeader && (
        <View
          style={[
            styles.header,
            { backgroundColor: colors.bg, borderBottomColor: colors.border },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
              : {},
          ]}
        >
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.ink, fontFamily: fontFamilies.display },
            ]}
            numberOfLines={1}
          >
            Bus Tickets
          </Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(6) : spacing(2),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(10) : spacing(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Journey Search Section */}
        <View style={[styles.journeyCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.journeyTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
            Plan Your Journey
          </Text>

          <View style={styles.journeyRow}>
            {/* From Selector */}
            <View style={styles.journeyField}>
              <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>From</Text>
              <Pressable
                style={[styles.selectBox, { borderColor: colors.border, backgroundColor: colors.bg }]}
                onPress={() => {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                }}
              >
                <Feather name="map-pin" size={14} color={colors.inkMuted} />
                <Text
                  style={[
                    styles.selectText,
                    { color: fromLocation ? colors.ink : colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                  numberOfLines={1}
                >
                  {fromLocation || "Select origin"}
                </Text>
                <Feather name="chevron-down" size={14} color={colors.inkMuted} />
              </Pressable>

              {showFromDropdown && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.dropdownInput, { color: colors.ink, borderColor: colors.border }]}
                    placeholder="Search location..."
                    placeholderTextColor={colors.inkMuted}
                    value={fromQuery}
                    onChangeText={setFromQuery}
                    autoFocus
                  />
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {filteredFromOptions.length === 0 ? (
                      <Text style={[styles.dropdownEmpty, { color: colors.inkMuted }]}>No locations found</Text>
                    ) : (
                      filteredFromOptions.map((loc) => (
                        <Pressable
                          key={loc}
                          style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                          onPress={() => {
                            setFromLocation(loc);
                            setFromQuery(loc);
                            setShowFromDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: colors.ink, fontFamily: fontFamilies.body }]}>
                            {loc}
                          </Text>
                          {fromLocation === loc && (
                            <Feather name="check" size={14} color={colors.gold} />
                          )}
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Swap Icon */}
            <View style={styles.swapWrap}>
              <Pressable
                style={[styles.swapBtn, { backgroundColor: colors.gold + "20" }]}
                onPress={() => {
                  const temp = fromLocation;
                  setFromLocation(toLocation);
                  setToLocation(temp);
                  setFromQuery(toLocation);
                  setToQuery(temp);
                }}
              >
                <Feather name="arrow-right" size={16} color={colors.gold} />
              </Pressable>
            </View>

            {/* To Selector */}
            <View style={styles.journeyField}>
              <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>To</Text>
              <Pressable
                style={[styles.selectBox, { borderColor: colors.border, backgroundColor: colors.bg }]}
                onPress={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }}
              >
                <Feather name="navigation" size={14} color={colors.inkMuted} />
                <Text
                  style={[
                    styles.selectText,
                    { color: toLocation ? colors.ink : colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                  numberOfLines={1}
                >
                  {toLocation || "Select destination"}
                </Text>
                <Feather name="chevron-down" size={14} color={colors.inkMuted} />
              </Pressable>

              {showToDropdown && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.dropdownInput, { color: colors.ink, borderColor: colors.border }]}
                    placeholder="Search location..."
                    placeholderTextColor={colors.inkMuted}
                    value={toQuery}
                    onChangeText={setToQuery}
                    autoFocus
                  />
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {filteredToOptions.length === 0 ? (
                      <Text style={[styles.dropdownEmpty, { color: colors.inkMuted }]}>No locations found</Text>
                    ) : (
                      filteredToOptions.map((loc) => (
                        <Pressable
                          key={loc}
                          style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                          onPress={() => {
                            setToLocation(loc);
                            setToQuery(loc);
                            setShowToDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: colors.ink, fontFamily: fontFamilies.body }]}>
                            {loc}
                          </Text>
                          {toLocation === loc && (
                            <Feather name="check" size={14} color={colors.gold} />
                          )}
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {hasActiveFilter && (
            <Pressable style={styles.clearWrap} onPress={clearJourney}>
              <Feather name="x-circle" size={14} color={colors.inkMuted} />
              <Text style={[styles.clearText, { color: colors.inkMuted }]}>Clear journey</Text>
            </Pressable>
          )}
        </View>

        {/* Results Count */}
        {hasActiveFilter && (
          <Text style={[styles.resultsText, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
            {filteredItems.length} route{filteredItems.length !== 1 ? "s" : ""} found
            {fromLocation && toLocation ? ` from ${fromLocation} to ${toLocation}` : fromLocation ? ` from ${fromLocation}` : ` to ${toLocation}`}
          </Text>
        )}

        <View style={styles.board}>
          {columns.map((col, ci) => (
            <View key={ci} style={styles.column}>
              {col.map((pin) => (
                <Pressable
                  key={pin.id}
                  style={styles.pinWrap}
                  onPress={() => handleSelectTicket(pin)}
                >
                  <View style={[styles.pinCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                    <View style={styles.imageWrap}>
                      <Image source={pin.image} style={[styles.pinImage, { height: 280 }]} resizeMode="cover" />
                      <View style={styles.saveOverlay}>
                        <Pressable
                          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                          onPress={() => handleSelectTicket(pin)}
                        >
                          <Text style={[styles.saveText, { color: colors.white, fontFamily: fontFamilies.bodySemi }]}>
                            Book Seat
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.pinBody}>
                      <Text style={[styles.pinTitle, { color: colors.ink, fontFamily: fontFamilies.display }]} numberOfLines={2}>
                        {pin.title}
                      </Text>
                      <Text style={[styles.pinSubtitle, { color: colors.inkMuted, fontFamily: fontFamilies.body }]} numberOfLines={1}>
                        {pin.subtitle}
                      </Text>
                      {pin.route && (
                        <Text style={[styles.routeMini, { color: colors.inkMuted }]}>
                          {pin.route.from} → {pin.route.to}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="map" size={48} color={colors.inkMuted} />
            <Text style={[styles.emptyTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
              No routes found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
              Try adjusting your journey search
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 52,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing(2),
    fontFamily: fontFamilies.display,
  },

  /* Journey Search */
  journeyCard: {
    borderRadius: radii.xl,
    padding: spacing(4),
    marginBottom: spacing(4),
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  journeyTitle: {
    fontSize: 16,
    marginBottom: spacing(3),
  },
  journeyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing(2),
  },
  journeyField: {
    flex: 1,
    position: "relative",
    zIndex: 10,
  },
  fieldLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing(1),
    fontFamily: fontFamilies.bodySemi,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
  },
  selectText: {
    flex: 1,
    fontSize: 14,
  },
  swapWrap: {
    paddingBottom: spacing(1),
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "90deg" }],
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: spacing(1),
    borderRadius: radii.lg,
    borderWidth: 1,
    maxHeight: 220,
    zIndex: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    overflow: "hidden",
  },
  dropdownInput: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    fontSize: 14,
    fontFamily: fontFamilies.body,
  },
  dropdownList: {
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  dropdownEmpty: {
    padding: spacing(4),
    textAlign: "center",
    fontSize: 13,
  },
  clearWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
    marginTop: spacing(3),
    alignSelf: "flex-start",
  },
  clearText: {
    fontSize: 12,
    fontFamily: fontFamilies.bodySemi,
  },
  resultsText: {
    fontSize: 13,
    marginBottom: spacing(3),
    marginLeft: spacing(1),
  },

  /* Masonry Board */
  board: { flexDirection: "row", gap: spacing(3), alignItems: "flex-start", maxWidth: 1600, alignSelf: "center", width: "100%" },
  column: { flex: 1, gap: spacing(3) },
  pinWrap: { width: "100%", marginBottom: spacing(3) },
  pinCard: { borderRadius: radii.xl, overflow: "hidden", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  imageWrap: { position: "relative", width: "100%" },
  pinImage: { width: "100%" },
  saveOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-start", alignItems: "flex-end", padding: spacing(3) },
  saveBtn: { paddingHorizontal: spacing(4), paddingVertical: spacing(2), borderRadius: radii.full, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  saveText: { fontSize: 13 },
  pinBody: { paddingHorizontal: spacing(3), paddingTop: spacing(3), paddingBottom: spacing(3.5), gap: 4 },
  pinTitle: { fontSize: 14, lineHeight: 18 },
  pinSubtitle: { fontSize: 12 },
  routeMini: { fontSize: 11, marginTop: 2 },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(12),
    gap: spacing(3),
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});