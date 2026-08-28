import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import {
  createPost,
  fetchPosts,
  likePost,
  reportPost,
  unlikePost,
  type ApiPost,
} from "../api/posts";
import type { AccountType } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

/*
  {
    id: "p1",
    company: "Landlord Entertainment",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    media: require("@/assets/videos/gwamba_show.mp4"),
    isVideo: true,
    likes: 1240,
    caption: "The Landlord Pakwao Concert is here! Gwamba headlines alongside Nigerian superstar Ruger, with a stacked lineup of Malawi's finest. Don't miss the biggest night of the year at Bingu National Stadium.",
    price: "MWK 15,000",
    date: "Fri, Dec 15",
    location: "Bingu National Stadium, Lilongwe",
    tags: ["Concert", "Music", "Lilongwe"],
  },
  {
    id: "p2",
    company: "Malawi Airlines",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    media: require("@/assets/videos/airline.mp4"),
    isVideo: true,
    likes: 856,
    caption: "Fly non-stop from Lilongwe to Johannesburg. Comfortable seating, complimentary meals & onboard entertainment. Book your seat today!",
    price: "MWK 350,000",
    date: "Daily Departures",
    location: "Kamuzu International Airport",
    tags: ["Flight", "Travel", "International"],
  },
  {
    id: "p3",
    company: "CTS Courier",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    media: require("@/assets/videos/courier_video.mp4"),
    isVideo: true,
    likes: 2103,
    caption: "Same-day delivery just got faster. Watch how we move your packages across Blantyre in under a day. 24-hour service now available at our main branches nationwide.",
    price: "MWK 17,000",
    date: "Mon–Sun, 24/7",
    location: "Nationwide, Malawi",
    tags: ["Courier", "Fast", "Logistics"],
  },
  {
    id: "p4",
    company: "Night Garden Fest",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    media: require("@/assets/videos/gwamba_show.mp4"),
    isVideo: true,
    likes: 5602,
    caption: "Flashback to the most magical night of 2025. Early bird tickets for 2026 are now live. Don't miss the garden lights, live bands & food trucks.",
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
    caption: "Corporate teams, this one's for you. Monthly shuttle passes with dedicated pick-up routes. Stress-free commute for your staff.",
    price: "MWK 45,000/mo",
    date: "Monthly Subscription",
    location: "Lagos Metropolis",
    tags: ["Business", "Shuttle", "Corporate"],
  },
  {
    id: "p6",
    company: "Burna Boy Live",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
    media: require("@/assets/videos/gwamba_show.mp4"),
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
    media: require("@/assets/videos/gwamba_show.mp4"),
    isVideo: true,
    likes: 678,
    caption: "Scenic coastal route from Lekki to Epe. Ocean views, air-conditioned coaches, and weekend getaway packages now available.",
    price: "MWK 3,500",
    date: "Weekends",
    location: "Lekki–Epe Expressway",
    tags: ["Scenic", "Weekend", "Bus"],
  },
*/

