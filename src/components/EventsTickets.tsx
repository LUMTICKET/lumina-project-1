import { Feather } from "@expo/vector-icons";
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
import { TicketConfig } from "./TicketConfigPage";

const ITEMS: TicketConfig[] = [
  {
    id: "evt-1",
    title: "Goshen City Dedza Dynamos vs FCB Nyasa Big Bullets",
    subtitle: "FDH Bank Premiership matchday",
    category: "event",
    image: require("@/assets/images/event3.jpg"),
    organizer: "Super League of Malawi (SULOM)",
    date: "2026-05-31T14:30:00",
    time: "2:30 PM",
    location: "Bingu National Stadium, Lilongwe",
    tiers: [
      { id: "regular", name: "Open Stand", price: 4000, currency: "MWK", perks: ["General Access"], remaining: 120 },
      { id: "vip", name: "VIP Stand", price: 150000, currency: "MWK", perks: ["Covered Seating", "Premium View"], remaining: 15 },
    ],
    description:  "The People's Team travel to face Goshen City Dedza Dynamos in an FDH Bank Premiership clash. Expect a tightly contested matchday as Dedza Dynamos look to upset the league heavyweights on home turf.",
    tags: ["Football", "FDH Premiership", "Malawi"],
    maxPerUser: 8,
  },
  {
    id: "evt-2",
    title: "Lilongwe Food Fest",
    subtitle: "A taste of Malawi and beyond",
    category: "event",
    image: require("@/assets/images/event2.jpg"),
    organizer: "Saba's Kitchen",
    date: "2026-08-30T10:00:00",
    time: "10:00 AM",
    location: "Portuguese Club, Lilongwe",
    tiers: [
      { id: "day1", name: "Entry Pass", price: 5000, currency: "MWK", perks: ["Food Stall Access", "Tastings"], remaining: 500 },
      { id: "stall", name: "Stall Booking", price: 20000, currency: "MWK", perks: ["Vendor Table", "Priority Setup"], remaining: 30 },
    ],
    description: "A celebration of local and international cuisine at the Portuguese Club. Food vendors, tastings, and a lively atmosphere for everyone to enjoy — book your stall or grab an entry pass to explore the flavors on offer.",
    tags: ["Food", "Festival", "Lilongwe"],
    maxPerUser: 4,
  },
];

interface EventsTicketsProps {
  onSelectTicket?: (ticket: TicketConfig) => void;
  onBack?: () => void;
}

export default function EventsTickets({ onSelectTicket, onBack }: EventsTicketsProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const isTwoCol = width >= 768;

  const showHeader = !!onBack;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
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
            Events Tickets
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
          <View style={styles.grid}>
            {ITEMS.map((ticket) => (
              <Pressable
                key={ticket.id}
                onPress={() => onSelectTicket?.(ticket)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    shadowColor: colors.shadow,
                    width: isTwoCol ? "48.5%" : "100%",
                  },
                ]}
              >
                <View style={styles.cardImageWrap}>
                  <Image source={ticket.image} style={styles.cardImage} resizeMode="cover" />
                </View>

                <View style={styles.cardBody}>
                  <View>
                    <View style={styles.organizerRow}>
                      <Text style={[styles.organizerText, { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi }]} numberOfLines={1}>
                        {ticket.organizer}
                      </Text>
                      <Feather name="chevron-right" size={14} color={colors.inkMuted} />
                    </View>

                    <Text style={[styles.cardTitle, { color: colors.ink, fontFamily: fontFamilies.display }]} numberOfLines={2}>
                      {ticket.title}
                    </Text>

                    <Text style={[styles.cardMeta, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                      {ticket.date ? new Date(ticket.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""} · {ticket.time}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.priceText, { color: colors.gold, fontFamily: fontFamilies.bodySemi }]}>
                      From {ticket.tiers?.[0]?.price.toLocaleString() || "0"} {ticket.tiers?.[0]?.currency || "MWK"}
                    </Text>

                    <Pressable style={[styles.starBtn, { backgroundColor: colors.bgAlt }]}>
                      <Feather name="arrow-right" size={18} color={colors.ink} />
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
    marginTop: Platform.OS === "web" ? 0 : 40,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
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