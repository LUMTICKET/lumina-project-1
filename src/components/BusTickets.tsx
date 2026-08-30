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
// Reusable selector
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
        position: "relative",
        zIndex: active ? 50 : 1,
        elevation: active ? 12 : 1,
      }}
    >
      <Pressable
        style={[
          styles.selectorField,
          { backgroundColor: colors.bgAlt },
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
            { backgroundColor: colors.bgAlt, borderColor: colors.border },
          ]}
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
  const isTwoCol = width >= 768;

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

  const lowestPrice = (ticket: TicketConfig) => {
    if (!ticket.tiers || ticket.tiers.length === 0) return 0;
    return Math.min(...ticket.tiers.map((t) => t.price));
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
          paddingHorizontal: isDesktop ? spacing(6) : spacing(3),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(10) : spacing(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 1200, alignSelf: "center", width: "100%" }}>
          {/* Journey Planner — now at the very top */}
          <View
            style={{
              width: "100%",
              marginBottom: spacing(5),
              zIndex: 10,
              position: "relative",
            }}
          >
            <View
              style={[
                styles.journeyBar,
                {
                  backgroundColor: colors.bgAlt,
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

          {/* Responsive grid — 1 col mobile, 2 col desktop */}
          <View style={styles.grid}>
            {filteredItems.map((ticket) => (
              <Pressable
                key={ticket.id}
                onPress={() => handleSelectTicket(ticket)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    shadowColor: colors.shadow,
                    width: isTwoCol ? "48.5%" : "100%",
                  },
                ]}
              >
                {/* Left: square image */}
                <View style={styles.cardImageWrap}>
                  <Image
                    source={ticket.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Right: content */}
                <View style={styles.cardBody}>
                  <View>
                    {/* Organizer row */}
                    <View style={styles.organizerRow}>
                      <Text
                        style={[
                          styles.organizerText,
                          { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi },
                        ]}
                        numberOfLines={1}
                      >
                        {ticket.organizer}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={14}
                        color={colors.inkMuted}
                      />
                    </View>

                    {/* Title */}
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: colors.ink, fontFamily: fontFamilies.display },
                      ]}
                      numberOfLines={2}
                    >
                      {ticket.title}
                    </Text>

                    {/* Meta line */}
                    <Text
                      style={[
                        styles.cardMeta,
                        { color: colors.inkMuted, fontFamily: fontFamilies.body },
                      ]}
                    >
                      {formatDate(ticket.date)} at {ticket.time} · {ticket.route.from} → {ticket.route.to}
                    </Text>
                  </View>

                  {/* Footer: price + star */}
                  <View style={styles.cardFooter}>
                    <Text
                      style={[
                        styles.priceText,
                        { color: colors.gold, fontFamily: fontFamilies.bodySemi },
                      ]}
                    >
                      From {lowestPrice(ticket).toLocaleString()} {ticket.tiers?.[0]?.currency || "MWK"}
                    </Text>

                    <Pressable
                      style={[
                        styles.starBtn,
                        { backgroundColor: colors.bgAlt },
                      ]}
                    >
                      <Feather name="star" size={18} color={colors.inkMuted} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
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
    elevation: 10,
  },
  optionItem: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
  },

  /* Responsive grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* Horizontal card — image left, content right */
  card: {
    flexDirection: "row",
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing(3),
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImageWrap: {
    width: "38%",
    aspectRatio: 1,
    backgroundColor: "#1a1a1a",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    flex: 1,
    padding: spacing(3),
    justifyContent: "space-between",
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing(1),
  },
  organizerText: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing(0.5),
  },
  cardMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing(2),
  },
  priceText: {
    fontSize: 13,
  },
  starBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});