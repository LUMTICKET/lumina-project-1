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
    id: "pop-1",
    title: "Night Garden Fest",
    subtitle: "Flashback event coverage",
    category: "event",
    image: require("@/assets/images/event1.jpg"),
    organizer: "Night Garden Team",
    organizerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    date: "2026-12-15T18:00:00",
    time: "6:00 PM",
    location: "Lekki Conservation Centre",
    tiers: [
      { id: "early", name: "Early Bird", price: 10000, currency: "MWK", perks: ["General Access", "Free Drink"], remaining: 45 },
      { id: "vip", name: "VIP Table", price: 50000, currency: "MWK", perks: ["Front Row", "Free Food & Drinks", "Meet & Greet"], remaining: 12 },
      { id: "vvip", name: "VVIP", price: 150000, currency: "MWK", perks: ["Backstage", "All Access", "Private Lounge"], remaining: 3 },
    ],
    description: "The most magical night of the year returns. Live bands, garden lights, food trucks, and an unforgettable Afrobeat experience under the stars.",
    tags: ["Festival", "Music", "Lagos"],
    maxPerUser: 4,
  },
  {
    id: "pop-2",
    title: "Burna Boy Live",
    subtitle: "The African Giant returns home",
    category: "event",
    image: require("@/assets/images/event6.jpg"),
    organizer: "Live Nation NG",
    date: "2026-01-20T19:00:00",
    time: "7:00 PM",
    location: "Tafawa Balewa Stadium",
    tiers: [
      { id: "regular", name: "Regular", price: 15000, currency: "MWK", perks: ["Standing"], remaining: 200 },
      { id: "vip", name: "VIP", price: 50000, currency: "MWK", perks: ["Seated", "Free Merch"], remaining: 48 },
    ],
    description: "Witness history at the biggest concert of the year. VIP tickets restocked for a limited time only.",
    tags: ["Concert", "VIP", "Restocked"],
    maxPerUser: 6,
  },
];

export default function PopularTickets() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [activeTicket, setActiveTicket] = useState<TicketConfig | null>(null);

  if (activeTicket) {
    return (
      <TicketConfigPage
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onPurchase={(payload) => {
          console.log("Purchase payload:", payload);
          setActiveTicket(null);
        }}
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
                    <Image source={pin.image} style={[styles.pinImage, { height: 320 }]} resizeMode="cover" />
                    <View style={styles.saveOverlay}>
                      <Pressable style={[styles.saveBtn, { backgroundColor: colors.gold }]}>
                        <Text style={[styles.saveText, { color: colors.white, fontFamily: fontFamilies.bodySemi }]}>Get Ticket</Text>
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