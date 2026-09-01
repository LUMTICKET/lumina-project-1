import { Feather } from "@expo/vector-icons";
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
import type { AccountType } from "../api/auth";
import type { ApiEvent } from "../api/events";
import {
  fetchEventModerationQueue,
  moderateEvent,
} from "../api/moderation";
import {
  fetchPostModerationQueue,
  moderatePost,
  type ReportedApiPost,
} from "../api/posts";
import {
  createEventDraft,
  fetchOrganizerEvents,
  submitEventDraft,
  updateEventDraft,
  type CreateEventDraftInput,
} from "../api/organizer-events";
import { fetchVenues, type ApiVenue } from "../api/venues";
import { useAuth } from "../auth/AuthContext";
import CourierManagement from "./CourierManagement";

/* ------------------------------------------------------------------ */
// Types
/* ------------------------------------------------------------------ */
type CategoryKey = "event" | "bus" | "flight" | "tourism";
type CreateScreen = "form" | "checkout" | "success";
type PaymentMethod = "tnm" | "airtel" | "card";

interface TierForm {
  id: string;
  name: string;
  price: string;
  currency: string;
  perks: string;
  remaining: string;
}

interface RouteForm {
  from: string;
  to: string;
  duration: string;
  stops: string;
}

interface CategoryMeta {
  key: CategoryKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  desc: string;
}

/* ------------------------------------------------------------------ */
// Config
/* ------------------------------------------------------------------ */
const PLATFORM_FEE = 10000;
const CURRENCY = "MWK";