/* ------------------------------------------------------------------ */
// Video player
/* ------------------------------------------------------------------ */
function VideoPost({ source, isMuted }: { source: any; isMuted: boolean }) {
  const [isReady, setIsReady] = useState(false);

  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
  });

  /* eslint-disable react-hooks/immutability -- expo-video exposes muting as a mutable player property. */
  useEffect(() => {
    if (player) player.muted = isMuted;
  }, [isMuted, player]);
  /* eslint-enable react-hooks/immutability */

  useEffect(() => {
    if (Platform.OS === "web") {
      const uri = typeof source === "string" ? source : source?.uri;
      if (uri) fetch(uri).catch(() => {});
    }
  }, [source]);

  /* eslint-disable react-hooks/set-state-in-effect -- readiness is synchronized from the external player. */
  useEffect(() => {
    if (!player) return;

    if (player.status === "readyToPlay") {
      setIsReady(true);
      if (!player.playing) player.play();
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;

    const handleStatusChange = ({ status }: { status: string }) => {
      if (status === "readyToPlay" || status === "playing") {
        setIsReady(true);
        if (!player.playing) player.play();
      }
    };

    if (typeof player.addListener === "function") {
      const sub = player.addListener("statusChange", handleStatusChange);
      return () => sub?.remove?.();
    }

    interval = setInterval(() => {
      if (player.status === "readyToPlay") {
        setIsReady(true);
        if (!player.playing) player.play();
        if (interval) clearInterval(interval);
      }
    }, 300);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [player]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
      />
      {!isReady && (
        <View style={[StyleSheet.absoluteFill, styles.videoLoading]}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Post card
/* ------------------------------------------------------------------ */
function PostCard({
  post,
  onToggleLike,
  onReport,
}: {
  post: ApiPost;
  onToggleLike: (post: ApiPost) => void;
  onReport: (post: ApiPost) => void;
}) {
  const { colors } = useLumTheme();
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const primaryMedia = post.media[0];
  const mediaSource = { uri: primaryMedia.url };

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
          {post.author.avatarUrl ? (
            <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.bgAlt }]}>
              <Feather name="user" size={18} color={colors.inkMuted} />
            </View>
          )}
          <View>
            <Text
              style={[
                styles.companyName,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              {post.author.name}
            </Text>
            <Text
              style={[
                styles.locationText,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
            >
              {post.location ?? "Malawi"}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => setShowReport((current) => !current)}>
          <Feather name="more-horizontal" size={20} color={colors.inkMuted} />
        </Pressable>
      </View>
      {showReport && (
        <Pressable
          onPress={() => {
            onReport(post);
            setShowReport(false);
          }}
          style={[styles.reportAction, { borderColor: colors.border }]}
        >
          <Feather name="flag" size={15} color="#DC2626" />
          <Text style={{ color: "#DC2626", fontFamily: fontFamilies.bodySemi }}>
            Report misleading content
          </Text>
        </Pressable>
      )}

      {/* Media */}
      <View style={styles.mediaWrap}>
        {primaryMedia.type === "video" ? (
          <VideoPost source={mediaSource} isMuted={isMuted} />
        ) : (
          <Image
            source={mediaSource}
            style={styles.media}
            resizeMode="cover"
          />
        )}

        {primaryMedia.type === "video" && (
          <Pressable
            style={[styles.muteBtn, { backgroundColor: colors.black + "AA" }]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Feather
              name={isMuted ? "volume-x" : "volume-2"}
              size={18}
              color={colors.white}
            />
          </Pressable>
        )}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <Pressable onPress={() => onToggleLike(post)} style={styles.actionBtn}>
            <Feather
              name="heart"
              size={24}
              color={post.viewerHasReacted ? "#E60023" : colors.ink}
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
          {post.reactionCount.toLocaleString()} likes
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
            {post.author.name}{" "}
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
      {(post.priceLabel || post.dateLabel) && <View style={styles.chipRow}>
        {!!post.priceLabel && <View style={[styles.chip, { backgroundColor: colors.gold + "18" }]}>
          <Feather name="tag" size={12} color={colors.gold} />
          <Text
            style={[
              styles.chipText,
              { color: colors.gold, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            {post.priceLabel}
          </Text>
        </View>}
        {!!post.dateLabel && <View style={[styles.chip, { backgroundColor: colors.bgAlt }]}>
          <Feather name="calendar" size={12} color={colors.inkMuted} />
          <Text
            style={[
              styles.chipText,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            {post.dateLabel}
          </Text>
        </View>}
      </View>}

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
      {!!post.event && <Pressable style={[styles.ctaBtn, { backgroundColor: colors.gold }]}>
        <Feather name="tag" size={16} color={colors.white} />
        <Text
          style={[
            styles.ctaText,
            { color: colors.white, fontFamily: fontFamilies.bodySemi },
          ]}
        >
          Get Tickets
        </Text>
      </Pressable>}
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Main screen
/* ------------------------------------------------------------------ */
export default function Feeds({
  onOpenAuth,
}: {
  onOpenAuth?: (accountType?: AccountType) => void;
}) {
  const { colors } = useLumTheme();
  const auth = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);
      void fetchPosts({
        q: query.trim() || undefined,
        token: auth.token,
        signal: controller.signal,
      })
        .then((items) => {
          setPosts(items);
          setErrorMessage("");
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setErrorMessage(error instanceof Error ? error.message : "Posts could not be loaded.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [auth.token, query]);

  const openComposer = () => {
    if (!auth.token) {
      onOpenAuth?.();
      return;
    }
    setShowComposer((current) => !current);
  };

  const submitPost = async () => {
    if (!auth.token || !caption.trim() || !mediaUrl.trim()) return;
    setPosting(true);
    setErrorMessage("");
    try {
      const post = await createPost(
        {
          caption: caption.trim(),
          tags: [],
          media: [{ type: "image", url: mediaUrl.trim() }],
        },
        auth.token,
      );
      setPosts((current) => [post, ...current]);
      setCaption("");
      setMediaUrl("");
      setShowComposer(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The post could not be created.");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (post: ApiPost) => {
    if (!auth.token) {
      onOpenAuth?.();
      return;
    }
    try {
      const updated = post.viewerHasReacted
        ? await unlikePost(post.id, auth.token)
        : await likePost(post.id, auth.token);
      setPosts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The reaction could not be saved.");
    }
  };

  const report = async (post: ApiPost) => {
    if (!auth.token) {
      onOpenAuth?.();
      return;
    }
    try {
      await reportPost(post.id, { reason: "misleading" }, auth.token);
      setNotice("Report submitted for review.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The report could not be submitted.");
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Search header */}
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
        {/* Mobile: plain plus icon above search, RIGHT aligned */}
        {!isDesktop && (
          <View style={styles.mobileTopRow}>
            <Pressable onPress={openComposer} style={styles.plusBtnMobile}>
              <Feather name="plus" size={24} color={colors.ink} />
            </Pressable>
          </View>
        )}

        {/* Desktop: search + plus icon in one row */}
        {isDesktop ? (
          <View style={styles.desktopSearchRow}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.bgAlt,
                  borderColor: colors.border,
                  flex: 1,
                },
              ]}
            >
              <Feather name="search" size={20} color={colors.inkMuted} />
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
                  <Feather name="x" size={20} color={colors.inkMuted} />
                </Pressable>
              )}
            </View>

            <Pressable onPress={openComposer} style={styles.plusBtnDesktop}>
              <Feather name="plus" size={24} color={colors.ink} />
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.bgAlt,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={20} color={colors.inkMuted} />
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
                <Feather name="x" size={20} color={colors.inkMuted} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {showComposer && (
        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              maxWidth: isDesktop ? 560 : undefined,
            },
          ]}
        >
          <Text style={[styles.composerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
            Create a post
          </Text>
          <TextInput
            multiline
            placeholder="What would you like to share?"
            placeholderTextColor={colors.inkMuted}
            value={caption}
            onChangeText={setCaption}
            style={[
              styles.composerInput,
              {
                color: colors.ink,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                fontFamily: fontFamilies.body,
              },
            ]}
          />
          <TextInput
            autoCapitalize="none"
            keyboardType="url"
            placeholder="Image URL"
            placeholderTextColor={colors.inkMuted}
            value={mediaUrl}
            onChangeText={setMediaUrl}
            style={[
              styles.mediaUrlInput,
              {
                color: colors.ink,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                fontFamily: fontFamilies.body,
              },
            ]}
          />
          <Pressable
            disabled={posting || !caption.trim() || !mediaUrl.trim()}
            onPress={() => void submitPost()}
            style={[
              styles.composerSubmit,
              {
                backgroundColor: colors.gold,
                opacity: posting || !caption.trim() || !mediaUrl.trim() ? 0.55 : 1,
              },
            ]}
          >
            {posting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={{ color: colors.white, fontFamily: fontFamilies.bodySemi }}>
                Publish Post
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {!!notice && (
        <Pressable onPress={() => setNotice("")}>
          <Text style={[styles.noticeText, { color: "#059669", fontFamily: fontFamilies.body }]}>
            {notice}
          </Text>
        </Pressable>
      )}
      {!!errorMessage && (
        <Text style={[styles.noticeText, { color: "#DC2626", fontFamily: fontFamilies.body }]}>
          {errorMessage}
        </Text>
      )}

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
        {loading && posts.length === 0 && (
          <View style={styles.statePanel}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        )}
        {!loading && posts.length === 0 && (
          <View style={styles.statePanel}>
            <Feather name="inbox" size={30} color={colors.inkMuted} />
            <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body }}>
              No posts match your search.
            </Text>
          </View>
        )}
        {posts.map((post) => (
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
            <PostCard
              post={post}
              onToggleLike={(item) => void toggleLike(item)}
              onReport={(item) => void report(item)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Styles
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  searchWrap: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 40,
  },
  mobileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing(2),
  },
  plusBtnMobile: {
    padding: spacing(1),
  },
  desktopSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    maxWidth: 560,
    alignSelf: "center",
    width: "100%",
  },
  plusBtnDesktop: {
    padding: spacing(1.5),
  },
  composer: {
    width: "100%",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(4),
    gap: spacing(3),
    marginVertical: spacing(3),
  },
  composerTitle: { fontSize: 19 },
  composerInput: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(3),
    textAlignVertical: "top",
  },
  mediaUrlInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
  },
  composerSubmit: {
    alignSelf: "flex-end",
    borderRadius: radii.full,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    minWidth: 140,
    alignItems: "center",
  },
  noticeText: {
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    textAlign: "center",
  },
  statePanel: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(3),
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  reportAction: {
    marginHorizontal: spacing(4),
    marginBottom: spacing(2),
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(3),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
  },
  searchBar: {
    width: "100%",
    height: 50,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    overflow: "hidden",
    backgroundColor: "#000",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  videoLoading: {
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  muteBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
