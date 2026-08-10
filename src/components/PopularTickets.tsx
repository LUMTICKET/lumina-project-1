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
    id: "pop-1",
    title: "LandLord Pakwawo",
    subtitle: "Gwamba's Landlord Pakwao Concert ft. Ruger",
    category: "event",
    image: require("@/assets/images/event1.jpg"),
    organizer: "Landlord Entertainment",
    organizerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    date: "2026-12-15T18:00:00",
    time: "6:00 PM",
    location: "Bingu National Stadium, Lilongwe",
    tiers: [
      { id: "early", name: "Early Bird", price: 10000, currency: "MWK", perks: ["General Access", "Free Drink"], remaining: 45 },
      { id: "vip", name: "VIP Table", price: 50000, currency: "MWK", perks: ["Front Row", "Free Food & Drinks", "Meet & Greet"], remaining: 12 },
      { id: "vvip", name: "VVIP", price: 150000, currency: "MWK", perks: ["Backstage", "All Access", "Private Lounge"], remaining: 3 },
    ],
    description: "Rapper Gwamba, known as 'The Landlord,' hosts the biggest concert of the year celebrating his musical journey, with Nigerian Afrobeats star Ruger headlining alongside a stacked lineup including Zeze Kingston, Eli Njuchi, Teddy Makadi, Miracle Chinga, Kell Kay, and more. Gates open at noon, performances kick off at 4 PM, with Gwamba and Ruger closing out the night.",
    tags: ["Concert", "Music", "Lilongwe"],
    maxPerUser: 4,
  },
  {
    id: "pop-2",
    title: "Ku Mingoli Bash",
    subtitle: "Pool Party Edition — poolside music & vibes",
    category: "event",
    image: require("@/assets/images/event6.jpg"),
    organizer: "Sound Addicts Live",
    date: "2026-07-18T15:00:00",
    time: "3:00 PM",
    location: "Aero Lounge, Lilongwe",
    tiers: [
      { id: "regular", name: "Regular", price: 15000, currency: "MWK", perks: ["Standing"], remaining: 200 },
      { id: "vip", name: "VIP", price: 50000, currency: "MWK", perks: ["Seated", "Free Merch"], remaining: 48 },
    ],
    description: "The ultimate poolside lifestyle experience returns, blending music, fashion, and energy in one unforgettable setting. Featuring Patience Namadingo, Zeze Kingston, Teddy Makadi, Lady Aika, Skeffa Chimoto, Lulu, and more, powered by De Oasis.",
    tags: ["Concert", "Pool Party", "Lilongwe"],
    maxPerUser: 6,
  },
];

interface PopularTicketsProps {
  onSelectTicket?: (ticket: TicketConfig) => void;
  onBack?: () => void;
}

export default function PopularTickets({ onSelectTicket, onBack }: PopularTicketsProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: Array<typeof ITEMS> = Array.from({ length: columnCount }, () => []);
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
            Popular Tickets
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
                      <Image source={pin.image} style={[styles.pinImage, { height: 320 }]} resizeMode="cover" />
                      <View style={styles.saveOverlay}>
                        <Pressable 
                          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                          onPress={() => onSelectTicket?.(pin)}
                        >
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