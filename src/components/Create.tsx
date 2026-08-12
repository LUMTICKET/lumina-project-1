import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

/* ------------------------------------------------------------------ */
// Types
/* ------------------------------------------------------------------ */
type CategoryKey = "event" | "bus" | "flight" | "tourism";

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
  themeColor: string; // used as accent hint
}

/* ------------------------------------------------------------------ */
// Category definitions
/* ------------------------------------------------------------------ */
const CATEGORIES: CategoryMeta[] = [
  {
    key: "event",
    label: "Event",
    icon: "calendar",
    desc: "Concerts, sports, festivals",
    themeColor: "#E11D48",
  },
  {
    key: "bus",
    label: "Bus Route",
    icon: "truck",
    desc: "Intercity & shuttle services",
    themeColor: "#059669",
  },
  {
    key: "flight",
    label: "Flight",
    icon: "send",
    desc: "Domestic & international flights",
    themeColor: "#2563EB",
  },
  {
    key: "tourism",
    label: "Tourism",
    icon: "map",
    desc: "Tours, parks, attractions",
    themeColor: "#D97706",
  },
];

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */
function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

/* ------------------------------------------------------------------ */
// Component
/* ------------------------------------------------------------------ */
export default function Create() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  /* ---- Active category ---- */
  const [activeIndex, setActiveIndex] = useState(0);
  const category = CATEGORIES[activeIndex].key;
  const isBus = category === "bus";
  const isFlight = category === "flight";
  const isEvent = category === "event";
  const isTourism = category === "tourism";
  const showRoute = isBus || isFlight;

  /* ---- Media ---- */
  const [imageName, setImageName] = useState("");

  /* ---- Core info ---- */
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  /* ---- Route (bus / flight) ---- */
  const [route, setRoute] = useState<RouteForm>({
    from: "",
    to: "",
    duration: "",
    stops: "",
  });

  /* ---- Description & tags ---- */
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  /* ---- Tiers ---- */
  const [tiers, setTiers] = useState<TierForm[]>([
    { id: makeId(), name: "", price: "", currency: "MWK", perks: "", remaining: "" },
  ]);

  const [maxPerUser, setMaxPerUser] = useState("5");

  /* ---------------------------------------------------------------- */
  // Dynamic labels based on category
  /* ---------------------------------------------------------------- */
  const labels = {
    title: isBus
      ? "Route Name"
      : isFlight
      ? "Flight Title"
      : isTourism
      ? "Tour Name"
      : "Event Name",
    subtitle: isBus
      ? "Route Summary"
      : isFlight
      ? "Flight Summary"
      : "Short Tagline",
    organizer: isBus
      ? "Bus Company"
      : isFlight
      ? "Airline"
      : isTourism
      ? "Tour Operator"
      : "Host / Organizer",
    location: isBus
      ? "Departure Terminal"
      : isFlight
      ? "Departure Airport"
      : isTourism
      ? "Meeting Point"
      : "Venue",
    date: isBus || isFlight || isTourism ? "Travel Date" : "Event Date",
    time: isBus || isFlight ? "Departure Time" : "Start Time",
    routeFrom: isFlight ? "Origin Airport" : "From (City)",
    routeTo: isFlight ? "Destination Airport" : "To (City)",
    routeDuration: isBus ? "Journey Duration" : "Flight Duration",
    routeStops: isBus ? "Stop-overs (comma separated)" : "Layovers (optional)",
    description: isBus
      ? "Route Description"
      : isFlight
      ? "Flight Details"
      : isTourism
      ? "Tour Details"
      : "Event Description",
    tierName: isBus
      ? "Seat Class"
      : isFlight
      ? "Cabin Class"
      : "Ticket Type",
    tierPrice: "Price",
    tierRemaining: isBus || isFlight ? "Available Seats" : "Available Slots",
  };

  const placeholders = {
    title: isBus
      ? "e.g. Captain Bus Express"
      : isFlight
      ? "e.g. Malawi Airlines - LLW to JNB"
      : isTourism
      ? "e.g. Mount Mulanje Sapitwa Trek"
      : "e.g. Lilongwe Food Fest",
    subtitle: isBus
      ? "Blantyre to Songwe Border, one comfortable journey"
      : isFlight
      ? "Non-stop flight, daily connections"
      : "A short hook that appears under the title",
    organizer: isBus
      ? "Captain Tours"
      : isFlight
      ? "Malawi Airlines"
      : isTourism
      ? "Mulanje Mountain Guides"
      : "Saba's Kitchen",
    location: isBus
      ? "Blantyre Bus Terminal"
      : isFlight
      ? "Kamuzu International Airport (LLW)"
      : isTourism
      ? "Likhubula Forest Lodge, Mulanje"
      : "Portuguese Club, Lilongwe",
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

  const handlePublish = () => {
    const payload = {
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
    };

    console.log("🚀 Publish payload:", JSON.stringify(payload, null, 2));
    // TODO: POST to backend or append to local state
  };

  /* ---------------------------------------------------------------- */
  // Render helpers
  /* ---------------------------------------------------------------- */
  const inputBase = {
    color: colors.ink,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    fontFamily: fontFamilies.body,
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: colors.ink, fontFamily: fontFamilies.display },
          ]}
        >
          Create {CATEGORIES[activeIndex].label}
        </Text>
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
        {/* ==================== CATEGORY SELECTOR ==================== */}
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

        {/* ==================== UPLOAD ==================== */}
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

        {/* ==================== BASIC INFO ==================== */}
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
              onChangeText={setOrganizer}
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
              placeholder={placeholders.location}
              placeholderTextColor={colors.inkMuted}
              value={location}
              onChangeText={setLocation}
              style={[styles.input, inputBase]}
            />
          </FormField>
        </View>

        {/* ==================== ROUTE (Bus / Flight only) ==================== */}
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

        {/* ==================== DESCRIPTION ==================== */}
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

        {/* ==================== TAGS ==================== */}
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

        {/* ==================== TIERS ==================== */}
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
              <FormField label={labels.tierPrice} colors={colors} style={{ flex: 1 }}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.inkMuted}
                  value={tier.price}
                  onChangeText={(v) => updateTier(tier.id, "price", v)}
                  keyboardType="numeric"
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
                  onChangeText={(v) => updateTier(tier.id, "remaining", v)}
                  keyboardType="numeric"
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

        {/* ==================== LIMITS ==================== */}
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
              onChangeText={setMaxPerUser}
              keyboardType="numeric"
              style={[styles.input, inputBase, { width: 120 }]}
            />
          </FormField>
        </View>

        {/* ==================== ACTIONS ==================== */}
        <View style={styles.actions}>
          <Pressable
            onPress={handlePublish}
            style={[styles.publishBtn, { backgroundColor: colors.gold }]}
          >
            <Text
              style={[
                styles.publishText,
                { color: colors.white, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Publish {CATEGORIES[activeIndex].label}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Sub-components
/* ------------------------------------------------------------------ */
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
  header: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scroll: { flex: 1 },

  sectionLabel: {
    fontSize: 14,
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
  typeDesc: { fontSize: 12 },

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
  uploadHint: { fontSize: 12 },

  card: {
    borderRadius: radii.xl,
    padding: spacing(4),
    gap: spacing(3),
  },

  row: { flexDirection: "row", alignItems: "flex-start" },

  label: { fontSize: 13 },

  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    fontSize: 14,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: 14,
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
  tagText: { fontSize: 12 },

  addBtn: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierTitle: { fontSize: 14 },

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
  addTierText: { fontSize: 14 },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing(6),
    marginBottom: spacing(4),
  },
  publishBtn: {
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(3.5),
    borderRadius: radii.full,
  },
  publishText: { fontSize: 15 },
});