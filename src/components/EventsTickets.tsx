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
    id: "evt-1",
    title: "Detty December Afrobeat Night",
    subtitle: "Live performances under the stars",
    category: "event",
    image: require("@/assets/images/event3.jpg"),
    organizer: "Eko Hotel & Suites",
    date: "2026-12-15T20:00:00",
    time: "8:00 PM",
    location: "Eko Hotel, Lagos",
    tiers: [
      { id: "regular", name: "Regular", price: 15000, currency: "MWK", perks: ["General Access"], remaining: 120 },
      { id: "vip", name: "VIP Table", price: 150000, currency: "MWK", perks: ["Table Service", "Free Drinks"], remaining: 15 },
    ],
    description: "Detty December kicks off this Friday! Afrobeat Night under the stars with live performances from top artists. Limited VIP tables remaining.",
    tags: ["Events", "Afrobeat", "Lagos"],
    maxPerUser: 8,
  },
  {
    id: "evt-2",
    title: "Food & Wine Expo",
    subtitle: "Taste over 50 cuisines",
    category: "event",
    image: require("@/assets/images/event2.jpg"),
    organizer: "Food & Wine NG",
    date: "2026-02-14T10:00:00",
    time: "10:00 AM",
    location: "Eko Atlantic",
    tiers: [
      { id: "day1", name: "Day Pass", price: 8000, currency: "MWK", perks: ["All Tastings"], remaining: 500 },
      { id: "weekend", name: "Weekend Pass", price: 20000, currency: "MWK", perks: ["Chef Masterclass", "Wine Tasting"], remaining: 200 },
    ],
    description: "Taste over 50 local and international cuisines. Wine tasting sessions, chef masterclasses, and live cooking demos all weekend long.",
    tags: ["Food", "Wine", "Expo"],
    maxPerUser: 4,
  },
];

export default function EventsTickets() {
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