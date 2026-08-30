import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type ViewStyle,
  useWindowDimensions,
  View,
} from "react-native";
import { toEventTicketConfig } from "../api/event-ticket";
import {
  type ApiCourierListing,
  fetchCourierListings,
} from "../api/couriers";
import { type ApiEvent, fetchEvents } from "../api/events";
import { type ApiVenue, fetchVenues } from "../api/venues";
import { type ApiPost, fetchPosts } from "../api/posts";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import CourierDetails from "./CourierDetails";
import PaymentPage from "./PaymentPage";
import TicketConfigPage, {
  type PurchasePayload,
  type TicketConfig,
} from "./TicketConfigPage";

type SearchCategory = "all" | "events" | "venues" | "posts" | "couriers";

const CATEGORIES: { label: string; value: SearchCategory }[] = [
  { label: "All", value: "all" },
  { label: "Events", value: "events" },
  { label: "Venues", value: "venues" },
  { label: "Posts", value: "posts" },
  { label: "Couriers", value: "couriers" },
];

const VENUE_IMAGES = [
  require("@/assets/images/event1.jpg"),
  require("@/assets/images/event4.jpg"),
];

const COURIER_IMAGES = [
  require("@/assets/images/courier_1.jpg"),
  require("@/assets/images/courier_2.jpg"),
  require("@/assets/images/courier_3.jpg"),
];

interface EventSearchCard {
  id: string;
  kind: "event";
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  height: number;
  tag: string;
  ticket: TicketConfig;
}

interface VenueSearchCard {
  id: string;
  kind: "venue";
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  height: number;
  tag: string;
  venue: ApiVenue;
}

interface PostSearchCard {
  id: string;
  kind: "post";
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  height: number;
  tag: string;
  post: ApiPost;
}

interface CourierSearchCard {
  id: string;
  kind: "courier";
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  height: number;
  tag: string;
  courier: ApiCourierListing;
}

type SearchCard =
  | EventSearchCard
  | VenueSearchCard
  | PostSearchCard
  | CourierSearchCard;

function eventCard(event: ApiEvent, index: number): EventSearchCard {
  const ticket = toEventTicketConfig(event);
  const date = new Date(event.startsAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: `event-${event.id}`,
    kind: "event",
    title: event.title,
    subtitle: `${event.venue.name}, ${event.venue.city} • ${date}`,
    image: ticket.image,
    height: 270 + (index % 3) * 35,
    tag: "Event",
    ticket,
  };
}

function venueCard(venue: ApiVenue, index: number): VenueSearchCard {
  const eventLabel = venue.eventCount === 1 ? "1 event" : `${venue.eventCount} events`;

  return {
    id: `venue-${venue.id}`,
    kind: "venue",
    title: venue.name,
    subtitle: `${venue.address}, ${venue.city} • ${eventLabel}`,
    image: VENUE_IMAGES[index % VENUE_IMAGES.length],
    height: 235 + (index % 2) * 45,
    tag: "Venue",
    venue,
  };
}

function postCard(post: ApiPost, index: number): PostSearchCard {
  return {
    id: `post-${post.id}`,
    kind: "post",
    title: post.author.name,
    subtitle: post.caption,
    image: { uri: post.media[0].url },
    height: 250 + (index % 3) * 30,
    tag: "Post",
    post,
  };
}

function courierCard(
  courier: ApiCourierListing,
  index: number,
): CourierSearchCard {
  const serviceLabel = courier.serviceLevels
    .map((level) => level.replaceAll("_", " "))
    .join(" · ");
  return {
    id: `courier-${courier.id}`,
    kind: "courier",
    title: courier.name,
    subtitle: `${courier.serviceAreas.join(", ")} · ${serviceLabel}`,
    image: courier.logoUrl
      ? { uri: courier.logoUrl }
      : COURIER_IMAGES[index % COURIER_IMAGES.length],
    height: 245 + (index % 2) * 35,
    tag: "Courier",
    courier,
  };
}

function combineCards(
  events: EventSearchCard[],
  venues: VenueSearchCard[],
  posts: PostSearchCard[],
  couriers: CourierSearchCard[],
) {
  const cards: SearchCard[] = [];
  const count = Math.max(
    events.length,
    venues.length,
    posts.length,
    couriers.length,
  );

  for (let index = 0; index < count; index += 1) {
    if (events[index]) cards.push(events[index]);
    if (venues[index]) cards.push(venues[index]);
    if (posts[index]) cards.push(posts[index]);
    if (couriers[index]) cards.push(couriers[index]);
  }

  return cards;
}