const CATEGORIES: CategoryMeta[] = [
  { key: "event", label: "Event", icon: "calendar", desc: "Concerts, sports, festivals" },
  { key: "bus", label: "Bus Route", icon: "truck", desc: "Intercity & shuttle services" },
  { key: "flight", label: "Flight", icon: "send", desc: "Domestic & international flights" },
  { key: "tourism", label: "Tourism", icon: "map", desc: "Tours, parks, attractions" },
];

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */
function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function parseEventStart(date: string, time: string) {
  const dateMatch = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!dateMatch || !timeMatch) return null;

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toUpperCase();
  if (minute > 59 || (meridiem ? hour < 1 || hour > 12 : hour > 23)) return null;
  if (meridiem) {
    hour %= 12;
    if (meridiem === "PM") hour += 12;
  }

  const parsed = new Date(
    `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+02:00`,
  );
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function eventDateForForm(startsAt: string) {
  const date = new Date(startsAt);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function eventTimeForForm(startsAt: string) {
  const date = new Date(startsAt);
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

/* ------------------------------------------------------------------ */
// Main Component
/* ------------------------------------------------------------------ */
export default function Create({
  onOpenAuth,
}: {
  onOpenAuth?: (accountType?: AccountType) => void;
}) {
  const { colors } = useLumTheme();
  const auth = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  /* ---- Navigation state ---- */
  const [screen, setScreen] = useState<CreateScreen>("form");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("tnm");
  const [paying, setPaying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCourierManagement, setShowCourierManagement] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [createdEvent, setCreatedEvent] = useState<ApiEvent | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingModerationNote, setEditingModerationNote] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<ApiEvent[]>([]);
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");

  /* ---- Category ---- */
  const [activeIndex, setActiveIndex] = useState(0);
  const category = CATEGORIES[activeIndex].key;
  const isBus = category === "bus";
  const isFlight = category === "flight";
  const isTourism = category === "tourism";
  const showRoute = isBus || isFlight;

  /* ---- Form state ---- */
  const [imageName, setImageName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const organizer = auth.user?.organizer?.name ?? "";
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [route, setRoute] = useState<RouteForm>({
    from: "",
    to: "",
    duration: "",
    stops: "",
  });
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tiers, setTiers] = useState<TierForm[]>([
    { id: makeId(), name: "", price: "", currency: "MWK", perks: "", remaining: "" },
  ]);
  const [maxPerUser, setMaxPerUser] = useState("5");

  useEffect(() => {
    const controller = new AbortController();
    void fetchVenues({ signal: controller.signal })
      .then((items) => setVenues(items))
      .catch(() => {
        if (!controller.signal.aborted) setFormError("Venues could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!auth.token || auth.user?.role !== "organizer") return;
    const controller = new AbortController();
    void fetchOrganizerEvents(auth.token, controller.signal)
      .then(setRecentEvents)
      .catch(() => {
        if (!controller.signal.aborted) setFormError("Your event drafts could not be loaded.");
      });
    return () => controller.abort();
  }, [auth.token, auth.user?.role]);

  /* ---------------------------------------------------------------- */
  // Dynamic labels
  /* ---------------------------------------------------------------- */
  const labels = {
    title: isBus ? "Route Name" : isFlight ? "Flight Title" : isTourism ? "Tour Name" : "Event Name",
    subtitle: isBus ? "Route Summary" : isFlight ? "Flight Summary" : "Short Tagline",
    organizer: isBus ? "Bus Company" : isFlight ? "Airline" : isTourism ? "Tour Operator" : "Host / Organizer",
    location: isBus ? "Departure Terminal" : isFlight ? "Departure Airport" : isTourism ? "Meeting Point" : "Venue",
    date: isBus || isFlight || isTourism ? "Travel Date" : "Event Date",
    time: isBus || isFlight ? "Departure Time" : "Start Time",
    routeFrom: isFlight ? "Origin Airport" : "From (City)",
    routeTo: isFlight ? "Destination Airport" : "To (City)",
    routeDuration: isBus ? "Journey Duration" : "Flight Duration",
    routeStops: isBus ? "Stop-overs (comma separated)" : "Layovers (optional)",
    description: isBus ? "Route Description" : isFlight ? "Flight Details" : isTourism ? "Tour Details" : "Event Description",
    tierName: isBus || isFlight ? "Seat / Cabin Class" : "Ticket Type",
    tierRemaining: isBus || isFlight ? "Available Seats" : "Available Slots",
  };

  const placeholders = {
    title: isBus ? "e.g. Captain Bus Express" : isFlight ? "e.g. Malawi Airlines - LLW to JNB" : isTourism ? "e.g. Mount Mulanje Trek" : "e.g. Lilongwe Food Fest",
    subtitle: isBus ? "Blantyre to Songwe Border, one comfortable journey" : isFlight ? "Non-stop flight, daily connections" : "A short hook that appears under the title",
    organizer: isBus ? "Captain Tours" : isFlight ? "Malawi Airlines" : isTourism ? "Mulanje Mountain Guides" : "Saba's Kitchen",
    location: isBus ? "Blantyre Bus Terminal" : isFlight ? "Kamuzu International Airport (LLW)" : isTourism ? "Likhubula Forest Lodge, Mulanje" : "Portuguese Club, Lilongwe",
    routeFrom: isFlight ? "Lilongwe (LLW)" : "Blantyre",
    routeTo: isFlight ? "Johannesburg (JNB)" : "Songwe Border",
    routeDuration: isBus ? "12h 00m" : "2h 15m",
    routeStops: isBus ? "Lilongwe, Mzuzu, Karonga" : "",
    description: isBus
      ? "Describe the bus amenities, schedule, and what passengers can expect..."
      : isFlight
      ? "Describe baggage allowance, meals, and connection info..."
      : isTourism
      ? "Describe the itinerary, difficulty, and what's included..."
      : "Describe the lineup, activities, and what attendees can expect...",
  };

  /* ---------------------------------------------------------------- */
  // Handlers
  /* ---------------------------------------------------------------- */
  const addTier = () =>
    setTiers((prev) => [
      ...prev,
      { id: makeId(), name: "", price: "", currency: "MWK", perks: "", remaining: "" },
    ]);

  const removeTier = (id: string) => {
    if (tiers.length > 1) setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTier = (id: string, key: keyof TierForm, value: string) =>
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));

  const addTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...tags];
    parts.forEach((p) => {
      if (!next.includes(p)) next.push(p);
    });
    setTags(next);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const buildPayload = () => ({
    id: `${category}-${Date.now()}`,
    title,
    subtitle,
    category,
    image: imageName || undefined,
    organizer,
    date: date ? `${date}T00:00:00` : new Date().toISOString(),
    time,
    location,
    route: showRoute
      ? {
          from: route.from,
          to: route.to,
          duration: route.duration,
          stops: route.stops
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }
      : undefined,
    tiers: tiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: parseInt(t.price, 10) || 0,
      currency: t.currency || "MWK",
      perks: t.perks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      remaining: parseInt(t.remaining, 10) || 0,
    })),
    description,
    tags,
    maxPerUser: parseInt(maxPerUser, 10) || 5,
  });

  const handleGoToPayment = async () => {
    setFormError("");
    if (!auth.token || auth.user?.role !== "organizer") {
      setFormError("Sign in with an organizer account to create events.");
      return;
    }
    if (category !== "event") {
      setFormError("Bus, flight, and tourism publishing will be connected in a later slice.");
      return;
    }
    const startsAt = parseEventStart(date, time);
    if (!title.trim() || title.trim().length < 3) {
      setFormError("Enter an event name with at least 3 characters.");
      return;
    }
    if (!selectedVenueId) {
      setFormError("Select a venue.");
      return;
    }
    if (!startsAt) {
      setFormError("Use a valid date and time, for example 2026-09-15 and 6:00 PM.");
      return;
    }
    if (description.trim().length < 10) {
      setFormError("Add a description with at least 10 characters.");
      return;
    }
    if (
      tiers.some(
        (tier) =>
          !tier.name.trim() ||
          !Number.isFinite(Number(tier.price)) ||
          Number(tier.price) < 0 ||
          !Number.isInteger(Number(tier.remaining)) ||
          Number(tier.remaining) < 1,
      )
    ) {
      setFormError("Every ticket tier needs a name, valid price, and inventory of at least 1.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateEventDraftInput = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        venueId: selectedVenueId,
        startsAt,
        description: description.trim(),
        tags,
        maxPerUser: Number(maxPerUser) || 5,
        ticketTiers: tiers.map((tier) => ({
          name: tier.name.trim(),
          priceMinor: Math.round(Number(tier.price) * 100),
          currency: tier.currency.trim().toUpperCase() || "MWK",
          capacity: Number(tier.remaining),
          available: Number(tier.remaining),
          perks: tier.perks.split(",").map((perk) => perk.trim()).filter(Boolean),
        })),
      };
      const event = editingEventId
        ? await updateEventDraft(editingEventId, payload, auth.token)
        : await createEventDraft(payload, auth.token);
      setCreatedEvent(event);
      setEditingEventId(event.id);
      setEditingModerationNote(event.moderationNote ?? null);
      setRecentEvents((current) => [event, ...current.filter((item) => item.id !== event.id)]);
      setScreen("success");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The draft could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditEvent = (event: ApiEvent) => {
    setActiveIndex(0);
    setTitle(event.title);
    setSubtitle(event.subtitle ?? "");
    setDate(eventDateForForm(event.startsAt));
    setTime(eventTimeForForm(event.startsAt));
    setLocation(`${event.venue.name}, ${event.venue.city}`);
    setSelectedVenueId(event.venue.id);
    setDescription(event.description);
    setTags(event.tags);
    setTagInput("");
    setMaxPerUser(String(event.maxPerUser));
    setTiers(
      event.ticketTiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: String(tier.priceMinor / 100),
        currency: tier.currency,
        perks: tier.perks.join(", "),
        remaining: String(tier.capacity),
      })),
    );
    setEditingEventId(event.id);
    setEditingModerationNote(event.moderationNote ?? null);
    setCreatedEvent(null);
    setFormError("");
    setShowHistory(false);
    setScreen("form");
  };

  const handleSubmitForReview = async () => {
    if (!auth.token || !createdEvent) return;
    setSubmitting(true);
    setFormError("");
    try {
      const event = await submitEventDraft(createdEvent.id, auth.token);
      setCreatedEvent(event);
      setRecentEvents((current) =>
        current.map((item) => (item.id === event.id ? event : item)),
      );
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The event could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setScreen("success");
      console.log("✅ Published after payment:", JSON.stringify(buildPayload(), null, 2));
    }, 2200);
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setDate("");
    setTime("");
    setLocation("");
    setSelectedVenueId("");
    setRoute({ from: "", to: "", duration: "", stops: "" });
    setDescription("");
    setTags([]);
    setTagInput("");
    setTiers([{ id: makeId(), name: "", price: "", currency: "MWK", perks: "", remaining: "" }]);
    setMaxPerUser("5");
    setImageName("");
    setPayMethod("tnm");
    setShowHistory(false);
    setCreatedEvent(null);
    setEditingEventId(null);
    setEditingModerationNote(null);
    setFormError("");
    setScreen("form");
  };

  const inputBase = {
    color: colors.ink,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    fontFamily: fontFamilies.body,
  };

  if (auth.loading) {
    return (
      <View style={[styles.wrap, styles.gate, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!auth.user) {
    return (
      <View style={[styles.wrap, styles.gate, { backgroundColor: colors.bg }]}>
        <Feather name="lock" size={42} color={colors.gold} />
        <Text style={[styles.successTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          Organizer sign-in required
        </Text>
        <Text style={[styles.successSub, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
          Create an organizer account or sign in to manage event drafts.
        </Text>
        <Pressable
          onPress={() => onOpenAuth?.("organizer")}
          style={[styles.publishBtn, { backgroundColor: colors.gold, marginTop: spacing(4) }]}
        >
          <Text style={[styles.publishText, { color: colors.white, fontFamily: fontFamilies.bodySemi }]}>
            Continue as Organizer
          </Text>
        </Pressable>
      </View>
    );
  }

  if (auth.user.role === "admin" && auth.token) {
    return <ModerationPanel token={auth.token} />;
  }

  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return (
      <View style={[styles.wrap, styles.gate, { backgroundColor: colors.bg }]}>
        <Feather name="users" size={42} color={colors.gold} />
        <Text style={[styles.successTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          Organizer account required
        </Text>
        <Text style={[styles.successSub, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
          This account can discover and buy tickets, but only organizer accounts can publish events.
        </Text>
      </View>
    );
  }

  if (showCourierManagement && auth.token) {
    return (
      <CourierManagement
        token={auth.token}
        onClose={() => setShowCourierManagement(false)}
      />
    );
  }

  /* ---------------------------------------------------------------- */
  // RENDER: HISTORY
  /* ---------------------------------------------------------------- */
  if (showHistory) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
        <View
          style={[
            styles.header,
            { backgroundColor: colors.bg, borderBottomColor: colors.border },
          ]}
        >
          <View style={{ width: 40 }} />
          <Text
            style={[
              styles.headerTitle,
              { color: colors.ink, fontFamily: fontFamilies.display },
            ]}
          >
            Your Events
          </Text>
          <Pressable onPress={() => setShowHistory(false)} style={styles.backBtn}>
            <Feather name="x" size={22} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
            paddingTop: spacing(4),
            paddingBottom: isDesktop ? spacing(12) : spacing(24),
          }}
        >
          {recentEvents.length === 0 && (
            <Text style={[styles.successSub, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
              No event drafts yet.
            </Text>
          )}
          {recentEvents.map((ticket, i) => (
            <View
              key={ticket.id}
              style={[
                styles.historyCard,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                },
                i < recentEvents.length - 1 && { borderBottomWidth: 1 },
              ]}
            >
              <View
                style={[
                  styles.historyIconWrap,
                  { backgroundColor: colors.bgAlt },
                ]}
              >
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.ink}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.historyTitle,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  {ticket.title}
                </Text>
                <Text
                  style={[
                    styles.historyMeta,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Event · {new Date(ticket.startsAt).toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.historyBadge,
                  {
                    backgroundColor:
                      ticket.status === "published"
                        ? "rgba(5, 150, 105, 0.12)"
                        : "rgba(217, 119, 6, 0.12)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyBadgeText,
                    {
                      color:
                        ticket.status === "published"
                          ? "#059669"
                          : "#D97706",
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  {ticket.status.replace("_", " ")}
                </Text>
              </View>
              {(ticket.status === "draft" || ticket.status === "rejected") && (
                <Pressable
                  accessibilityLabel={`Edit ${ticket.title}`}
                  onPress={() => handleEditEvent(ticket)}
                  style={[styles.historyEditBtn, { borderColor: colors.border }]}
                >
                  <Feather name="edit-2" size={16} color={colors.ink} />
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  /* ---------------------------------------------------------------- */
  // RENDER: CHECKOUT
  /* ---------------------------------------------------------------- */
  if (screen === "checkout") {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
        <View
          style={[
            styles.header,
            { backgroundColor: colors.bg, borderBottomColor: colors.border },
          ]}
        >
          <Pressable onPress={() => setScreen("form")} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.ink, fontFamily: fontFamilies.display },
            ]}
          >
            Checkout
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
            paddingTop: spacing(6),
            paddingBottom: isDesktop ? spacing(12) : spacing(24),
          }}
        >
          {/* Fee Card */}
          <View
            style={[
              styles.feeCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.feeLabel,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
            >
              Platform Publishing Fee
            </Text>
            <Text
              style={[
                styles.feeAmount,
                { color: colors.gold, fontFamily: fontFamilies.display },
              ]}
            >
              {CURRENCY} {PLATFORM_FEE.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.feeHint,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
            >
              One-time fee to publish this {CATEGORIES[activeIndex].label.toLowerCase()}.
            </Text>
          </View>

          {/* Payment Methods */}
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) },
            ]}
          >
            Pay With
          </Text>

          <View style={{ gap: spacing(3) }}>
            {/* TNM Mpamba */}
            <Pressable
              onPress={() => setPayMethod("tnm")}
              style={[
                styles.payRow,
                {
                  backgroundColor: payMethod === "tnm" ? colors.gold + "15" : colors.surface,
                  borderColor: payMethod === "tnm" ? colors.gold : colors.border,
                },
              ]}
            >
              <Image
                source={require("@/assets/images/tnm_mpamba.jpg")}
                style={styles.payIcon}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.payTitle,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  TNM Mpamba
                </Text>
                <Text
                  style={[
                    styles.paySub,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Pay with mobile money
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: payMethod === "tnm" ? colors.gold : colors.border,
                    backgroundColor: payMethod === "tnm" ? colors.gold : "transparent",
                  },
                ]}
              >
                {payMethod === "tnm" && (
                  <Feather name="check" size={14} color={colors.black} />
                )}
              </View>
            </Pressable>

            {/* Airtel Money */}
            <Pressable
              onPress={() => setPayMethod("airtel")}
              style={[
                styles.payRow,
                {
                  backgroundColor: payMethod === "airtel" ? colors.gold + "15" : colors.surface,
                  borderColor: payMethod === "airtel" ? colors.gold : colors.border,
                },
              ]}
            >
              <Image
                source={require("@/assets/images/airtel-money.png")}
                style={styles.payIcon}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.payTitle,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  Airtel Money
                </Text>
                <Text
                  style={[
                    styles.paySub,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Pay with mobile money
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: payMethod === "airtel" ? colors.gold : colors.border,
                    backgroundColor: payMethod === "airtel" ? colors.gold : "transparent",
                  },
                ]}
              >
                {payMethod === "airtel" && (
                  <Feather name="check" size={14} color={colors.black} />
                )}
              </View>
            </Pressable>

            {/* Card */}
            <Pressable
              onPress={() => setPayMethod("card")}
              style={[
                styles.payRow,
                {
                  backgroundColor: payMethod === "card" ? colors.gold + "15" : colors.surface,
                  borderColor: payMethod === "card" ? colors.gold : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.payIconFallback,
                  { backgroundColor: colors.bgAlt },
                ]}
              >
                <Feather name="credit-card" size={22} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.payTitle,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  Credit / Debit Card
                </Text>
                <Text
                  style={[
                    styles.paySub,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Visa, Mastercard, etc.
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: payMethod === "card" ? colors.gold : colors.border,
                    backgroundColor: payMethod === "card" ? colors.gold : "transparent",
                  },
                ]}
              >
                {payMethod === "card" && (
                  <Feather name="check" size={14} color={colors.black} />
                )}
              </View>
            </Pressable>
          </View>

          {/* Pay Button */}
          <Pressable
            onPress={handlePay}
            disabled={paying}
            style={[
              styles.payBtn,
              { backgroundColor: colors.gold, opacity: paying ? 0.7 : 1 },
            ]}
          >
            {paying ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text
                style={[
                  styles.payBtnText,
                  { color: colors.black, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                Pay {CURRENCY} {PLATFORM_FEE.toLocaleString()}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  /* ---------------------------------------------------------------- */
  // RENDER: SUCCESS
  /* ---------------------------------------------------------------- */
  if (screen === "success") {
    return (
      <View
        style={[
          styles.wrap,
          { backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <View
          style={[
            styles.successCircle,
            { backgroundColor: colors.gold + "20" },
          ]}
        >
          <Feather name="check" size={48} color={colors.gold} />
        </View>
        <Text
          style={[
            styles.successTitle,
            { color: colors.ink, fontFamily: fontFamilies.display },
          ]}
        >
          {createdEvent?.status === "pending_review" ? "Submitted for Review" : "Draft Saved"}
        </Text>
        <Text
          style={[
            styles.successSub,
            { color: colors.inkMuted, fontFamily: fontFamilies.body },
          ]}
        >
          {createdEvent?.status === "pending_review"
            ? "Your event is waiting for moderation before it can be published."
            : "Your event is private. Submit it when it is ready for moderation."}
        </Text>
        {createdEvent?.status === "draft" && (
          <Pressable
            disabled={submitting}
            onPress={handleSubmitForReview}
            style={[
              styles.publishBtn,
              { backgroundColor: colors.gold, marginTop: spacing(6), opacity: submitting ? 0.65 : 1 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.publishText, { color: colors.white, fontFamily: fontFamilies.bodySemi }]}>
                Submit for Review
              </Text>
            )}
          </Pressable>
        )}
        {!!formError && (
          <Text style={[styles.successSub, { color: "#DC2626", marginTop: spacing(3) }]}>
            {formError}
          </Text>
        )}
        <Pressable
          onPress={resetForm}
          style={[
            styles.publishBtn,
            {
              backgroundColor: createdEvent?.status === "draft" ? colors.surface : colors.gold,
              borderColor: colors.border,
              borderWidth: createdEvent?.status === "draft" ? 1 : 0,
              marginTop: spacing(3),
            },
          ]}
        >
          <Text
            style={[
              styles.publishText,
              {
                color: createdEvent?.status === "draft" ? colors.ink : colors.white,
                fontFamily: fontFamilies.bodySemi,
              },
            ]}
          >
            Create Another
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ---------------------------------------------------------------- */
  // RENDER: FORM (default)
  /* ---------------------------------------------------------------- */
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ width: 40 }} />
        <Text
          style={[
            styles.headerTitle,
            { color: colors.ink, fontFamily: fontFamilies.display },
          ]}
        >
          Create {CATEGORIES[activeIndex].label}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Manage courier operations"
            onPress={() => setShowCourierManagement(true)}
            style={styles.historyBtn}
            hitSlop={8}
          >
            <Feather name="truck" size={21} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityLabel="View event history"
            onPress={() => setShowHistory(true)}
            style={styles.historyBtn}
            hitSlop={8}
          >
            <Feather name="clock" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(3),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
        showsVerticalScrollIndicator={false}
      >
        {!!editingModerationNote && (
          <View
            style={[
              styles.moderationNotice,
              { backgroundColor: "rgba(220, 38, 38, 0.08)", borderColor: "#DC2626" },
            ]}
          >
            <Text style={{ color: "#DC2626", fontFamily: fontFamilies.bodySemi }}>
              Changes requested
            </Text>
            <Text style={{ color: colors.ink, fontFamily: fontFamilies.body }}>
              {editingModerationNote}
            </Text>
          </View>
        )}
        {/* Category selector */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.ink, fontFamily: fontFamilies.bodySemi },
          ]}
        >
          Select Category
        </Text>
        <View style={styles.typeGrid}>
          {CATEGORIES.map((cat, index) => {
            const active = index === activeIndex;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setActiveIndex(index)}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: active ? colors.gold : colors.surface,
                    borderColor: active ? colors.gold : colors.border,
                  },
                ]}
              >
                <Feather
                  name={cat.icon}
                  size={22}
                  color={active ? colors.black : colors.ink}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: active ? colors.black : colors.ink,
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
                <Text
                  style={[
                    styles.typeDesc,
                    {
                      color: active ? colors.black + "CC" : colors.inkMuted,
                      fontFamily: fontFamilies.body,
                    },
                  ]}
                >
                  {cat.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Upload */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.ink, fontFamily: fontFamilies.bodySemi },
          ]}
        >
          Cover Image
        </Text>
        <Pressable
          style={[
            styles.uploadBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setImageName("uploaded_cover.jpg")}
        >
          <View style={[styles.uploadCircle, { backgroundColor: colors.bgAlt }]}>
            <Feather name="image" size={28} color={colors.inkMuted} />
          </View>
          <Text
            style={[
              styles.uploadText,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            {imageName ? imageName : "Tap to upload cover image"}
          </Text>
          <Text
            style={[
              styles.uploadHint,
              { color: colors.inkMuted + "99", fontFamily: fontFamilies.body },
            ]}
          >
            Recommendation: high-quality .jpg under 20 MB
          </Text>
        </Pressable>

        {/* Basic Info */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.ink, fontFamily: fontFamilies.bodySemi },
          ]}
        >
          Basic Information
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <FormField label={labels.title} colors={colors}>
            <TextInput
              placeholder={placeholders.title}
              placeholderTextColor={colors.inkMuted}
              value={title}
              onChangeText={setTitle}
              style={[styles.input, inputBase]}
            />
          </FormField>

          <FormField label={labels.subtitle} colors={colors}>
            <TextInput
              placeholder={placeholders.subtitle}
              placeholderTextColor={colors.inkMuted}
              value={subtitle}
              onChangeText={setSubtitle}
              style={[styles.input, inputBase]}
            />
          </FormField>

          <FormField label={labels.organizer} colors={colors}>
            <TextInput
              placeholder={placeholders.organizer}
              placeholderTextColor={colors.inkMuted}
              value={organizer}
              editable={false}
              style={[styles.input, inputBase]}
            />
          </FormField>

          <View style={styles.row}>
            <FormField label={labels.date} colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="2026-08-15"
                placeholderTextColor={colors.inkMuted}
                value={date}
                onChangeText={setDate}
                style={[styles.input, inputBase]}
              />
            </FormField>
            <View style={{ width: spacing(3) }} />
            <FormField label={labels.time} colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="6:00 AM"
                placeholderTextColor={colors.inkMuted}
                value={time}
                onChangeText={setTime}
                style={[styles.input, inputBase]}
              />
            </FormField>
          </View>

          <FormField label={labels.location} colors={colors}>
            <TextInput
              placeholder={venues.length ? "Select a venue below" : "Loading venues..."}
              placeholderTextColor={colors.inkMuted}
              value={location}
              editable={false}
              style={[styles.input, inputBase]}
            />
            <View style={styles.venueGrid}>
              {venues.map((venue) => {
                const selected = venue.id === selectedVenueId;
                return (
                  <Pressable
                    key={venue.id}
                    onPress={() => {
                      setSelectedVenueId(venue.id);
                      setLocation(`${venue.name}, ${venue.city}`);
                      setFormError("");
                    }}
                    style={[
                      styles.venueChip,
                      {
                        backgroundColor: selected ? colors.gold : colors.surface,
                        borderColor: selected ? colors.gold : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? colors.black : colors.ink,
                        fontFamily: fontFamilies.bodySemi,
                      }}
                    >
                      {venue.name}
                    </Text>
                    <Text
                      style={{
                        color: selected ? colors.black : colors.inkMuted,
                        fontFamily: fontFamilies.body,
                        fontSize: 12,
                      }}
                    >
                      {venue.city}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </FormField>
        </View>

        {/* Route */}
        {showRoute && (
          <>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.ink,
                  fontFamily: fontFamilies.bodySemi,
                  marginTop: spacing(5),
                },
              ]}
            >
              {isBus ? "Route Details" : "Flight Details"}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.row}>
                <FormField label={labels.routeFrom} colors={colors} style={{ flex: 1 }}>
                  <TextInput
                    placeholder={placeholders.routeFrom}
                    placeholderTextColor={colors.inkMuted}
                    value={route.from}
                    onChangeText={(v) => setRoute((r) => ({ ...r, from: v }))}
                    style={[styles.input, inputBase]}
                  />
                </FormField>
                <View style={{ width: spacing(3) }} />
                <FormField label={labels.routeTo} colors={colors} style={{ flex: 1 }}>
                  <TextInput
                    placeholder={placeholders.routeTo}
                    placeholderTextColor={colors.inkMuted}
                    value={route.to}
                    onChangeText={(v) => setRoute((r) => ({ ...r, to: v }))}
                    style={[styles.input, inputBase]}
                  />
                </FormField>
              </View>

              <View style={styles.row}>
                <FormField label={labels.routeDuration} colors={colors} style={{ flex: 1 }}>
                  <TextInput
                    placeholder={placeholders.routeDuration}
                    placeholderTextColor={colors.inkMuted}
                    value={route.duration}
                    onChangeText={(v) => setRoute((r) => ({ ...r, duration: v }))}
                    style={[styles.input, inputBase]}
                  />
                </FormField>
                <View style={{ width: spacing(3) }} />
                <FormField label={labels.routeStops} colors={colors} style={{ flex: 1 }}>
                  <TextInput
                    placeholder={placeholders.routeStops}
                    placeholderTextColor={colors.inkMuted}
                    value={route.stops}
                    onChangeText={(v) => setRoute((r) => ({ ...r, stops: v }))}
                    style={[styles.input, inputBase]}
                  />
                </FormField>
              </View>
            </View>
          </>
        )}

        {/* Description */}
        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.ink,
              fontFamily: fontFamilies.bodySemi,
              marginTop: spacing(5),
            },
          ]}
        >
          {labels.description}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TextInput
            placeholder={placeholders.description}
            placeholderTextColor={colors.inkMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            style={[styles.textarea, inputBase]}
          />
        </View>

        {/* Tags */}
        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.ink,
              fontFamily: fontFamilies.bodySemi,
              marginTop: spacing(5),
            },
          ]}
        >
          Tags
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <TextInput
              placeholder="Add tag and press return"
              placeholderTextColor={colors.inkMuted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
              style={[styles.input, inputBase, { flex: 1 }]}
            />
            <Pressable
              onPress={addTag}
              style={[
                styles.addBtn,
                { backgroundColor: colors.gold, marginLeft: spacing(2) },
              ]}
            >
              <Feather name="plus" size={18} color={colors.black} />
            </Pressable>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: colors.bgAlt }]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    {tag}
                  </Text>
                  <Pressable onPress={() => removeTag(tag)} hitSlop={6}>
                    <Feather name="x" size={14} color={colors.inkMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tiers */}
        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.ink,
              fontFamily: fontFamilies.bodySemi,
              marginTop: spacing(5),
            },
          ]}
        >
          {isBus || isFlight ? "Seat / Cabin Tiers" : "Ticket Tiers"}
        </Text>
        {tiers.map((tier, idx) => (
          <View
            key={tier.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface, marginBottom: spacing(3) },
            ]}
          >
            <View style={styles.tierHeader}>
              <Text
                style={[
                  styles.tierTitle,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                Tier {idx + 1}
              </Text>
              {tiers.length > 1 && (
                <Pressable onPress={() => removeTier(tier.id)} hitSlop={8}>
                  <Feather name="trash-2" size={18} color={colors.inkMuted} />
                </Pressable>
              )}
            </View>

            <View style={styles.row}>
              <FormField label={labels.tierName} colors={colors} style={{ flex: 1 }}>
                <TextInput
                  placeholder={
                    isBus
                      ? "Economy, Business, Sleeper"
                      : isFlight
                      ? "Economy, Business"
                      : "Standard, VIP, Group"
                  }
                  placeholderTextColor={colors.inkMuted}
                  value={tier.name}
                  onChangeText={(v) => updateTier(tier.id, "name", v)}
                  style={[styles.input, inputBase]}
                />
              </FormField>
              <View style={{ width: spacing(3) }} />
              <FormField label="Price" colors={colors} style={{ flex: 1 }}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.inkMuted}
                  value={tier.price}
                  onChangeText={(v) => updateTier(tier.id, "price", v.replace(/\D/g, ""))}
                  keyboardType={Platform.OS === "web" ? "default" : "numeric"}
                  style={[styles.input, inputBase]}
                />
              </FormField>
            </View>

            <View style={styles.row}>
              <FormField label="Currency" colors={colors} style={{ flex: 1 }}>
                <TextInput
                  placeholder="MWK"
                  placeholderTextColor={colors.inkMuted}
                  value={tier.currency}
                  onChangeText={(v) => updateTier(tier.id, "currency", v)}
                  style={[styles.input, inputBase]}
                />
              </FormField>
              <View style={{ width: spacing(3) }} />
              <FormField label={labels.tierRemaining} colors={colors} style={{ flex: 1 }}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.inkMuted}
                  value={tier.remaining}
                  onChangeText={(v) => updateTier(tier.id, "remaining", v.replace(/\D/g, ""))}
                  keyboardType={Platform.OS === "web" ? "default" : "numeric"}
                  style={[styles.input, inputBase]}
                />
              </FormField>
            </View>

            <FormField label="Perks (comma separated)" colors={colors}>
              <TextInput
                placeholder={
                  isBus
                    ? "Wi-Fi, Charging Ports, Meals"
                    : isFlight
                    ? "23kg Baggage, Meals, Lounge Access"
                    : "Guided Tour, Equipment, Meals"
                }
                placeholderTextColor={colors.inkMuted}
                value={tier.perks}
                onChangeText={(v) => updateTier(tier.id, "perks", v)}
                style={[styles.input, inputBase]}
              />
            </FormField>
          </View>
        ))}

        <Pressable
          onPress={addTier}
          style={[styles.addTierBtn, { borderColor: colors.gold }]}
        >
          <Feather name="plus" size={16} color={colors.gold} />
          <Text
            style={[
              styles.addTierText,
              { color: colors.gold, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            Add another tier
          </Text>
        </Pressable>

        {/* Limits */}
        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.ink,
              fontFamily: fontFamilies.bodySemi,
              marginTop: spacing(5),
            },
          ]}
        >
          Purchase Limits
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <FormField label="Max tickets per user" colors={colors}>
            <TextInput
              placeholder="5"
              placeholderTextColor={colors.inkMuted}
              value={maxPerUser}
              onChangeText={(v) => setMaxPerUser(v.replace(/\D/g, ""))}
              keyboardType={Platform.OS === "web" ? "default" : "numeric"}
              style={[styles.input, inputBase, { width: 120 }]}
            />
          </FormField>
        </View>

        {/* Publish */}
        {!!formError && (
          <Text style={[styles.formError, { color: "#DC2626", fontFamily: fontFamilies.body }]}>
            {formError}
          </Text>
        )}
        <View style={styles.actions}>
          <Pressable
            disabled={saving}
            onPress={handleGoToPayment}
            style={[styles.publishBtn, { backgroundColor: colors.gold, opacity: saving ? 0.65 : 1 }]}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text
                style={[
                  styles.publishText,
                  { color: colors.white, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                {editingEventId ? "Update Event Draft" : "Save Event Draft"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Sub-components
/* ------------------------------------------------------------------ */
function ModerationPanel({ token }: { token: string }) {
  const { colors } = useLumTheme();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [reportedPosts, setReportedPosts] = useState<ReportedApiPost[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetchEventModerationQueue(token, controller.signal),
      fetchPostModerationQueue(token, controller.signal),
    ])
      .then(([eventItems, postItems]) => {
        setEvents(eventItems);
        setReportedPosts(postItems);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "The moderation queue could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  const review = async (event: ApiEvent, decision: "approve" | "reject") => {
    const note = notes[event.id]?.trim() ?? "";
    if (decision === "reject" && note.length < 10) {
      setErrorMessage("A rejection note must contain at least 10 characters.");
      return;
    }

    setReviewingId(event.id);
    setErrorMessage("");
    try {
      await moderateEvent(
        event.id,
        decision === "approve"
          ? { decision, ...(note ? { note } : {}) }
          : { decision, note },
        token,
      );
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The review could not be saved.");
    } finally {
      setReviewingId(null);
    }
  };

  const reviewPost = async (
    post: ReportedApiPost,
    decision: "dismiss" | "hide",
  ) => {
    const note = notes[post.id]?.trim() ?? "";
    if (decision === "hide" && note.length < 10) {
      setErrorMessage("A hide-post note must contain at least 10 characters.");
      return;
    }

    setReviewingId(post.id);
    setErrorMessage("");
    try {
      await moderatePost(
        post.id,
        decision === "hide"
          ? { decision, note }
          : { decision, ...(note ? { note } : {}) },
        token,
      );
      setReportedPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The review could not be saved.");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ width: 40 }} />
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          Content Moderation
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.moderationQueue}
        showsVerticalScrollIndicator={false}
      >
        {loading && <ActivityIndicator color={colors.gold} size="large" />}
        {!loading && events.length === 0 && reportedPosts.length === 0 && (
          <View style={styles.gate}>
            <Feather name="check-circle" size={42} color={colors.gold} />
            <Text style={[styles.successTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
              Queue is clear
            </Text>
            <Text style={[styles.successSub, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
              There are no events or reported posts waiting for review.
            </Text>
          </View>
        )}
        {events.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
            Events awaiting publication
          </Text>
        )}
        {events.map((event) => (
          <View
            key={event.id}
            style={[
              styles.moderationCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.successTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
              {event.title}
            </Text>
            <Text style={[styles.historyMeta, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
              {event.organizer.name} · {event.venue.name} ·{" "}
              {new Date(event.startsAt).toLocaleString()}
            </Text>
            <Text style={{ color: colors.ink, fontFamily: fontFamilies.body }}>
              {event.description}
            </Text>
            <TextInput
              multiline
              placeholder="Review note (required when requesting changes)"
              placeholderTextColor={colors.inkMuted}
              value={notes[event.id] ?? ""}
              onChangeText={(note) =>
                setNotes((current) => ({ ...current, [event.id]: note }))
              }
              style={[
                styles.moderationInput,
                {
                  color: colors.ink,
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  fontFamily: fontFamilies.body,
                },
              ]}
            />
            <View style={styles.moderationActions}>
              <Pressable
                disabled={reviewingId === event.id}
                onPress={() => void review(event, "reject")}
                style={[styles.reviewBtn, { borderColor: "#DC2626" }]}
              >
                <Text style={{ color: "#DC2626", fontFamily: fontFamilies.bodySemi }}>
                  Request Changes
                </Text>
              </Pressable>
              <Pressable
                disabled={reviewingId === event.id}
                onPress={() => void review(event, "approve")}
                style={[styles.reviewBtn, { backgroundColor: colors.gold, borderColor: colors.gold }]}
              >
                {reviewingId === event.id ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white, fontFamily: fontFamilies.bodySemi }}>
                    Approve & Publish
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
        {reportedPosts.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
            Reported feed posts
          </Text>
        )}
        {reportedPosts.map((post) => (
          <View
            key={post.id}
            style={[
              styles.moderationCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.successTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
              {post.author.name}
            </Text>
            <Text style={{ color: colors.ink, fontFamily: fontFamilies.body }}>
              {post.caption}
            </Text>
            {!!post.media[0] && post.media[0].type === "image" && (
              <Image
                source={{ uri: post.media[0].url }}
                style={styles.moderationPostImage}
                resizeMode="cover"
              />
            )}
            <Text style={[styles.historyMeta, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
              {post.reports.length} open {post.reports.length === 1 ? "report" : "reports"} ·{" "}
              {post.reports.map((report) => report.reason).join(", ")}
            </Text>
            <TextInput
              multiline
              placeholder="Moderator note (required when hiding)"
              placeholderTextColor={colors.inkMuted}
              value={notes[post.id] ?? ""}
              onChangeText={(note) =>
                setNotes((current) => ({ ...current, [post.id]: note }))
              }
              style={[
                styles.moderationInput,
                {
                  color: colors.ink,
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  fontFamily: fontFamilies.body,
                },
              ]}
            />
            <View style={styles.moderationActions}>
              <Pressable
                disabled={reviewingId === post.id}
                onPress={() => void reviewPost(post, "dismiss")}
                style={[styles.reviewBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.bodySemi }}>
                  Dismiss Reports
                </Text>
              </Pressable>
              <Pressable
                disabled={reviewingId === post.id}
                onPress={() => void reviewPost(post, "hide")}
                style={[styles.reviewBtn, { backgroundColor: "#DC2626", borderColor: "#DC2626" }]}
              >
                {reviewingId === post.id ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white, fontFamily: fontFamilies.bodySemi }}>
                    Hide Post
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
        {!!errorMessage && (
          <Text style={[styles.formError, { color: "#DC2626", fontFamily: fontFamilies.body }]}>
            {errorMessage}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function FormField({
  label,
  colors,
  children,
  style,
}: {
  label: string;
  colors: any;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ gap: spacing(1) }, style]}>
      <Text
        style={[
          styles.label,
          { color: colors.ink, fontFamily: fontFamilies.bodySemi },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Styles
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  wrap: { width: "100%", flex: 1 },
  gate: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    minHeight: 480,
    padding: spacing(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  scroll: { flex: 1 },

  sectionLabel: {
    fontSize: 15,
    marginBottom: spacing(2),
    marginTop: spacing(2),
  },

  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(3),
    marginBottom: spacing(2),
  },
  typeCard: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(4),
    gap: spacing(1.5),
    alignItems: "flex-start",
  },
  typeLabel: { fontSize: 15 },
  typeDesc: { fontSize: 13 },
  venueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(2),
    marginTop: spacing(2),
  },
  historyEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  venueChip: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    minWidth: 150,
  },
  formError: {
    fontSize: 14,
    marginTop: spacing(4),
  },
  moderationNotice: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(3),
    gap: spacing(1),
    marginBottom: spacing(3),
  },
  moderationQueue: {
    padding: spacing(4),
    gap: spacing(4),
    paddingBottom: spacing(16),
  },
  moderationCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(5),
    gap: spacing(3),
  },
  moderationInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(3),
    textAlignVertical: "top",
  },
  moderationPostImage: {
    width: "100%",
    height: 220,
    borderRadius: radii.lg,
  },
  moderationActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing(2),
  },
  reviewBtn: {
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    minWidth: 150,
    alignItems: "center",
  },

  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radii.xl,
    paddingVertical: spacing(8),
    paddingHorizontal: spacing(6),
    alignItems: "center",
    gap: spacing(2),
    marginBottom: spacing(2),
  },
  uploadCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: { fontSize: 15 },
  uploadHint: { fontSize: 13 },

  card: {
    borderRadius: radii.xl,
    padding: spacing(4),
    gap: spacing(3),
  },

  row: { flexDirection: "row", alignItems: "flex-start" },

  label: { fontSize: 14 },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(2),
    marginTop: spacing(2),
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  tagText: { fontSize: 13 },

  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierTitle: { fontSize: 15 },

  addTierBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(3),
    borderWidth: 1.5,
    borderRadius: radii.lg,
    borderStyle: "dashed",
  },
  addTierText: { fontSize: 15 },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing(6),
    marginBottom: spacing(4),
  },
  publishBtn: {
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(4),
    borderRadius: radii.full,
  },
  publishText: { fontSize: 16 },

  /* ---- Checkout ---- */
  feeCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(6),
    alignItems: "center",
    gap: spacing(2),
  },
  feeLabel: { fontSize: 15 },
  feeAmount: { fontSize: 32, fontWeight: "800" },
  feeHint: { fontSize: 14, textAlign: "center" },

  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    padding: spacing(4),
    borderWidth: 1.5,
    borderRadius: radii.xl,
  },
  payIcon: { width: 44, height: 44 },
  payIconFallback: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  payTitle: { fontSize: 15 },
  paySub: { fontSize: 13, marginTop: 2 },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  payBtn: {
    marginTop: spacing(6),
    paddingVertical: spacing(4),
    borderRadius: radii.full,
    alignItems: "center",
  },
  payBtnText: { fontSize: 16 },

  /* ---- Success ---- */
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing(4),
  },
  successTitle: { fontSize: 24, marginBottom: spacing(2) },
  successSub: { fontSize: 15, textAlign: "center", paddingHorizontal: spacing(6) },

  /* ---- History ---- */
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(2),
  },
  historyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  historyTitle: { fontSize: 15 },
  historyMeta: { fontSize: 13, marginTop: 2 },
  historyBadge: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  historyBadgeText: { fontSize: 12, textTransform: "capitalize" },
});
