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

const POSTS = [
  {
    id: "p1",
    company: "Eko Hotel & Suites",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop",
    isVideo: true,
    likes: 1240,
    caption: "Detty December kicks off this Friday! Afrobeat Night under the stars with live performances from top artists. Limited VIP tables remaining.",
    price: "MWK 15,000",
    date: "Fri, Dec 15",
    location: "Eko Hotel, Lagos",
    tags: ["Events", "Afrobeat", "Lagos"],
  },
  {
    id: "p2",
    company: "ABC Transport Plc",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    isVideo: true,
    likes: 856,
    caption: "New luxury sleeper buses now on the Lagos–Kano route. Recliner seats, Wi-Fi, charging ports & onboard entertainment. Book your seat today!",
    price: "MWK 18,500",
    date: "Daily Departures",
    location: "Jibowu Terminal",
    tags: ["Buses", "Travel", "Comfort"],
  },
  {
    id: "p3",
    company: "SwiftCourier NG",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
    isVideo: false,
    likes: 2103,
    caption: "Same-day delivery just got faster. Watch how we move your packages from Lagos to Ibadan in under 4 hours. Real-time tracking included.",
    price: "MWK 2,500",
    date: "Mon–Sat",
    location: "Nationwide",
    tags: ["Courier", "Fast", "Logistics"],
  },
  {
    id: "p4",
    company: "Night Garden Fest",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
    isVideo: true,
    likes: 5602,
    caption: "Flashback to the most magical night of 2025. Early bird tickets for 2026 are now live. Don’t miss the garden lights, live bands & food trucks.",
    price: "MWK 10,000",
    date: "Mar 8–10, 2026",
    location: "Lekki Conservation Centre",
    tags: ["Festival", "EarlyBird", "Music"],
  },
  {
    id: "p5",
    company: "Lagos Shuttle Co.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop",
    isVideo: false,
    likes: 432,
    caption: "Corporate teams, this one’s for you. Monthly shuttle passes with dedicated pick-up routes. Stress-free commute for your staff.",
    price: "MWK 45,000/mo",
    date: "Monthly Subscription",
    location: "Lagos Metropolis",
    tags: ["Business", "Shuttle", "Corporate"],
  },
  {
    id: "p6",
    company: "Burna Boy Live",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1459749411177-047381bb3ece?w=800&auto=format&fit=crop",
    isVideo: true,
    likes: 12890,
    caption: "The African Giant returns home. VIP tickets restocked for 48 hours only. Witness history at the biggest concert of the year.",
    price: "MWK 50,000",
    date: "Jan 20, 2026",
    location: "Tafawa Balewa Stadium",
    tags: ["Concert", "VIP", "Restocked"],
  },
  {
    id: "p7",
    company: "Food & Wine Expo",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
    isVideo: false,
    likes: 967,
    caption: "Taste over 50 local and international cuisines. Wine tasting sessions, chef masterclasses, and live cooking demos all weekend long.",
    price: "MWK 8,000",
    date: "Feb 14–16, 2026",
    location: "Eko Atlantic",
    tags: ["Food", "Wine", "Expo"],
  },
  {
    id: "p8",
    company: "Coastal Express",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop",
    media: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop",
    isVideo: true,
    likes: 678,
    caption: "Scenic coastal route from Lekki to Epe. Ocean views, air-conditioned coaches, and weekend getaway packages now available.",
    price: "MWK 3,500",
    date: "Weekends",
    location: "Lekki–Epe Expressway",
    tags: ["Scenic", "Weekend", "Bus"],
  },
];

