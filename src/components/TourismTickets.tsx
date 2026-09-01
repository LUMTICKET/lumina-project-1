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
            Tourism Tickets
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
                      <Image source={pin.image} style={[styles.pinImage, { height: 300 }]} resizeMode="cover" />
                      <View style={styles.saveOverlay}>
                        <Pressable 
                          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                          onPress={() => onSelectTicket?.(pin)}
                        >
                          <Text style={[styles.saveText, { color: colors.white, fontFamily: fontFamilies.bodySemi }]}>Book Tour</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.pinBody}>
                      <Text style={[styles.pinTitle, { color: colors.ink, fontFamily: fontFamilies.display }]} numberOfLines={2}>{pin.title}</Text>
                      <Text style={[styles.pinSubtitle, { color: colors.inkMuted, fontFamily: fontFamilies.body }]} numberOfLines={1}>{pin.subtitle}</Text>
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
});
