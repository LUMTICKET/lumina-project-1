import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import PaymentPage, { PaymentMethod } from "./PaymentPage";
import TicketConfigPage, { PurchasePayload, TicketConfig } from "./TicketConfigPage";

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
// Types
/* ------------------------------------------------------------------ */
type Screen = "list" | "config" | "payment";

interface BusTicketsProps {
  onSelectTicket?: (ticket: TicketConfig) => void;
  onBack?: () => void;
}

interface SelectorProps {
  label: string;
  value: string;
  placeholder: string;
  pickerType: "from" | "to" | "date";
  options: string[];
  colors: any;
  active: boolean;
  onToggle: (type: "from" | "to" | "date") => void;
  onSelect: (val: string) => void;
  formatOption?: (val: string) => string;
}

/* ------------------------------------------------------------------ */
// Reusable selector (defined outside to avoid re-mounts)
/* ------------------------------------------------------------------ */
function Selector({
  label,
  value,
  placeholder,
  pickerType,
  options,
  colors,
  active,
  onToggle,
  onSelect,
  formatOption,
}: SelectorProps) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 140,
        // FIX: relative positioning is required for zIndex to work on web
        // and for absolute children to anchor correctly.
        position: "relative",
        zIndex: active ? 50 : 1,
        // FIX: elevation ensures Android draws this layer above siblings
        elevation: active ? 12 : 1,
      }}
    >
      <Pressable
        style={[
          styles.selectorField,
          { borderColor: colors.border, backgroundColor: colors.bg },
        ]}
        onPress={() => onToggle(pickerType)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.selectorLabel, { color: colors.inkMuted }]}>
            {label}
          </Text>
          <Text
            style={[
              styles.selectorValue,
              { color: value ? colors.ink : colors.inkMuted },
            ]}
            numberOfLines={1}
          >
            {value ? (formatOption ? formatOption(value) : value) : placeholder}
          </Text>
        </View>
        <Feather
          name={active ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.inkMuted}
        />
      </Pressable>

      {active && (
        <View
          style={[
            styles.optionsList,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          // FIX: capture touches so tapping inside the dropdown doesn't
          // bubble up to the list items underneath it.
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Pressable
            style={styles.optionItem}
            onPress={() => {
              onSelect("");
              onToggle(pickerType);
            }}
          >
            <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body }}>
              Any
            </Text>
          </Pressable>
          {options.map((opt) => (
            <Pressable
              key={opt}
              style={styles.optionItem}
              onPress={() => {
                onSelect(opt);
                onToggle(pickerType);
              }}
            >
              <Text style={{ color: colors.ink, fontFamily: fontFamilies.body }}>
                {formatOption ? formatOption(opt) : opt}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Main component
/* ------------------------------------------------------------------ */
export default function BusTickets({ onSelectTicket, onBack }: BusTicketsProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [screen, setScreen] = useState<Screen>("list");
  const [selectedTicket, setSelectedTicket] = useState<TicketConfig | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<PurchasePayload | null>(null);

  // Journey filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [openPicker, setOpenPicker] = useState<"from" | "to" | "date" | null>(null);

  const handleTogglePicker = (type: "from" | "to" | "date") => {
    setOpenPicker((prev) => (prev === type ? null : type));
  };

  const handleSelectTicket = (ticket: TicketConfig) => {
    if (onSelectTicket && !onBack) {
      onSelectTicket(ticket);
      return;
    }
    setSelectedTicket(ticket);
    setScreen("config");
  };

  const handleNavigateToPayment = (payload: PurchasePayload) => {
    setPurchasePayload(payload);
    setScreen("payment");
  };

  const handlePaymentClose = () => {
    setScreen("config");
  };

  const handlePaymentComplete = (result: {
    success: boolean;
    method: PaymentMethod;
    reference?: string;
  }) => {
    console.log("Payment result:", result);
    setScreen("list");
    setSelectedTicket(null);
    setPurchasePayload(null);
  };

  const handleConfigClose = () => {
    setScreen("list");
    setSelectedTicket(null);
  };

  /* ---------------- Filter logic ---------------- */
  const filteredItems = useMemo(() => {
    return ITEMS.filter((item) => {
      if (from && item.route?.from !== from) return false;
      if (to && item.route?.to !== to) return false;
      if (journeyDate && item.date) {
        const d = item.date.split("T")[0];
        if (d !== journeyDate) return false;
      }
      return true;
    });
  }, [from, to, journeyDate]);

  const fromOptions = useMemo(
    () => [...new Set(ITEMS.map((i) => i.route?.from).filter(Boolean))] as string[],
    []
  );
  const toOptions = useMemo(
    () => [...new Set(ITEMS.map((i) => i.route?.to).filter(Boolean))] as string[],
    []
  );
  const dateOptions = useMemo(
    () => [...new Set(ITEMS.map((i) => i.date?.split("T")[0]).filter(Boolean))] as string[],
    []
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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

  /* ---------------- RENDER: List ---------------- */
  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: (typeof ITEMS)[] = Array.from({ length: columnCount }, () => []);
  filteredItems.forEach((item, i) => columns[i % columnCount].push(item));

  const showHeader = !!onBack;

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
        {/* Journey Planner */}
        <View
          style={{
            maxWidth: 1600,
            alignSelf: "center",
            width: "100%",
            marginBottom: spacing(4),
            // FIX: establish a new stacking context so the dropdowns
            // inside can rise above the masonry board below.
            zIndex: 10,
            position: "relative",
          }}
        >
          <View
            style={[
              styles.journeyBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isDesktop ? "row" : "column",
              },
            ]}
          >
            <Selector
              label="From"
              value={from}
              placeholder="Select origin"
              pickerType="from"
              options={fromOptions}
              colors={colors}
              active={openPicker === "from"}
              onToggle={handleTogglePicker}
              onSelect={setFrom}
            />

            {!isDesktop ? (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginHorizontal: spacing(3),
                }}
              />
            ) : (
              <View
                style={{
                  width: 1,
                  backgroundColor: colors.border,
                  marginVertical: spacing(2),
                }}
              />
            )}

            <Selector
              label="To"
              value={to}
              placeholder="Select destination"
              pickerType="to"
              options={toOptions}
              colors={colors}
              active={openPicker === "to"}
              onToggle={handleTogglePicker}
              onSelect={setTo}
            />

            {!isDesktop ? (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginHorizontal: spacing(3),
                }}
              />
            ) : (
              <View
                style={{
                  width: 1,
                  backgroundColor: colors.border,
                  marginVertical: spacing(2),
                }}
              />
            )}

            <Selector
              label="Date"
              value={journeyDate}
              placeholder="Select date"
              pickerType="date"
              options={dateOptions}
              colors={colors}
              active={openPicker === "date"}
              onToggle={handleTogglePicker}
              onSelect={setJourneyDate}
              formatOption={formatDate}
            />
          </View>

          {/* FIX: !! forces boolean so "" is not rendered as a text node */}
          {!!(from || to || journeyDate) && (
            <Pressable
              onPress={() => {
                setFrom("");
                setTo("");
                setJourneyDate("");
                setOpenPicker(null);
              }}
              style={{
                alignSelf: "flex-end",
                marginTop: spacing(2),
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Feather name="x-circle" size={14} color={colors.gold} />
              <Text
                style={{
                  color: colors.gold,
                  fontFamily: fontFamilies.bodySemi,
                  fontSize: 13,
                }}
              >
                Clear filters
              </Text>
            </Pressable>
          )}
        </View>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: spacing(10) }}>
            <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body }}>
              No buses match your search.
            </Text>
          </View>
        )}

        {/* Masonry Board */}
        <View style={styles.board}>
          {columns.map((col, ci) => (
            <View key={ci} style={styles.column}>
              {col.map((pin) => (
                <Pressable
                  key={pin.id}
                  style={styles.pinWrap}
                  onPress={() => handleSelectTicket(pin)}
                >
                  <View
                    style={[
                      styles.pinCard,
                      {
                        backgroundColor: colors.surface,
                        shadowColor: colors.shadow,
                      },
                    ]}
                  >
                    <View style={styles.imageWrap}>
                      <Image
                        source={pin.image}
                        style={[styles.pinImage, { height: 280 }]}
                        resizeMode="cover"
                      />
                      <View style={styles.saveOverlay}>
                        <Pressable
                          style={[
                            styles.saveBtn,
                            { backgroundColor: colors.gold },
                          ]}
                          onPress={() => handleSelectTicket(pin)}
                        >
                          <Text
                            style={[
                              styles.saveText,
                              {
                                color: colors.white,
                                fontFamily: fontFamilies.bodySemi,
                              },
                            ]}
                          >
                            Book Seat
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.pinBody}>
                      <Text
                        style={[
                          styles.pinTitle,
                          {
                            color: colors.ink,
                            fontFamily: fontFamilies.display,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {pin.title}
                      </Text>
                      <Text
                        style={[
                          styles.pinSubtitle,
                          {
                            color: colors.inkMuted,
                            fontFamily: fontFamilies.body,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {pin.subtitle}
                      </Text>
                      {pin.route && (
                        <Text
                          style={[styles.routeMini, { color: colors.inkMuted }]}
                        >
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

  /* Journey bar */
  journeyBar: {
    borderRadius: radii.xl,
    borderWidth: 1,
    // FIX: removed overflow: 'hidden' so absolutely-positioned dropdowns
    // are not clipped by this container on any platform.
  },
  selectorField: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
  },
  selectorLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: fontFamilies.body,
  },
  selectorValue: {
    fontSize: 14,
    fontFamily: fontFamilies.bodySemi,
  },
  optionsList: {
    // FIX: absolute positioning lets the dropdown float over the
    // masonry board and other content instead of pushing it down.
    position: "absolute",
    top: "100%",
    left: spacing(1),
    right: spacing(1),
    zIndex: 100,
    borderWidth: 1,
    borderRadius: radii.lg,
    marginTop: 4,
    paddingVertical: spacing(1),
    maxHeight: 220,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // FIX: elevation draws the dropdown above siblings on Android
    // where shadow* props alone do not create elevation.
    elevation: 10,
  },
  optionItem: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
  },

  /* Masonry */
  board: {
    flexDirection: "row",
    gap: spacing(3),
    alignItems: "flex-start",
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
  },
  column: { flex: 1, gap: spacing(3) },
  pinWrap: { width: "100%", marginBottom: spacing(3) },
  pinCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: { position: "relative", width: "100%" },
  pinImage: { width: "100%" },
  saveOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: spacing(3),
  },
  saveBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  saveText: { fontSize: 13 },
  pinBody: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(3),
    paddingBottom: spacing(3.5),
    gap: 4,
  },
  pinTitle: { fontSize: 14, lineHeight: 18 },
  pinSubtitle: { fontSize: 12 },
  routeMini: { fontSize: 11, marginTop: 2 },
});