function PostCard({ post }: { post: typeof POSTS[number] }) {
  const { colors } = useLumTheme();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.postCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <View>
            <Text
              style={[
                styles.companyName,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              {post.company}
            </Text>
            <Text
              style={[
                styles.locationText,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
            >
              {post.location}
            </Text>
          </View>
        </View>
        <Pressable>
          <Feather name="more-horizontal" size={20} color={colors.inkMuted} />
        </Pressable>
      </View>

      {/* Media */}
      <View style={styles.mediaWrap}>
        <Image
          source={{ uri: post.media }}
          style={styles.media}
          resizeMode="cover"
        />
        {post.isVideo && (
          <View style={styles.playOverlay}>
            <View
              style={[
                styles.playBtn,
                { backgroundColor: colors.black + "AA" },
              ]}
            >
              <Feather name="play" size={28} color={colors.white} />
            </View>
          </View>
        )}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <Pressable onPress={() => setLiked(!liked)} style={styles.actionBtn}>
            <Feather
              name={liked ? "heart" : "heart"}
              size={24}
              color={liked ? "#E60023" : colors.ink}
            />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="message-circle" size={24} color={colors.ink} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="send" size={24} color={colors.ink} />
          </Pressable>
        </View>
        <Pressable onPress={() => setSaved(!saved)}>
          <Feather
            name={saved ? "bookmark" : "bookmark"}
            size={24}
            color={saved ? colors.gold : colors.ink}
          />
        </Pressable>
      </View>

      {/* Likes */}
      <View style={styles.likesWrap}>
        <Text
          style={[
            styles.likesText,
            { color: colors.ink, fontFamily: fontFamilies.bodySemi },
          ]}
        >
          {post.likes.toLocaleString()} likes
        </Text>
      </View>

      {/* Caption */}
      <View style={styles.captionWrap}>
        <Text style={styles.captionLine}>
          <Text
            style={[
              styles.captionUser,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            {post.company}{" "}
          </Text>
          <Text
            style={[
              styles.captionBody,
              { color: colors.ink, fontFamily: fontFamilies.body },
            ]}
            numberOfLines={expanded ? undefined : 2}
          >
            {post.caption}
          </Text>
        </Text>
        {post.caption.length > 80 && (
          <Pressable onPress={() => setExpanded(!expanded)}>
            <Text
              style={[
                styles.moreText,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
            >
              {expanded ? "Show less" : "more"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Ticket Info Chips */}
      <View style={styles.chipRow}>
        <View
          style={[
            styles.chip,
            { backgroundColor: colors.gold + "18" },
          ]}
        >
          <Feather name="tag" size={12} color={colors.gold} />
          <Text
            style={[
              styles.chipText,
              { color: colors.gold, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            {post.price}
          </Text>
        </View>
        <View
          style={[
            styles.chip,
            { backgroundColor: colors.bgAlt },
          ]}
        >
          <Feather name="calendar" size={12} color={colors.inkMuted} />
          <Text
            style={[
              styles.chipText,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            {post.date}
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagRow}>
        {post.tags.map((tag) => (
          <Text
            key={tag}
            style={[
              styles.tag,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            #{tag}
          </Text>
        ))}
      </View>

      {/* CTA */}
      <Pressable
        style={[
          styles.ctaBtn,
          { backgroundColor: colors.gold },
        ]}
      >
        <Feather name="tag" size={16} color={colors.white} />
        <Text
          style={[
            styles.ctaText,
            { color: colors.white, fontFamily: fontFamilies.bodySemi },
          ]}
        >
          Get Tickets
        </Text>
      </Pressable>
    </View>
  );
}

export default function Feeds() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [query, setQuery] = useState("");

  const filteredPosts = POSTS.filter((post) => {
    const haystack = [
      post.company,
      post.caption,
      post.location,
      post.date,
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.toLowerCase());
  });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: colors.bg,
            borderBottomColor: colors.border,
          },
          isDesktop && Platform.OS === "web"
            ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
            : {},
          isDesktop && {
            maxWidth: 560,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.bgAlt,
              borderColor: colors.border,
            },
            isDesktop && {
              maxWidth: 480,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          <Feather name="search" size={18} color={colors.inkMuted} />
          <TextInput
            placeholder="Search feeds"
            placeholderTextColor={colors.inkMuted}
            value={query}
            onChangeText={setQuery}
            style={[
              styles.searchInput,
              {
                color: colors.ink,
                fontFamily: fontFamilies.body,
              },
            ]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={18} color={colors.inkMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isDesktop ? spacing(6) : 0,
            paddingTop: isDesktop ? spacing(3) : 0,
            paddingBottom: isDesktop ? spacing(10) : spacing(20),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredPosts.map((post) => (
          <View
            key={post.id}
            style={[
              styles.postContainer,
              {
                borderTopColor: colors.border,
              },
              isDesktop && {
                maxWidth: 560,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <PostCard post={post} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
  },
  searchWrap: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  postContainer: {
    borderTopWidth: 1,
  },
  postCard: {
    overflow: "hidden",
    borderWidth: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2.5),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  companyName: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 12,
    marginTop: 1,
  },
  mediaWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(3.5),
    paddingTop: spacing(3),
    paddingBottom: spacing(1.5),
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3.5),
  },
  actionBtn: {
    padding: 2,
  },
  likesWrap: {
    paddingHorizontal: spacing(3.5),
    paddingBottom: spacing(1.5),
  },
  likesText: {
    fontSize: 14,
  },
  captionWrap: {
    paddingHorizontal: spacing(3.5),
    paddingBottom: spacing(2),
  },
  captionLine: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  captionUser: {
    fontSize: 14,
  },
  captionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreText: {
    fontSize: 13,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing(2),
    paddingHorizontal: spacing(3.5),
    paddingBottom: spacing(2),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  chipText: {
    fontSize: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(2),
    paddingHorizontal: spacing(3.5),
    paddingBottom: spacing(3),
  },
  tag: {
    fontSize: 13,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: spacing(3.5),
    marginBottom: spacing(3.5),
    paddingVertical: spacing(3),
    borderRadius: radii.full,
  },
  ctaText: {
    fontSize: 15,
  },
});