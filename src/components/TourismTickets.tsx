import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import TicketConfigPage, { TicketConfig } from "./TicketConfigPage";

const ITEMS: TicketConfig[] = [
  {
    id: "tour-1",
    title: "Mountain Hike Adventure",
    subtitle: "Guided trail adventures",
    category: "tourism",
    image: require("@/assets/images/event4.jpg"),
    organizer: "Wild Trails NG",
    date: "2026-09-10T05:30:00",
    time: "5:30 AM",
    location: "Obudu Cattle Ranch",
    tiers: [
      { id: "solo", name: "Solo Hiker", price: 25000, currency: "MWK", perks: ["Guide", "Water"], remaining: 20 },
      { id: "group", name: "Group of 5", price: 100000, currency: "MWK", perks: ["Private Guide", "Meals", "Camping Gear"], remaining: 5 },
    ],
    description: "Guided trail adventures through Nigeria's most breathtaking mountain ranges. All safety equipment included.",
    tags: ["Hiking", "Nature", "Adventure"],
    maxPerUser: 2,
  },
  {
    id: "tour-2",
    title: "Lekki Conservation Tour",
    subtitle: "Wildlife and canopy walk",
    category: "tourism",
    image: require("@/assets/images/event1.jpg"),
    organizer: "Lekki Conservation",
    date: "2026-08-12T09:00:00",
    time: "9:00 AM",
    location: "Lekki Conservation Centre",
    tiers: [
      { id: "standard", name: "Standard", price: 5000, currency: "MWK", perks: ["Canopy Walk"], remaining: 100 },
      { id: "family", name: "Family Pack", price: 18000, currency: "MWK", perks: ["4 Tickets", "Guided Tour"], remaining: 30 },
    ],
    description: "Explore the longest canopy walk in Africa and experience wildlife in its natural habitat.",
    tags: ["Family", "Nature", "Lagos"],
    maxPerUser: 3,
  },
];

export default function TourismTickets() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [activeTicket, setActiveTicket] = useState<TicketConfig | null>(null);

  if (activeTicket) {
    return (
      <TicketConfigPage
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onPurchase={(p) => { console.log(p); setActiveTicket(null); }}
      />
    );
  }

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: Array<typeof ITEMS> = Array.from({ length: columnCount }, () => []);
  ITEMS.forEach((item, i) => columns[i % columnCount].push(item));

  return (
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
              <Pressable key={pin.id} style={styles.pinWrap} onPress={() => setActiveTicket(pin)}>
                <View style={[styles.pinCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                  <View style={styles.imageWrap}>
                    <Image source={pin.image} style={[styles.pinImage, { height: 300 }]} resizeMode="cover" />
                    <View style={styles.saveOverlay}>
                      <Pressable style={[styles.saveBtn, { backgroundColor: colors.gold }]}>
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
  );
}

const styles = StyleSheet.create({
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