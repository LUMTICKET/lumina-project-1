import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

const CATEGORIES = [
  "All",
  "Events",
  "Buses",
  "Courier",
  "Tickets",
  "Festivals",
  "Tours",
  "Sports",
  "Concerts",
  "Workshops",
];

const RESULTS = [
  {
    id: "s1",
    title: "Afrobeat Night Lagos",
    subtitle: "Eko Hotel • Dec 15",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop",
    height: 340,
    tag: "Events",
  },
  {
    id: "s2",
    title: "Abuja Express Coach",
    subtitle: "Daily departures • MWK 4,500",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop",
    height: 220,
    tag: "Buses",
  },
  {
    id: "s3",
    title: "Same-Day Delivery",
    subtitle: "Lagos to Ibadan • Live track",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop",
    height: 300,
    tag: "Courier",
  },
  {
    id: "s4",
    title: "Night Garden Fest",
    subtitle: "Flashback event • Sold out",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop",
    height: 380,
    tag: "Events",
  },
  {
    id: "s5",
    title: "Luxury Bus to Accra",
    subtitle: "VIP seats • MWK 25,000",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop",
    height: 260,
    tag: "Buses",
  },
  {
    id: "s6",
    title: "Package Insurance",
    subtitle: "Fragile goods • Full cover",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop",
    height: 240,
    tag: "Courier",
  },
  {
    id: "s7",
    title: "Comedy Central Live",
    subtitle: "Muson Centre • Jan 10",
    image: "https://images.unsplash.com/photo-1503095392237-fc55088350b9?w=600&auto=format&fit=crop",
    height: 320,
    tag: "Events",
  },
  {
    id: "s8",
    title: "Interstate Shuttle",
    subtitle: "Enugu–PH • Book now",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop",
    height: 200,
    tag: "Buses",
  },
  {
    id: "s9",
    title: "Food & Wine Expo",
    subtitle: "Ticket: MWK 10,000",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop",
    height: 360,
    tag: "Tickets",
  },
  {
    id: "s10",
    title: "Express Cargo",
    subtitle: "Bulk delivery • 24h",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop",
    height: 280,
    tag: "Courier",
  },
  {
    id: "s11",
    title: "Jazz Under the Stars",
    subtitle: "Ikoyi • Dec 22",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop",
    height: 330,
    tag: "Events",
  },
  {
    id: "s12",
    title: "Coastal Route Pass",
    subtitle: "Lekki–Epe scenic",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop",
    height: 270,
    tag: "Buses",
  },
];

export default function SearchPage() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns = Array.from({ length: columnCount }, () => [] as typeof RESULTS);
  RESULTS.forEach((pin, index) => {
    columns[index % columnCount].push(pin);
  });

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [query, setQuery] = useState("");

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchBarWrap,
          {
            backgroundColor: colors.bgAlt,
            borderBottomColor: colors.border,
          },
          isDesktop && Platform.OS === "web"
            ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
            : {},
        ]}
      >
        <View style={styles.searchBarInner}>
          <View style={[styles.searchBar, { backgroundColor: colors.bgAlt }]}>
            <Feather name="search" size={20} color={colors.inkMuted} />
            <TextInput
              placeholder="Search events, buses, courier..."
              placeholderTextColor={colors.inkMuted}
              value={query}
              onChangeText={setQuery}
              style={[
                styles.searchInput,
                { color: colors.ink, fontFamily: fontFamilies.body },
              ]}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Feather name="x" size={18} color={colors.inkMuted} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Category Pills */}
      <View
        style={[
          styles.pillsWrapper,
          {
            backgroundColor: colors.bgAlt,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
        >
          {CATEGORIES.map((cat, index) => {
            const isSelected = index === selectedCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(index)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.gold : colors.bgAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isSelected ? colors.black : colors.ink,
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Masonry Results */}
      <View
        style={[
          styles.board,
          {
            paddingHorizontal: isDesktop ? spacing(6) : spacing(2),
            paddingTop: spacing(4),
            paddingBottom: isDesktop ? spacing(10) : spacing(20),
          },
        ]}
      >
        {columns.map((column, colIndex) => (
          <View key={`col-${colIndex}`} style={styles.column}>
            {column.map((pin) => (
              <Pressable key={pin.id} style={styles.pinWrap}>
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
                      source={{ uri: pin.image }}
                      style={[styles.pinImage, { height: pin.height }]}
                      resizeMode="cover"
                    />
                    <View style={styles.saveOverlay}>
                      <Pressable
                        style={[styles.saveBtn, { backgroundColor: colors.gold }]}
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
                          Book
                        </Text>
                      </Pressable>
                    </View>
                    <View style={[styles.tagPill, { backgroundColor: colors.black + "CC" }]}>
                      <Text style={[styles.tagText, { color: colors.white }]}>
                        {pin.tag}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pinBody}>
                    <Text
                      style={[
                        styles.pinTitle,
                        { color: colors.ink, fontFamily: fontFamilies.display },
                      ]}
                      numberOfLines={2}
                    >
                      {pin.title}
                    </Text>
                    <Text
                      style={[
                        styles.pinSubtitle,
                        { color: colors.inkMuted, fontFamily: fontFamilies.body },
                      ]}
                      numberOfLines={1}
                    >
                      {pin.subtitle}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  searchBarWrap: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6),
  },
  searchBarInner: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  searchBar: {
    height: 48,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  pillsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
  },
  pillsContent: {
    paddingHorizontal: spacing(3),
    gap: spacing(2),
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    borderRadius: radii.full,
  },
  pillText: {
    fontSize: 14,
  },
  board: {
    flexDirection: "row",
    gap: spacing(3),
    alignItems: "flex-start",
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
  },
  column: {
    flex: 1,
    gap: spacing(3),
  },
  pinWrap: {
    width: "100%",
  },
  pinCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
  },
  pinImage: {
    width: "100%",
    borderBottomWidth: 1,
  },
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
  saveText: {
    fontSize: 13,
  },
  tagPill: {
    position: "absolute",
    bottom: spacing(2),
    left: spacing(2),
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  pinBody: {
    padding: spacing(3),
    gap: 3,
  },
  pinTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  pinSubtitle: {
    fontSize: 12,
  },
});