interface SearchPageProps {
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

export default function SearchPage({ onOpenAuth, onOpenSettings }: SearchPageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>("all");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [couriers, setCouriers] = useState<ApiCourierListing[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketConfig | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<PurchasePayload | null>(null);
  const [selectedCourier, setSelectedCourier] =
    useState<ApiCourierListing | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      const search = query.trim() || undefined;
      const includeEvents = selectedCategory === "all" || selectedCategory === "events";
      const includeVenues = selectedCategory === "all" || selectedCategory === "venues";
      const includePosts = selectedCategory === "all" || selectedCategory === "posts";
      const includeCouriers =
        selectedCategory === "all" || selectedCategory === "couriers";

      void Promise.all([
        includeEvents
          ? fetchEvents({ q: search, signal: controller.signal })
          : Promise.resolve([]),
        includeVenues
          ? fetchVenues({ q: search, signal: controller.signal })
          : Promise.resolve([]),
        includePosts
          ? fetchPosts({ q: search, signal: controller.signal })
          : Promise.resolve([]),
        includeCouriers
          ? fetchCourierListings({ q: search, signal: controller.signal })
          : Promise.resolve([]),
      ])
        .then(([eventResults, venueResults, postResults, courierResults]) => {
          setEvents(eventResults);
          setVenues(venueResults);
          setPosts(postResults);
          setCouriers(courierResults);
          setErrorMessage("");
          setLoadState("ready");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Search results could not be loaded.",
          );
          setLoadState("error");
        });
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, retryKey, selectedCategory]);

  if (purchasePayload) {
    return (
      <PaymentPage
        payload={purchasePayload}
        onClose={() => setPurchasePayload(null)}
        onComplete={() => {
          setPurchasePayload(null);
          setSelectedTicket(null);
        }}
      />
    );
  }

  if (selectedTicket) {
    return (
      <TicketConfigPage
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onNavigateToPayment={setPurchasePayload}
      />
    );
  }

  if (selectedCourier) {
    return (
      <CourierDetails
        courier={selectedCourier}
        onClose={() => setSelectedCourier(null)}
      />
    );
  }

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const eventCards = events.map(eventCard);
  const venueCards = venues.map(venueCard);
  const postCards = posts.map(postCard);
  const courierCards = couriers.map(courierCard);
  const results =
    selectedCategory === "events"
      ? eventCards
      : selectedCategory === "venues"
        ? venueCards
        : selectedCategory === "posts"
          ? postCards
          : selectedCategory === "couriers"
            ? courierCards
            : combineCards(eventCards, venueCards, postCards, courierCards);
  const columns: SearchCard[][] = Array.from({ length: columnCount }, () => []);
  results.forEach((result, index) => columns[index % columnCount].push(result));

  const iconOffset = Platform.OS !== "web" ? { marginTop: 20 } : {};

  const updateQuery = (value: string) => {
    setQuery(value);
    setLoadState("loading");
  };

  const selectCategory = (category: SearchCategory) => {
    setSelectedCategory(category);
    setLoadState("loading");
  };

  const openResult = (result: SearchCard) => {
    if (result.kind === "event") {
      setSelectedTicket(result.ticket);
      return;
    }

    if (result.kind === "post") return;

    if (result.kind === "courier") {
      setSelectedCourier(result.courier);
      return;
    }

    setQuery(result.venue.name);
    setSelectedCategory("events");
    setLoadState("loading");
  };

  const searchInput = (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: colors.bgAlt, borderColor: colors.border },
      ]}
    >
      <Feather name="search" size={20} color={colors.inkMuted} />
      <TextInput
        placeholder="Search events, venues, posts and couriers..."
        placeholderTextColor={colors.inkMuted}
        value={query}
        onChangeText={updateQuery}
        returnKeyType="search"
        style={[
          styles.searchInput,
          { color: colors.ink, fontFamily: fontFamilies.body },
        ]}
      />
      {query.length > 0 && (
        <Pressable
          accessibilityLabel="Clear search"
          onPress={() => updateQuery("")}
        >
          <Feather name="x" size={18} color={colors.inkMuted} />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {isDesktop && (
        <View
          style={[
            styles.searchBarWrap,
            { backgroundColor: colors.bg, borderBottomColor: colors.border },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as unknown as ViewStyle)
              : {},
          ]}
        >
          <View style={styles.searchBarInner}>{searchInput}</View>
        </View>
      )}

      {!isDesktop && (
        <View style={styles.mobileSearchWrap}>
          <View style={styles.mobileActionRow}>
            <Pressable
              accessibilityLabel="Open account"
              style={[styles.iconBtn, { backgroundColor: colors.bgAlt }, iconOffset]}
              onPress={onOpenAuth}
            >
              <Feather name="user" size={20} color={colors.ink} />
            </Pressable>
            <Pressable
              accessibilityLabel="Open settings"
              style={[styles.iconBtn, { backgroundColor: colors.bgAlt }, iconOffset]}
              onPress={onOpenSettings}
            >
              <Feather name="settings" size={20} color={colors.ink} />
            </Pressable>
          </View>
          {searchInput}
        </View>
      )}

      <View
        style={[
          styles.pillsWrapper,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
        >
          {CATEGORIES.map((category) => {
            const isSelected = category.value === selectedCategory;
            return (
              <Pressable
                key={category.value}
                onPress={() => selectCategory(category.value)}
                style={[
                  styles.pill,
                  { backgroundColor: isSelected ? colors.gold : colors.bgAlt },
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
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loadState === "loading" && (
        <View style={styles.statePanel}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.stateText, { color: colors.inkMuted }]}>Searching…</Text>
        </View>
      )}

      {loadState === "error" && (
        <View style={styles.statePanel}>
          <Feather name="alert-circle" size={28} color={colors.inkMuted} />
          <Text style={[styles.stateText, { color: colors.inkMuted }]}>{errorMessage}</Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: colors.gold }]}
            onPress={() => {
              setLoadState("loading");
              setRetryKey((value) => value + 1);
            }}
          >
            <Text style={[styles.retryText, { color: colors.black }]}>Try again</Text>
          </Pressable>
        </View>
      )}

      {loadState === "ready" && results.length === 0 && (
        <View style={styles.statePanel}>
          <Feather name="search" size={28} color={colors.inkMuted} />
          <Text style={[styles.stateText, { color: colors.inkMuted }]}>
            No events, venues, posts or couriers match your search.
          </Text>
        </View>
      )}

      {loadState === "ready" && results.length > 0 && (
        <View
          style={[
            styles.resultsWrap,
            {
              paddingHorizontal: isDesktop ? spacing(6) : spacing(2),
              paddingBottom: isDesktop ? spacing(10) : spacing(20),
            },
          ]}
        >
          <Text style={[styles.resultCount, { color: colors.inkMuted }]}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
          <View style={styles.board}>
            {columns.map((column, columnIndex) => (
              <View key={`col-${columnIndex}`} style={styles.column}>
                {column.map((result) => (
                  <Pressable
                    key={result.id}
                    style={styles.pinWrap}
                    disabled={result.kind === "post"}
                    onPress={() => openResult(result)}
                  >
                    <View
                      style={[
                        styles.pinCard,
                        { backgroundColor: colors.surface, shadowColor: colors.shadow },
                      ]}
                    >
                      <View style={styles.imageWrap}>
                        <Image
                          source={result.image}
                          style={[styles.pinImage, { height: result.height }]}
                          resizeMode="cover"
                        />
                        {result.kind !== "post" && <View style={styles.actionOverlay}>
                          <View style={[styles.actionBtn, { backgroundColor: colors.gold }]}>
                            <Text
                              style={[
                                styles.actionText,
                                { color: colors.white, fontFamily: fontFamilies.bodySemi },
                              ]}
                            >
                              {result.kind === "event"
                                ? "Tickets"
                                : result.kind === "courier"
                                  ? "Track parcel"
                                  : "View events"}
                            </Text>
                          </View>
                        </View>}
                        <View
                          style={[styles.tagPill, { backgroundColor: colors.black + "CC" }]}
                        >
                          <Text style={[styles.tagText, { color: colors.white }]}>
                            {result.tag}
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
                          {result.title}
                        </Text>
                        <Text
                          style={[
                            styles.pinSubtitle,
                            { color: colors.inkMuted, fontFamily: fontFamilies.body },
                          ]}
                          numberOfLines={2}
                        >
                          {result.subtitle}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", minHeight: "100%" },
  searchBarWrap: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6),
  },
  searchBarInner: { maxWidth: 800, width: "100%", alignSelf: "center" },
  searchBar: {
    height: 52,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16, height: "100%", paddingVertical: 0 },
  mobileSearchWrap: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(3),
    paddingBottom: spacing(2),
    gap: spacing(2.5),
  },
  mobileActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing(2),
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pillsWrapper: { borderBottomWidth: 1, paddingVertical: spacing(3) },
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
  pillText: { fontSize: 14 },
  resultsWrap: { paddingTop: spacing(3), width: "100%" },
  resultCount: {
    maxWidth: 1600,
    width: "100%",
    alignSelf: "center",
    fontSize: 13,
    marginBottom: spacing(3),
  },
  board: {
    flexDirection: "row",
    gap: spacing(3),
    alignItems: "flex-start",
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
  },
  column: { flex: 1, gap: spacing(3) },
  pinWrap: { width: "100%" },
  pinCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: { position: "relative", width: "100%" },
  pinImage: { width: "100%", borderBottomWidth: 1 },
  actionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: spacing(3),
  },
  actionBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  actionText: { fontSize: 13 },
  tagPill: {
    position: "absolute",
    bottom: spacing(2),
    left: spacing(2),
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.full,
  },
  tagText: { fontSize: 11, fontWeight: "600" },
  pinBody: { padding: spacing(3), gap: 3 },
  pinTitle: { fontSize: 14, lineHeight: 18 },
  pinSubtitle: { fontSize: 12, lineHeight: 17 },
  statePanel: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(3),
    minHeight: 320,
    padding: spacing(6),
  },
  stateText: { fontSize: 14, textAlign: "center" },
  retryBtn: {
    borderRadius: radii.full,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2.5),
  },
  retryText: { fontSize: 13, fontFamily: fontFamilies.bodySemi },
});
