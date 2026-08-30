import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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
  addCourierTrackingEvent,
  type ApiCourierListing,
  type ApiParcelTracking,
  createCourierListing,
  createCourierParcel,
  fetchCourierParcels,
  fetchOrganizerCourierListings,
  type ParcelStatus,
} from "../api/couriers";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

type ServiceLevel = "same_day" | "next_day" | "standard";
type NextStatus = Exclude<ParcelStatus, "created">;

const STATUS_LABELS: Record<ParcelStatus, string> = {
  created: "Created",
  received: "Received",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Exception",
  cancelled: "Cancelled",
};

const NEXT_STATUSES: Record<ParcelStatus, NextStatus[]> = {
  created: ["received", "cancelled"],
  received: ["in_transit", "cancelled"],
  in_transit: ["out_for_delivery", "exception"],
  out_for_delivery: ["delivered", "exception"],
  exception: ["in_transit", "out_for_delivery", "cancelled"],
  delivered: [],
  cancelled: [],
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  const { colors } = useLumTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: colors.ink,
            backgroundColor: colors.bgAlt,
            borderColor: colors.border,
          },
        ]}
      />
    </View>
  );
}

interface Props {
  token: string;
  onClose: () => void;
}

export default function CourierManagement({ token, onClose }: Props) {
  const { colors } = useLumTheme();
  const [listings, setListings] = useState<ApiCourierListing[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [parcels, setParcels] = useState<ApiParcelTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showListingForm, setShowListingForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [areas, setAreas] = useState("");
  const [price, setPrice] = useState("");
  const [minHours, setMinHours] = useState("4");
  const [maxHours, setMaxHours] = useState("72");
  const [levels, setLevels] = useState<ServiceLevel[]>(["standard"]);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [contents, setContents] = useState("");
  const [trackingLocation, setTrackingLocation] = useState("");

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedId) ?? null,
    [listings, selectedId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchOrganizerCourierListings(token, controller.signal)
      .then((items) => {
        setListings(items);
        setSelectedId(items[0]?.id ?? "");
        setShowListingForm(items.length === 0);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : "Courier services could not be loaded.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!selectedId) {
      setParcels([]);
      return;
    }
    const controller = new AbortController();
    void fetchCourierParcels(selectedId, token, controller.signal)
      .then(setParcels)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : "Parcels could not be loaded.");
        }
      });
    return () => controller.abort();
  }, [selectedId, token]);

  const toggleLevel = (level: ServiceLevel) => {
    setLevels((current) =>
      current.includes(level)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== level)
        : [...current, level],
    );
  };

  const saveListing = async () => {
    const serviceAreas = areas.split(",").map((area) => area.trim()).filter(Boolean);
    const priceValue = Number(price);
    const minValue = Number(minHours);
    const maxValue = Number(maxHours);
    if (
      name.trim().length < 2 ||
      description.trim().length < 10 ||
      serviceAreas.length === 0 ||
      !Number.isFinite(priceValue) ||
      !Number.isInteger(minValue) ||
      !Number.isInteger(maxValue)
    ) {
      setMessage("Complete the service name, description, areas, price, and delivery estimate.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const listing = await createCourierListing(
        {
          name: name.trim(),
          description: description.trim(),
          serviceAreas,
          serviceLevels: levels,
          basePriceMinor: Math.round(priceValue * 100),
          currency: "MWK",
          estimatedMinHours: minValue,
          estimatedMaxHours: maxValue,
        },
        token,
      );
      setListings((current) => [listing, ...current]);
      setSelectedId(listing.id);
      setShowListingForm(false);
      setName("");
      setDescription("");
      setAreas("");
      setPrice("");
      setMessage("Courier service created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Courier service could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const saveParcel = async () => {
    if (!selectedId || !origin.trim() || !destination.trim() || !recipientName.trim() || !recipientContact.trim()) {
      setMessage("Complete the parcel route and recipient fields.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const parcel = await createCourierParcel(
        selectedId,
        {
          origin: origin.trim(),
          destination: destination.trim(),
          recipientName: recipientName.trim(),
          recipientContact: recipientContact.trim(),
          ...(contents.trim() ? { contentsDescription: contents.trim() } : {}),
        },
        token,
      );
      setParcels((current) => [parcel, ...current]);
      setOrigin("");
      setDestination("");
      setRecipientName("");
      setRecipientContact("");
      setContents("");
      setMessage(`Parcel created: ${parcel.trackingCode}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Parcel could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (parcel: ApiParcelTracking, status: NextStatus) => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await addCourierTrackingEvent(
        parcel.id,
        {
          status,
          message: `Parcel marked as ${STATUS_LABELS[status].toLowerCase()}`,
          ...(trackingLocation.trim() ? { location: trackingLocation.trim() } : {}),
        },
        token,
      );
      setParcels((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setTrackingLocation("");
      setMessage(`${updated.trackingCode} updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tracking could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={onClose} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.ink }]}>Courier operations</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Manage services, parcels, and tracking
          </Text>
        </View>
        <Pressable
          onPress={() => setShowListingForm((current) => !current)}
          style={[styles.primarySmall, { backgroundColor: colors.gold }]}
        >
          <Feather name="plus" size={17} color={colors.black} />
          <Text style={[styles.primaryText, { color: colors.black }]}>Service</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!message && (
          <View style={[styles.notice, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
            <Text style={[styles.noticeText, { color: colors.ink }]}>{message}</Text>
          </View>
        )}

        {showListingForm && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>New courier service</Text>
            <Field label="Service name" value={name} onChangeText={setName} placeholder="CTS Courier" />
            <Field label="Description" value={description} onChangeText={setDescription} multiline />
            <Field label="Service areas" value={areas} onChangeText={setAreas} placeholder="Blantyre, Lilongwe, Mzuzu" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}><Field label="Starting price (MWK)" value={price} onChangeText={setPrice} keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Field label="Minimum hours" value={minHours} onChangeText={setMinHours} keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Field label="Maximum hours" value={maxHours} onChangeText={setMaxHours} keyboardType="numeric" /></View>
            </View>
            <View style={styles.chips}>
              {(["same_day", "next_day", "standard"] as const).map((level) => {
                const active = levels.includes(level);
                return (
                  <Pressable
                    key={level}
                    onPress={() => toggleLevel(level)}
                    style={[styles.chip, { backgroundColor: active ? colors.gold : colors.bgAlt }]}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.black : colors.ink }]}>
                      {level.replaceAll("_", " ")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable disabled={saving} onPress={() => void saveListing()} style={[styles.primary, { backgroundColor: colors.gold }]}>
              {saving ? <ActivityIndicator color={colors.black} /> : <Text style={[styles.primaryText, { color: colors.black }]}>Create service</Text>}
            </Pressable>
          </View>
        )}

        {listings.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Your services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {listings.map((listing) => (
                <Pressable
                  key={listing.id}
                  onPress={() => setSelectedId(listing.id)}
                  style={[
                    styles.serviceChip,
                    {
                      backgroundColor: listing.id === selectedId ? colors.gold : colors.bgAlt,
                      borderColor: listing.id === selectedId ? colors.gold : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: listing.id === selectedId ? colors.black : colors.ink }]}>
                    {listing.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.ink }]}>Register a parcel</Text>
              <Text style={[styles.subtitle, { color: colors.inkMuted }]}>{selectedListing?.name}</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}><Field label="Origin" value={origin} onChangeText={setOrigin} /></View>
                <View style={{ flex: 1 }}><Field label="Destination" value={destination} onChangeText={setDestination} /></View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1 }}><Field label="Recipient name" value={recipientName} onChangeText={setRecipientName} /></View>
                <View style={{ flex: 1 }}><Field label="Recipient contact" value={recipientContact} onChangeText={setRecipientContact} /></View>
              </View>
              <Field label="Contents (private)" value={contents} onChangeText={setContents} />
              <Pressable disabled={saving} onPress={() => void saveParcel()} style={[styles.primary, { backgroundColor: colors.gold }]}>
                {saving ? <ActivityIndicator color={colors.black} /> : <Text style={[styles.primaryText, { color: colors.black }]}>Create parcel</Text>}
              </Pressable>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Parcel tracking</Text>
            <Field label="Current update location (optional)" value={trackingLocation} onChangeText={setTrackingLocation} placeholder="Lilongwe Depot" />
            {parcels.length === 0 && <Text style={[styles.empty, { color: colors.inkMuted }]}>No parcels registered for this service.</Text>}
            {parcels.map((parcel) => (
              <View key={parcel.id} style={[styles.parcel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flex: 1, gap: spacing(1) }}>
                  <Text style={[styles.parcelCode, { color: colors.ink }]}>{parcel.trackingCode}</Text>
                  <Text style={[styles.subtitle, { color: colors.inkMuted }]}>{parcel.origin} → {parcel.destination}</Text>
                  <Text style={[styles.status, { color: colors.goldDeep }]}>{STATUS_LABELS[parcel.status]}</Text>
                </View>
                <View style={styles.actions}>
                  {NEXT_STATUSES[parcel.status].map((status) => (
                    <Pressable
                      key={status}
                      disabled={saving}
                      onPress={() => void updateStatus(parcel, status)}
                      style={[styles.action, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.actionText, { color: colors.ink }]}>{STATUS_LABELS[status]}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { minHeight: 76, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", gap: spacing(3), paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fontFamilies.display, fontSize: 22 },
  subtitle: { fontFamily: fontFamilies.body, fontSize: 13 },
  content: { width: "100%", maxWidth: 980, alignSelf: "center", padding: spacing(4), paddingBottom: spacing(24), gap: spacing(4) },
  notice: { borderWidth: 1, borderRadius: radii.md, padding: spacing(3) },
  noticeText: { fontFamily: fontFamilies.body, fontSize: 13 },
  card: { borderWidth: 1, borderRadius: radii.xl, padding: spacing(4), gap: spacing(3) },
  cardTitle: { fontFamily: fontFamilies.display, fontSize: 19 },
  sectionTitle: { fontFamily: fontFamilies.display, fontSize: 18, marginTop: spacing(2) },
  field: { flex: 1, gap: spacing(1.5) },
  label: { fontFamily: fontFamilies.bodySemi, fontSize: 12 },
  input: { minHeight: 46, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing(3), fontFamily: fontFamilies.body, fontSize: 14 },
  multiline: { minHeight: 92, paddingTop: spacing(3), textAlignVertical: "top" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing(3) },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  chip: { borderRadius: radii.full, paddingHorizontal: spacing(3), paddingVertical: spacing(2) },
  serviceChip: { borderRadius: radii.full, borderWidth: 1, paddingHorizontal: spacing(4), paddingVertical: spacing(2.5) },
  chipText: { fontFamily: fontFamilies.bodySemi, fontSize: 12, textTransform: "capitalize" },
  primary: { minHeight: 48, borderRadius: radii.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing(4) },
  primarySmall: { minHeight: 40, borderRadius: radii.full, flexDirection: "row", alignItems: "center", gap: spacing(1), paddingHorizontal: spacing(3) },
  primaryText: { fontFamily: fontFamilies.bodySemi, fontSize: 13 },
  empty: { fontFamily: fontFamilies.body, fontSize: 13, textAlign: "center", padding: spacing(5) },
  parcel: { borderWidth: 1, borderRadius: radii.lg, padding: spacing(4), flexDirection: "row", flexWrap: "wrap", gap: spacing(3), alignItems: "center" },
  parcelCode: { fontFamily: fontFamilies.bodySemi, fontSize: 15 },
  status: { fontFamily: fontFamilies.bodySemi, fontSize: 12, textTransform: "uppercase" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  action: { borderWidth: 1, borderRadius: radii.full, paddingHorizontal: spacing(3), paddingVertical: spacing(2) },
  actionText: { fontFamily: fontFamilies.bodySemi, fontSize: 11 },
});
