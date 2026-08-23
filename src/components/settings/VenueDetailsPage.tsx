import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";

interface Props {
  onBack: () => void;
}

export default function VenueDetailsPage({ onBack }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Malawi");
  const [postalCode, setPostalCode] = useState("");
  const [gpsLat, setGpsLat] = useState("");
  const [gpsLng, setGpsLng] = useState("");

  const inputBase = {
    color: colors.ink,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    fontFamily: fontFamilies.body,
  };

  const handleSave = () => {
    const location = {
      street,
      area,
      city,
      region,
      country,
      postalCode,
      gps: gpsLat && gpsLng ? { lat: gpsLat, lng: gpsLng } : undefined,
    };
    console.log("💾 Company location saved:", location);
    // TODO: PATCH to backend
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          Company Location
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
      >
        <Text style={[styles.hint, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
          This is your registered business address. Customers may see this on tickets and receipts.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, gap: spacing(3) }]}>
          <FormField label="Street Address" colors={colors}>
            <TextInput
              placeholder="e.g. Plot 45, Area 3"
              placeholderTextColor={colors.inkMuted}
              value={street}
              onChangeText={setStreet}
              style={[styles.input, inputBase]}
            />
          </FormField>

          <FormField label="Area / District" colors={colors}>
            <TextInput
              placeholder="e.g. City Centre"
              placeholderTextColor={colors.inkMuted}
              value={area}
              onChangeText={setArea}
              style={[styles.input, inputBase]}
            />
          </FormField>

          <View style={styles.row}>
            <FormField label="City" colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="e.g. Lilongwe"
                placeholderTextColor={colors.inkMuted}
                value={city}
                onChangeText={setCity}
                style={[styles.input, inputBase]}
              />
            </FormField>
            <View style={{ width: spacing(3) }} />
            <FormField label="Region / Province" colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="e.g. Central Region"
                placeholderTextColor={colors.inkMuted}
                value={region}
                onChangeText={setRegion}
                style={[styles.input, inputBase]}
              />
            </FormField>
          </View>

          <View style={styles.row}>
            <FormField label="Country" colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="e.g. Malawi"
                placeholderTextColor={colors.inkMuted}
                value={country}
                onChangeText={setCountry}
                style={[styles.input, inputBase]}
              />
            </FormField>
            <View style={{ width: spacing(3) }} />
            <FormField label="Postal Code (optional)" colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="e.g. 265"
                placeholderTextColor={colors.inkMuted}
                value={postalCode}
                onChangeText={setPostalCode}
                style={[styles.input, inputBase]}
              />
            </FormField>
          </View>

          <Text
            style={[
              styles.sectionLabel,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(2) },
            ]}
          >
            GPS Coordinates (optional)
          </Text>
          <View style={styles.row}>
            <FormField label="Latitude" colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="-13.9626"
                placeholderTextColor={colors.inkMuted}
                value={gpsLat}
                onChangeText={setGpsLat}
                keyboardType="numbers-and-punctuation"
                style={[styles.input, inputBase]}
              />
            </FormField>
            <View style={{ width: spacing(3) }} />
            <FormField label="Longitude" colors={colors} style={{ flex: 1 }}>
              <TextInput
                placeholder="33.7741"
                placeholderTextColor={colors.inkMuted}
                value={gpsLng}
                onChangeText={setGpsLng}
                keyboardType="numbers-and-punctuation"
                style={[styles.input, inputBase]}
              />
            </FormField>
          </View>

          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.gold, marginTop: spacing(2) }]}
          >
            <Text style={{ color: colors.black, fontFamily: fontFamilies.bodySemi, fontSize: 16 }}>
              Save Location
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function FormField({ label, colors, children, style }: { label: string; colors: any; children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ gap: spacing(1) }, style]}>
      <Text style={[styles.label, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  hint: { fontSize: 15, lineHeight: 22, marginBottom: spacing(4) },

  card: { borderRadius: radii.xl, padding: spacing(5) },

  label: { fontSize: 14 },
  sectionLabel: { fontSize: 15, marginBottom: spacing(1) },

  row: { flexDirection: "row", alignItems: "flex-start" },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    fontSize: 15,
  },

  saveBtn: {
    paddingVertical: spacing(4),
    borderRadius: radii.full,
    alignItems: "center",
  },
});