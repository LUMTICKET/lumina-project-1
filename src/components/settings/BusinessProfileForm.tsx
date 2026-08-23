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
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";
import { BusinessDoc, BusinessProfile, BusinessType, DocType, Executive } from "./types";

interface Props {
  existing: BusinessProfile | null;
  onBack: () => void;
  onSave: (profile: BusinessProfile) => void;
}

const DOC_TYPE_OPTIONS: { key: DocType; label: string }[] = [
  { key: "registration_certificate", label: "Registration Certificate" },
  { key: "tax_clearance", label: "Tax Clearance" },
  { key: "business_license", label: "Business License" },
  { key: "national_id", label: "National ID" },
  { key: "other", label: "Other" },
];

export default function BusinessProfileForm({ existing, onBack, onSave }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [type, setType] = useState<BusinessType>(existing?.type || "company");
  const [businessName, setBusinessName] = useState(existing?.businessName || "");
  const [tradingName, setTradingName] = useState(existing?.tradingName || "");
  const [registrationNumber, setRegistrationNumber] = useState(existing?.registrationNumber || "");
  const [taxId, setTaxId] = useState(existing?.taxId || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [city, setCity] = useState(existing?.city || "");
  const [country, setCountry] = useState(existing?.country || "Malawi");
  const [website, setWebsite] = useState(existing?.website || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [category, setCategory] = useState(existing?.category || "");

  const [executives, setExecutives] = useState<Executive[]>(
    existing?.executives?.length
      ? existing.executives
      : [{ id: "1", fullName: "", role: type === "individual" ? "Owner" : "Director", email: "", phone: "", nationalIdNumber: "" }]
  );

  const [documents, setDocuments] = useState<BusinessDoc[]>(existing?.documents || []);

  const addExecutive = () =>
    setExecutives((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), fullName: "", role: "Director", email: "", phone: "", nationalIdNumber: "" },
    ]);

  const removeExecutive = (id: string) => {
    if (executives.length > 1) setExecutives((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExecutive = (id: string, key: keyof Executive, value: string) =>
    setExecutives((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addDocument = () =>
    setDocuments((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), type: "other", title: "", status: "pending", uploadedAt: new Date().toISOString() },
    ]);

  const removeDocument = (id: string) => setDocuments((prev) => prev.filter((d) => d.id !== id));

  const updateDocument = (id: string, key: keyof BusinessDoc, value: string) =>
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, [key]: value } : d)));

  const handleSave = () => {
    const profile: BusinessProfile = {
      id: existing?.id || `biz-${Date.now()}`,
      type,
      businessName,
      tradingName: tradingName || undefined,
      registrationNumber: type === "company" ? registrationNumber : undefined,
      taxId: taxId || undefined,
      email,
      phone,
      address,
      city,
      country,
      website: website || undefined,
      description,
      category,
      isVerified: false,
      executives,
      documents,
    };
    onSave(profile);
  };

  const inputBase = {
    color: colors.ink,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    fontFamily: fontFamilies.body,
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>
          {existing ? "Edit Profile" : "Create Profile"}
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
        {/* Type Toggle */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Business Type</Text>
          <View style={styles.typeToggle}>
            {(["individual", "company"] as BusinessType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setType(t);
                  if (t === "individual" && executives.length > 1) {
                    setExecutives([{ ...executives[0], role: "Owner" }]);
                  }
                }}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: type === t ? colors.gold : "transparent",
                    borderColor: type === t ? colors.gold : colors.border,
                  },
                ]}
              >
                <Text style={{ color: type === t ? colors.black : colors.ink, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>
                  {t === "individual" ? "Individual" : "Registered Company"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Basic Info */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>Business Information</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, gap: spacing(3) }]}>
          <FormField label="Business Name" colors={colors}>
            <TextInput placeholder="e.g. Captain Tours" placeholderTextColor={colors.inkMuted} value={businessName} onChangeText={setBusinessName} style={[styles.input, inputBase]} />
          </FormField>
          <FormField label="Trading Name (optional)" colors={colors}>
            <TextInput placeholder="e.g. Captain Bus Express" placeholderTextColor={colors.inkMuted} value={tradingName} onChangeText={setTradingName} style={[styles.input, inputBase]} />
          </FormField>
          {type === "company" && (
            <FormField label="Registration Number" colors={colors}>
              <TextInput placeholder="Company registration number" placeholderTextColor={colors.inkMuted} value={registrationNumber} onChangeText={setRegistrationNumber} style={[styles.input, inputBase]} />
            </FormField>
          )}
          <FormField label="Tax ID (optional)" colors={colors}>
            <TextInput placeholder="Tax identification number" placeholderTextColor={colors.inkMuted} value={taxId} onChangeText={setTaxId} style={[styles.input, inputBase]} />
          </FormField>
          <View style={styles.row}>
            <FormField label="Email" colors={colors} style={{ flex: 1 }}>
              <TextInput placeholder="business@email.com" placeholderTextColor={colors.inkMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={[styles.input, inputBase]} />
            </FormField>
            <View style={{ width: spacing(3) }} />
            <FormField label="Phone" colors={colors} style={{ flex: 1 }}>
              <TextInput placeholder="+265..." placeholderTextColor={colors.inkMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={[styles.input, inputBase]} />
            </FormField>
          </View>
          <FormField label="Address" colors={colors}>
            <TextInput placeholder="Street address" placeholderTextColor={colors.inkMuted} value={address} onChangeText={setAddress} style={[styles.input, inputBase]} />
          </FormField>
          <View style={styles.row}>
            <FormField label="City" colors={colors} style={{ flex: 1 }}>
              <TextInput placeholder="Lilongwe" placeholderTextColor={colors.inkMuted} value={city} onChangeText={setCity} style={[styles.input, inputBase]} />
            </FormField>
            <View style={{ width: spacing(3) }} />
            <FormField label="Country" colors={colors} style={{ flex: 1 }}>
              <TextInput placeholder="Malawi" placeholderTextColor={colors.inkMuted} value={country} onChangeText={setCountry} style={[styles.input, inputBase]} />
            </FormField>
          </View>
          <FormField label="Website (optional)" colors={colors}>
            <TextInput placeholder="https://..." placeholderTextColor={colors.inkMuted} value={website} onChangeText={setWebsite} autoCapitalize="none" style={[styles.input, inputBase]} />
          </FormField>
          <FormField label="Category" colors={colors}>
            <TextInput placeholder="e.g. Transport, Events, Tourism" placeholderTextColor={colors.inkMuted} value={category} onChangeText={setCategory} style={[styles.input, inputBase]} />
          </FormField>
          <FormField label="Description" colors={colors}>
            <TextInput placeholder="Describe your business..." placeholderTextColor={colors.inkMuted} value={description} onChangeText={setDescription} multiline numberOfLines={4} style={[styles.textarea, inputBase]} />
          </FormField>
        </View>

        {/* Executives */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>
          {type === "individual" ? "Owner / Individual Details" : "Executive Team"}
        </Text>
        {executives.map((exec, idx) => (
          <View key={exec.id} style={[styles.card, { backgroundColor: colors.surface, marginBottom: spacing(3) }]}>
            <View style={styles.execHeader}>
              <Text style={[styles.execTitle, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
                {type === "individual" ? "Owner" : `Executive ${idx + 1}`}
              </Text>
              {type === "company" && executives.length > 1 && (
                <Pressable onPress={() => removeExecutive(exec.id)} hitSlop={8}>
                  <Feather name="trash-2" size={18} color={colors.inkMuted} />
                </Pressable>
              )}
            </View>
            <View style={styles.row}>
              <FormField label="Full Name" colors={colors} style={{ flex: 1 }}>
                <TextInput placeholder="John Banda" placeholderTextColor={colors.inkMuted} value={exec.fullName} onChangeText={(v) => updateExecutive(exec.id, "fullName", v)} style={[styles.input, inputBase]} />
              </FormField>
              <View style={{ width: spacing(3) }} />
              <FormField label="Role" colors={colors} style={{ flex: 1 }}>
                <TextInput placeholder={type === "individual" ? "Owner" : "Director"} placeholderTextColor={colors.inkMuted} value={exec.role} onChangeText={(v) => updateExecutive(exec.id, "role", v)} editable={type !== "individual"} style={[styles.input, inputBase, type === "individual" && { opacity: 0.6 }]} />
              </FormField>
            </View>
            <View style={styles.row}>
              <FormField label="Email" colors={colors} style={{ flex: 1 }}>
                <TextInput placeholder="exec@email.com" placeholderTextColor={colors.inkMuted} value={exec.email} onChangeText={(v) => updateExecutive(exec.id, "email", v)} autoCapitalize="none" keyboardType="email-address" style={[styles.input, inputBase]} />
              </FormField>
              <View style={{ width: spacing(3) }} />
              <FormField label="Phone" colors={colors} style={{ flex: 1 }}>
                <TextInput placeholder="+265..." placeholderTextColor={colors.inkMuted} value={exec.phone} onChangeText={(v) => updateExecutive(exec.id, "phone", v)} keyboardType="phone-pad" style={[styles.input, inputBase]} />
              </FormField>
            </View>
            <FormField label="National ID Number" colors={colors}>
              <TextInput placeholder="National ID or Passport number" placeholderTextColor={colors.inkMuted} value={exec.nationalIdNumber} onChangeText={(v) => updateExecutive(exec.id, "nationalIdNumber", v)} style={[styles.input, inputBase]} />
            </FormField>
            <View style={styles.row}>
              <Pressable style={[styles.uploadMini, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
                <Feather name="upload" size={16} color={colors.inkMuted} />
                <Text style={{ fontSize: 13, color: colors.inkMuted, fontFamily: fontFamilies.body, marginLeft: spacing(2) }}>ID Front</Text>
              </Pressable>
              <View style={{ width: spacing(3) }} />
              <Pressable style={[styles.uploadMini, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
                <Feather name="upload" size={16} color={colors.inkMuted} />
                <Text style={{ fontSize: 13, color: colors.inkMuted, fontFamily: fontFamilies.body, marginLeft: spacing(2) }}>ID Back</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {type === "company" && (
          <Pressable onPress={addExecutive} style={[styles.addTierBtn, { borderColor: colors.gold }]}>
            <Feather name="plus" size={16} color={colors.gold} />
            <Text style={{ color: colors.gold, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>Add Executive</Text>
          </Pressable>
        )}

        {/* Documents */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>Documents & Registrations</Text>
        {documents.map((doc) => (
          <View key={doc.id} style={[styles.card, { backgroundColor: colors.surface, marginBottom: spacing(3) }]}>
            <View style={styles.execHeader}>
              <Text style={[styles.execTitle, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>Document</Text>
              <Pressable onPress={() => removeDocument(doc.id)} hitSlop={8}>
                <Feather name="trash-2" size={18} color={colors.inkMuted} />
              </Pressable>
            </View>
            <View style={styles.row}>
              <FormField label="Document Type" colors={colors} style={{ flex: 1 }}>
                <View style={[styles.selectRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  {DOC_TYPE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.key}
                      onPress={() => updateDocument(doc.id, "type", opt.key)}
                      style={[styles.selectChip, { backgroundColor: doc.type === opt.key ? colors.gold : "transparent" }]}
                    >
                      <Text style={{ fontSize: 12, color: doc.type === opt.key ? colors.black : colors.ink, fontFamily: fontFamilies.bodySemi }}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </FormField>
            </View>
            <FormField label="Document Title" colors={colors}>
              <TextInput placeholder="e.g. Company Registration 2024" placeholderTextColor={colors.inkMuted} value={doc.title} onChangeText={(v) => updateDocument(doc.id, "title", v)} style={[styles.input, inputBase]} />
            </FormField>
            <Pressable style={[styles.uploadBoxSmall, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
              <Feather name="file-plus" size={20} color={colors.inkMuted} />
              <Text style={{ fontSize: 14, color: colors.inkMuted, fontFamily: fontFamilies.body, marginTop: spacing(1) }}>Tap to upload document</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={addDocument} style={[styles.addTierBtn, { borderColor: colors.gold }]}>
          <Feather name="plus" size={16} color={colors.gold} />
          <Text style={{ color: colors.gold, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>Add Document</Text>
        </Pressable>

        {/* Save */}
        <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.gold, marginTop: spacing(6) }]}>
          <Text style={{ color: colors.black, fontFamily: fontFamilies.bodySemi, fontSize: 16 }}>Save Profile</Text>
        </Pressable>
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

  card: { borderRadius: radii.xl, padding: spacing(4), gap: spacing(3) },
  sectionLabel: { fontSize: 15, marginBottom: spacing(2), marginTop: spacing(2) },
  label: { fontSize: 14 },

  typeToggle: { flexDirection: "row", gap: spacing(2) },
  typeBtn: { flex: 1, paddingVertical: spacing(2.5), borderRadius: radii.lg, borderWidth: 1.5, alignItems: "center" },

  row: { flexDirection: "row", alignItems: "flex-start" },
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

  execHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  execTitle: { fontSize: 15 },

  uploadMini: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(2.5),
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.lg,
  },
  uploadBoxSmall: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: radii.xl,
    paddingVertical: spacing(4),
    alignItems: "center",
    justifyContent: "center",
  },

  selectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(1.5),
    padding: spacing(2),
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  selectChip: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },

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

  saveBtn: {
    paddingVertical: spacing(4),
    borderRadius: radii.full,
    alignItems: "center",
  },
});