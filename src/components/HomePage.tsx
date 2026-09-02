import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
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
import { fontFamilies, palette, radii, spacing } from "../theme/tokens";

interface HomePageProps {
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

interface EventItem {
  id: string;
  host: string;
  hostAvatar?: string;
  hostInitials?: string;
  hostColor?: string;
  title: string;
  date: string;
  interested: string;
  image: string;
}

const busTravellerItems: EventItem[] = [
  {
    id: "nyc-1",
    host: "Malawi Events Hub",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
    title: "Lilongwe City Weekend",
    date: "Sat, Sep 26 at 11am · Lilongwe",
    interested: "309 Interested",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=300&fit=crop",
  },
  {
    id: "nyc-2",
    host: "Chisomo Banda",
    hostInitials: "CB",
    hostColor: palette.navy,
    title: "Lake of Stars Warm Up",
    date: "Fri, Sep 25 at 6:30pm · Lilongwe",
    interested: "172 Interested",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=300&fit=crop",
  },
];

const airTravelItems: EventItem[] = [
  {
    id: "la-1",
    host: "Blantyre Social Club",
    hostInitials: "BSC",
    hostColor: palette.orange,
    title: "Blantyre Arts Night",
    date: "Sat, Sep 12 at 8:30pm · Blantyre",
    interested: "216 Interested",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop",
  },
  {
    id: "la-2",
    host: "Mzuzu Travel Collective",
    hostInitials: "MTC",
    hostColor: palette.emerald,
    title: "Northern Malawi Food Tour",
    date: "Sep 12 to Next Sun · Mzuzu",
    interested: "165 Interested",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop",
  },
];

const heroSlides = [
  {
    image: require("@/assets/images/event5.jpg"),
    title: "New events in Malawi",
    subtitle: "Find the latest experiences and reserve your tickets today.",
  },
  {
    image: require("@/assets/images/malawi_airlines2.jpg"),
    title: "Travel further",
    subtitle: "Explore new routes and make your next journey easier to book.",
  },
  {
    image: require("@/assets/images/tourism2.jpg"),
    title: "Your next escape",
    subtitle: "Discover scenic destinations and memorable trips across Malawi.",
  },
];

export default function HomePage({ onOpenAuth }: HomePageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const heroCarouselRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    heroCarouselRef.current?.scrollTo({
      x: activeHeroSlide * width,
      animated: true,
    });
  }, [activeHeroSlide, width]);

  const toggleSave = (id: string) => {
    setSavedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderHostAvatar = (event: EventItem) => {
    if (event.hostAvatar) {
      return (
        <Image
          source={{ uri: event.hostAvatar }}
          style={styles.hostAvatar}
          resizeMode="cover"
        />
      );
    }
    return (
      <View
        style={[
          styles.hostInitials,
          { backgroundColor: event.hostColor || colors.gold },
        ]}
      >
        <Text style={styles.hostInitialsText}>{event.hostInitials}</Text>
      </View>
    );
  };

  const renderEventCard = (event: EventItem) => {
    const isSaved = savedEvents.has(event.id);
    return (
      <Pressable
        key={event.id}
        style={({ pressed }) => [
          styles.eventCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.995 : 1 }],
          },
        ]}
      >
        <Image
          source={{ uri: event.image }}
          style={styles.thumb}
          resizeMode="cover"
        />

        <View style={styles.eventBody}>
          <View style={styles.hostRow}>
            {renderHostAvatar(event)}
            <Text
              style={[
                styles.hostName,
                { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi },
              ]}
              numberOfLines={1}
            >
              {event.host}
            </Text>
            <Feather
              name="chevron-right"
              size={14}
              color={colors.inkMuted}
            />
          </View>

          <Text
            style={[
              styles.eventTitle,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi },
            ]}
            numberOfLines={2}
          >
            {event.title}
          </Text>

          <Text
            style={[
              styles.eventMeta,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
            numberOfLines={1}
          >
            {event.date}
          </Text>

          <Text
            style={[
              styles.eventStats,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
            numberOfLines={1}
          >
            {event.interested}
          </Text>
        </View>

        <Pressable
          onPress={() => toggleSave(event.id)}
          style={[
            styles.starBtn,
            {
              borderColor: colors.border,
              backgroundColor: isSaved
                ? colors.surfaceAlt
                : "transparent",
            },
          ]}
        >
          <Feather
            name="star"
            size={16}
            color={isSaved ? colors.gold : colors.inkMuted}
          />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Hero ─── */}
      <View style={styles.hero}>
        <ScrollView
          ref={heroCarouselRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.heroCarousel}
        >
          {heroSlides.map((slide) => (
            <View key={slide.title} style={[styles.heroSlide, { width }]}>
              <Image
                source={slide.image}
                style={StyleSheet.absoluteFill}
                blurRadius={4}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.black, opacity: 0.55 },
          ]}
        />

        <View style={styles.heroTop}>
          {Platform.OS !== "android" && (
            <Pressable
              style={[
                styles.ghostBtn,
                { borderColor: colors.white },
              ]}
            >
              <Feather name="download" size={15} color={colors.white} />
              <Text
                style={[
                  styles.ghostBtnText,
                  { fontFamily: fontFamilies.bodySemi },
                ]}
              >
                Get the app
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.solidBtn} onPress={onOpenAuth}>
            <Feather name="log-in" size={15} color={colors.black} />
            <Text
              style={[
                styles.solidBtnText,
                { fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Login
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroContent}>
          <Text
            style={[
              styles.heroTitle,
              {
                color: colors.white,
                fontFamily: fontFamilies.display,
                fontSize: width > 600 ? 80 : 52,
                lineHeight: width > 600 ? 84 : 56,
              },
            ]}
          >
            {heroSlides[activeHeroSlide].title}
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              { color: colors.white, fontFamily: fontFamilies.body },
            ]}
          >
            {heroSlides[activeHeroSlide].subtitle}
          </Text>
          <Pressable style={styles.heroCta}>
            <Feather name="arrow-right" size={16} color={colors.black} />
            <Text
              style={[
                styles.heroCtaText,
                { fontFamily: fontFamilies.bodySemi },
              ]}
            >
              See more on the app
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ─── Cities ─── */}
      <View
        style={[
          styles.cities,
          {
            flexDirection: isDesktop ? "row" : "column",
            padding: width > 600 ? spacing(8) : spacing(4),
            gap: width > 600 ? spacing(10) : spacing(8),
          },
        ]}
      >
        <View style={{ flex: isDesktop ? 1 : undefined, gap: spacing(5) }}>
          <Text
            style={[
              styles.cityTitle,
              {
                color: colors.ink,
                fontFamily: fontFamilies.display,
                fontSize: width > 600 ? 40 : 32,
              },
            ]}
          >
            Bus travellers
          </Text>
          <View style={{ gap: spacing(4) }}>
            {busTravellerItems.map(renderEventCard)}
          </View>
        </View>

        <View style={{ flex: isDesktop ? 1 : undefined, gap: spacing(5) }}>
          <Text
            style={[
              styles.cityTitle,
              {
                color: colors.ink,
                fontFamily: fontFamilies.display,
                fontSize: width > 600 ? 40 : 32,
              },
            ]}
          >
            Air travellers
          </Text>
          <View style={{ gap: spacing(4) }}>
            {airTravelItems.map(renderEventCard)}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },

  hero: {
    width: "100%",
    minHeight: 420,
    justifyContent: "center",
    paddingHorizontal: spacing(6),
    paddingBottom: spacing(10),
    paddingTop: spacing(16),
  },
  heroCarousel: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSlide: {
    height: "100%",
    position: "relative",
  },
  heroTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing(3),
    paddingHorizontal: spacing(6),
    paddingTop: spacing(6),
    zIndex: 2,
  },
  ghostBtn: {
    backgroundColor: palette.navyDeep,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
  },
  ghostBtnText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "600",
  },
  solidBtn: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
  },
  solidBtnText: {
    color: palette.black,
    fontSize: 13,
    fontWeight: "600",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  heroTitle: {
    fontWeight: "800",
    letterSpacing: -2,
    marginBottom: spacing(3),
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: spacing(7),
    maxWidth: 480,
    lineHeight: 26,
  },
  heroCta: {
    alignSelf: "flex-start",
    backgroundColor: palette.white,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
  },
  heroCtaText: {
    color: palette.black,
    fontSize: 14,
    fontWeight: "600",
  },

  cities: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  cityTitle: {
    fontWeight: "800",
    letterSpacing: -1,
  },

  eventCard: {
    flexDirection: "row",
    gap: spacing(4),
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(3),
    position: "relative",
  },
  thumb: {
    width: 110,
    height: 110,
    borderRadius: radii.md,
    backgroundColor: palette.navyDeep,
  },
  eventBody: {
    flex: 1,
    justifyContent: "center",
    gap: spacing(1),
    paddingRight: spacing(10),
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
  },
  hostAvatar: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  hostInitials: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  hostInitialsText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: "700",
  },
  hostName: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  eventMeta: {
    fontSize: 13,
    fontWeight: "400",
  },
  eventStats: {
    fontSize: 13,
    fontWeight: "400",
  },
  starBtn: {
    position: "absolute",
    right: spacing(3),
    bottom: spacing(3),
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});