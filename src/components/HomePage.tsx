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
  "Travel",
  "Food",
  "DIY",
  "Home",
  "Fashion",
  "Art",
  "Quotes",
  "Music",
  "Fitness",
  "Tech",
];

const PINS = [
  {
    id: "1",
    title: "Night Garden Fest",
    subtitle: "Flashback event coverage",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop",
    height: 320,
  },
  {
    id: "2",
    title: "Airport Express",
    subtitle: "Coach and bus booking",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop",
    height: 240,
  },
  {
    id: "3",
    title: "Courier Route",
    subtitle: "Delivery progress tracking",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop",
    height: 380,
  },
  {
    id: "4",
    title: "Weekend Bazaar",
    subtitle: "Booked tickets and curated plans",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop",
    height: 260,
  },
  {
    id: "5",
    title: "City Loop",
    subtitle: "Multiple stops, one journey",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop",
    height: 300,
  },
  {
    id: "6",
    title: "On Time Delivery",
    subtitle: "Tracking every checkpoint",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop",
    height: 220,
  },
  {
    id: "7",
    title: "Sunset Concert",
    subtitle: "Live music under the stars",
    image: "https://images.unsplash.com/photo-1459749411177-047381bb3ece?w=600&auto=format&fit=crop",
    height: 340,
  },
  {
    id: "8",
    title: "Urban Bus Tour",
    subtitle: "See the city in comfort",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop",
    height: 200,
  },
  {
    id: "9",
    title: "Package Drop",
    subtitle: "Same-day courier service",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop",
    height: 280,
  },
  {
    id: "10",
    title: "Food Festival",
    subtitle: "Taste the world",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop",
    height: 360,
  },
  {
    id: "11",
    title: "Mountain Hike",
    subtitle: "Guided trail adventures",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format&fit=crop",
    height: 250,
  },
  {
    id: "12",
    title: "Theatre Night",
    subtitle: "Drama and performances",
    image: "https://images.unsplash.com/photo-1503095392237-fc55088350b9?w=600&auto=format&fit=crop",
    height: 310,
  },
  {
    id: "13",
    title: "Express Lane",
    subtitle: "Fast-track bus passes",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop",
    height: 190,
  },
  {
    id: "14",
    title: "Gift Box",
    subtitle: "Premium courier packaging",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop",
    height: 290,
  },
  {
    id: "15",
    title: "Jazz Club",
    subtitle: "Intimate live sessions",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop",
    height: 330,
  },
  {
    id: "16",
    title: "Coastal Route",
    subtitle: "Scenic bus journeys",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop",
    height: 270,
  },
  {
    id: "17",
    title: "Art Workshop",
    subtitle: "Create and inspire",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop",
    height: 350,
  },
  {
    id: "18",
    title: "Night Market",
    subtitle: "Street food and crafts",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&auto=format&fit=crop",
    height: 230,
  },
];

interface HomePageProps {
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

export default function HomePage({ onOpenAuth, onOpenSettings }: HomePageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: Array<typeof PINS> = Array.from({ length: columnCount }, () => []);
  PINS.forEach((pin, index) => {
    columns[index % columnCount].push(pin);
  });

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const iconOffset = Platform.OS !== "web" ? { marginTop: 20 } : {};

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Top bar: Search + Profile */}
      {isDesktop && (
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: colors.bg,
              borderBottomColor: colors.border,
            },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
              : {},
          ]}
        >
          <View style={styles.topBarInner}>
            <View
              style={[
                styles.desktopSearchBar,
                {
                  backgroundColor: colors.bgAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="search" size={20} color={colors.inkMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor={colors.inkMuted}
                selectionColor={colors.gold}
                style={[
                  styles.desktopSearchInput,
                  { color: colors.ink, fontFamily: fontFamilies.body },
                ]}
              />
            </View>

            <Pressable
              style={[
                styles.profilePoint,
                { backgroundColor: colors.bgAlt },
              ]}
              onPress={() => onOpenAuth?.()}
            >
              <Feather name="user" size={20} color={colors.ink} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Mobile search */}
      {!isDesktop && (
        <View style={[styles.mobileSearchWrap, { paddingHorizontal: spacing(3), paddingTop: spacing(3) }]}>
          <View style={styles.mobileActionRow}>
            <Pressable
              style={[
                styles.profilePoint,
                { backgroundColor: colors.bgAlt },
                iconOffset,
              ]}
              onPress={() => onOpenAuth?.()}
            >
              <Feather name="user" size={18} color={colors.ink} />
            </Pressable>

            <Pressable
              style={[
                styles.profilePoint,
                { backgroundColor: colors.bgAlt },
                iconOffset,
              ]}
              onPress={() => onOpenSettings?.()}
            >
              <Feather name="settings" size={18} color={colors.ink} />
            </Pressable>
          </View>
          <View
            style={[
              styles.mobileSearchBar,
              {
                backgroundColor: colors.bgAlt,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={20} color={colors.inkMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor={colors.inkMuted}
              selectionColor={colors.gold}
              style={[
                styles.mobileSearchInput,
                { color: colors.ink, fontFamily: fontFamilies.body },
              ]}
            />
          </View>
        </View>
      )}

      {/* Category Pills */}
      <View
        style={[
          styles.pillsWrapper,
          {
            backgroundColor: colors.bg,
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

      {/* Masonry Grid */}
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
                        style={[
                          styles.saveBtn,
                          { backgroundColor: colors.gold },
                        ]}
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
                          Save
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.pinBody}>
                    <Text
                      style={[
                        styles.pinTitle,
                        {
                          color: colors.ink,
                          fontFamily: fontFamilies.display,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {pin.title}
                    </Text>
                    <Text
                      style={[
                        styles.pinSubtitle,
                        {
                          color: colors.inkMuted,
                          fontFamily: fontFamilies.body,
                        },
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
  topBar: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6),
  },
  topBarInner: {
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
  },
  desktopSearchBar: {
    flex: 1,
    height: 56,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  mobileSearchBar: {
    width: "100%",
    height: 50,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  desktopSearchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  mobileSearchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  profilePoint: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileSearchWrap: {
    paddingBottom: spacing(2),
    gap: spacing(2),
  },
  mobileActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing(2),
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
    marginBottom: spacing(3),
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
  pinBody: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(3),
    paddingBottom: spacing(3.5),
    gap: 4,
  },
  pinTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  pinSubtitle: {
    fontSize: 12,
  },
});