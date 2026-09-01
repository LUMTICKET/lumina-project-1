import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  type ApiCourierListing,
  type ApiParcelTracking,
  trackParcel,
} from "../api/couriers";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

const STATUS_LABELS: Record<string, string> = {
  created: "Shipment created",
  received: "Received",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Delivery exception",
  cancelled: "Cancelled",
};

function money(minor: number, currency: string) {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

interface Props {
  courier: ApiCourierListing;
  onClose: () => void;
}

export default function CourierDetails({ courier, onClose }: Props) {
  const { colors } = useLumTheme();
  const [trackingCode, setTrackingCode] = useState("");
  const [tracking, setTracking] = useState<ApiParcelTracking | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const submitTracking = async () => {
    const code = trackingCode.trim();
    if (!code) {
      setMessage("Enter a tracking code.");
      setState("error");
      return;
    }
    setState("loading");
    setMessage("");
    try {
      setTracking(await trackParcel(code));
      setState("idle");
    } catch (error) {
      setTracking(null);
      setMessage(error instanceof Error ? error.message : "Tracking could not be loaded.");
      setState("error");
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back to search" onPress={onClose} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.goldDeep }]}>COURIER SERVICE</Text>
      </View>

      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <View style={[styles.logo, { backgroundColor: colors.gold }]}>
          <Feather name="truck" size={30} color={colors.black} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.title, { color: colors.ink }]}>{courier.name}</Text>
          <Text style={[styles.description, { color: colors.inkMuted }]}>
            {courier.description}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={[styles.metric, { borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.inkMuted }]}>From</Text>
          <Text style={[styles.metricValue, { color: colors.ink }]}>
            {money(courier.basePriceMinor, courier.currency)}
          </Text>
        </View>
        <View style={[styles.metric, { borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.inkMuted }]}>Estimate</Text>
          <Text style={[styles.metricValue, { color: colors.ink }]}>
            {courier.estimatedMinHours}–{courier.estimatedMaxHours} hours
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.ink }]}>Coverage</Text>
      <View style={styles.chips}>
        {courier.serviceAreas.map((area) => (
          <View key={area} style={[styles.chip, { backgroundColor: colors.bgAlt }]}>
            <Text style={[styles.chipText, { color: colors.ink }]}>{area}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tracker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Track a parcel</Text>
        <Text style={[styles.helper, { color: colors.inkMuted }]}>
          Try the seeded demo code LMN-DEMO-2026 after the backend database is seeded.
        </Text>
        <View style={styles.trackRow}>
          <TextInput
            accessibilityLabel="Parcel tracking code"
            autoCapitalize="characters"
            placeholder="LMN-..."
            placeholderTextColor={colors.inkMuted}
            value={trackingCode}
            onChangeText={setTrackingCode}
            onSubmitEditing={() => void submitTracking()}
            returnKeyType="search"
            style={[
              styles.input,
              { color: colors.ink, borderColor: colors.border, backgroundColor: colors.bgAlt },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => void submitTracking()}
            style={[styles.trackButton, { backgroundColor: colors.gold }]}
          >
            {state === "loading" ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={[styles.trackButtonText, { color: colors.black }]}>Track</Text>
            )}
          </Pressable>
        </View>
        {state === "error" && (
          <Text style={[styles.error, { color: colors.inkMuted }]}>{message}</Text>
        )}

        {tracking && (
          <View style={styles.result}>
            <View style={styles.route}>
              <Text style={[styles.status, { color: colors.goldDeep }]}>
                {STATUS_LABELS[tracking.status]}
              </Text>
              <Text style={[styles.routeText, { color: colors.ink }]}>
                {tracking.origin} → {tracking.destination}
              </Text>
              <Text style={[styles.code, { color: colors.inkMuted }]}>
                {tracking.trackingCode}
              </Text>
            </View>
            <View style={styles.timeline}>
              {[...tracking.events].reverse().map((event, index) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.rail}>
                    <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                    {index < tracking.events.length - 1 && (
                      <View style={[styles.line, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.eventCopy}>
                    <Text style={[styles.eventTitle, { color: colors.ink }]}>
                      {STATUS_LABELS[event.status]}
                    </Text>
                    <Text style={[styles.eventMessage, { color: colors.inkMuted }]}>
                      {event.message}{event.location ? ` · ${event.location}` : ""}
                    </Text>
                    <Text style={[styles.eventTime, { color: colors.inkMuted }]}>
                      {new Date(event.occurredAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 960, alignSelf: "center", padding: spacing(5), paddingBottom: spacing(24), gap: spacing(5) },
  header: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontFamily: fontFamilies.bodySemi, fontSize: 12, letterSpacing: 1.5 },
  hero: { borderRadius: radii.xl, borderWidth: 1, padding: spacing(6), flexDirection: "row", gap: spacing(4), alignItems: "center" },
  logo: { width: 64, height: 64, borderRadius: radii.lg, alignItems: "center", justifyContent: "center" },
  heroCopy: { flex: 1, gap: spacing(2) },
  title: { fontFamily: fontFamilies.display, fontSize: 28 },
  description: { fontFamily: fontFamilies.body, fontSize: 15, lineHeight: 22 },
  metrics: { flexDirection: "row", gap: spacing(3) },
  metric: { flex: 1, borderWidth: 1, borderRadius: radii.lg, padding: spacing(4), gap: spacing(1) },
  metricLabel: { fontFamily: fontFamilies.body, fontSize: 12 },
  metricValue: { fontFamily: fontFamilies.bodySemi, fontSize: 16 },
  sectionTitle: { fontFamily: fontFamilies.display, fontSize: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  chip: { borderRadius: radii.full, paddingHorizontal: spacing(3), paddingVertical: spacing(2) },
  chipText: { fontFamily: fontFamilies.bodySemi, fontSize: 13 },
  tracker: { borderWidth: 1, borderRadius: radii.xl, padding: spacing(5), gap: spacing(3) },
  helper: { fontFamily: fontFamilies.body, fontSize: 13, lineHeight: 19 },
  trackRow: { flexDirection: "row", gap: spacing(2) },
  input: { flex: 1, height: 48, borderRadius: radii.md, borderWidth: 1, paddingHorizontal: spacing(3), fontFamily: fontFamilies.body },
  trackButton: { minWidth: 90, height: 48, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  trackButtonText: { fontFamily: fontFamilies.bodySemi, fontSize: 14 },
  error: { fontFamily: fontFamilies.body, fontSize: 13 },
  result: { marginTop: spacing(2), gap: spacing(5) },
  route: { gap: spacing(1) },
  status: { fontFamily: fontFamilies.bodySemi, fontSize: 14 },
  routeText: { fontFamily: fontFamilies.display, fontSize: 22 },
  code: { fontFamily: fontFamilies.body, fontSize: 12 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", minHeight: 86 },
  rail: { width: 22, alignItems: "center" },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1 },
  eventCopy: { flex: 1, paddingLeft: spacing(3), paddingBottom: spacing(4), gap: spacing(1) },
  eventTitle: { fontFamily: fontFamilies.bodySemi, fontSize: 14 },
  eventMessage: { fontFamily: fontFamilies.body, fontSize: 13, lineHeight: 18 },
  eventTime: { fontFamily: fontFamilies.body, fontSize: 11 },
});
