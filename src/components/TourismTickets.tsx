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
    id: "tour-1",
    title: "Lilongwe Wildlife Centre Tour",
    subtitle: "Guided walks through Malawi's wildlife sanctuary",
    category: "tourism",
    image: require("@/assets/images/tourism2.jpg"),
    organizer: "Lilongwe Wildlife Trust",
    date: "2026-09-10T08:00:00",
    time: "8:00 AM",
    location: "Lilongwe Wildlife Centre, Lilongwe",
    tiers: [
      { id: "solo", name: "Standard Entry", price: 6000, currency: "MWK", perks: ["1-Hour Guided Sanctuary Tour", "Nature Trail Access"], remaining: 40 },
      { id: "group", name: "Group Conservation Session", price: 45000, currency: "MWK", perks: ["Dedicated Guide", "Education Team Session", "Trail Access for 8"], remaining: 10 },
    ],
    description: "Explore a 70-hectare nature reserve in the heart of Lilongwe, home to rescued vervet monkeys, crocodiles, jackals and over 200 bird species. Walk the elevated boardwalk and 4km of trails along the Lingadzi River, or join a guided sanctuary tour to learn about the Trust's conservation work.",
    tags: ["Wildlife", "Nature", "Conservation"],
    maxPerUser: 2,
  },
  {
    id: "tour-2",
    title: "Mount Mulanje Sapitwa Trek",
    subtitle: "Summit Malawi's highest peak",
    category: "tourism",
    image: require("@/assets/images/tourism.jpg"),
    organizer: "Mulanje Mountain Guides",
    date: "2026-08-12T07:00:00",
    time: "7:00 AM",
    location: "Likhubula Forest Lodge, Mulanje",
    tiers: [
      { id: "standard", name: "Standard Trek", price: 45000, currency: "MWK", perks: ["Registered Guide", "2 Nights in Mountain Huts"], remaining: 100 },
      { id: "group", name: "Group Trek", price: 150000, currency: "MWK", perks: ["Guide for up to 10", "Porter Option", "3-Day/2-Night Hike"], remaining: 30 },
    ],
    description: "Trek to Sapitwa Peak, Central Africa's highest point at 3,002m. Starting from Likhubula Forest, this 3-day guided hike takes you past waterfalls and natural swimming pools, staying overnight in mountain huts along the way.",
    tags: ["Hiking", "Nature", "Mulanje"],
    maxPerUser: 3,
  },
];

interface TourismTicketsProps {
  onSelectTicket?: (ticket: TicketConfig) => void;
  onBack?: () => void;
}

export default function TourismTickets({ onSelectTicket, onBack }: TourismTicketsProps) {
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
            Tourism Tickets
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