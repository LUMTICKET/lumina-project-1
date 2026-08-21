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
    id: "flt-1",
    title: "Malawi Airlines - Lilongwe to Johannesburg",
    subtitle: "Non-stop flight, daily connections",
    category: "flight",
    image: require("@/assets/images/malawi_airlines2.jpg"),
    organizer: "Malawi Airlines",
    date: "2026-08-10T10:20:00",
    time: "10:20 AM",
    location: "Kamuzu International Airport (LLW)",
    route: {
      from: "Lilongwe (LLW)",
      to: "Johannesburg (JNB",
      duration: "2h 15m",
    },
     tiers: [
      { id: "economy", name: "Economy", price: 350000, currency: "MWK", perks: ["23kg Baggage", "Meals"], remaining: 45 },
      { id: "business", name: "Business", price: 850000, currency: "MWK", perks: ["Priority Boarding", "Lounge Access", "Extra Legroom"], remaining: 8 },
    ],
    description: "Fly non-stop from Kamuzu International Airport to O.R. Tambo International Airport in Johannesburg. Part of Malawi Airlines' expanded schedule, positioning Lilongwe as a regional aviation hub with up to 10 weekly frequencies.",
    tags: ["Flight", "International", "Johannesburg"],
    maxPerUser: 4,
  },
  {
    id: "flt-2",
    title: "Chileka to Pretoria (via Johannesburg",
    subtitle: "Flight + connecting shuttle to Pretoria",
    category: "flight",
    image: require("@/assets/images/malawi_airlines.jpg"),
    organizer: "South African Airlink",
    date: "2026-08-06T14:10:00",
    time: "2:10 PM",
    location: "Chileka International Airport (BLZ)",
    route: {
      from: "Blantyre (BLZ)",
      to: "Pretoria (via OR Tambo, JNB)",
      duration: "2h 25m + 40m transfer", 
    },
   tiers: [
      { id: "one-way", name: "One Way", price: 320000, currency: "MWK", perks: ["Guaranteed Seat", "OR Tambo Shuttle Transfer"], remaining: 30 },
      { id: "return", name: "Return", price: 580000, currency: "MWK", perks: ["Flexible Return", "OR Tambo Shuttle Transfer"], remaining: 20 },
    ],
    description: "Fly non-stop from Chileka International Airport to OR Tambo International in Johannesburg, then connect via a reliable shuttle service to Pretoria — about a 40-minute drive covering the final 45km into the city.",
    tags: ["Flight", "Shuttle", "South Africa"],
    maxPerUser: 6,
  },
];

interface FlightTicketsProps {
  onSelectTicket?: (ticket: TicketConfig) => void;
  onBack?: () => void;
}

export default function FlightTickets({ onSelectTicket, onBack }: FlightTicketsProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: (typeof ITEMS)[] = Array.from({ length: columnCount }, () => []);
  ITEMS.forEach((item, i) => columns[i % columnCount].push(item));

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
            Flight Tickets
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
        <View style={styles.board}>
          {columns.map((col, ci) => (
            <View key={ci} style={styles.column}>
              {col.map((pin) => (
                <Pressable key={pin.id} style={styles.pinWrap} onPress={() => onSelectTicket?.(pin)}>
                  <View style={[styles.pinCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                    <View style={styles.imageWrap}>
                      <Image source={pin.image} style={[styles.pinImage, { height: 280 }]} resizeMode="cover" />
                      <View style={styles.saveOverlay}>
                        <Pressable 
                          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                          onPress={() => onSelectTicket?.(pin)}
                        >
                          <Text style={[styles.saveText, { color: colors.white, fontFamily: fontFamilies.bodySemi }]}>Book Flight</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.pinBody}>
                      <Text style={[styles.pinTitle, { color: colors.ink, fontFamily: fontFamilies.display }]} numberOfLines={2}>{pin.title}</Text>
                      <Text style={[styles.pinSubtitle, { color: colors.inkMuted, fontFamily: fontFamilies.body }]} numberOfLines={1}>{pin.subtitle}</Text>
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
});
