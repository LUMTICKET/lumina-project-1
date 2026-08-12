import { Feather } from "@expo/vector-icons";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useLumTheme } from "../../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../../theme/tokens";
import { BusinessProfile } from "./types";

interface Props {
  profile: BusinessProfile | null;
  onBack: () => void;
  onEdit: () => void;
}

const DOC_LABELS: Record<string, string> = {
  registration_certificate: "Registration Certificate",
  tax_clearance: "Tax Clearance",
  business_license: "Business License",
  national_id: "National ID",
  other: "Other Document",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#D97706",
  verified: "#059669",
  rejected: "#DC2626",
};

export default function BusinessProfilePage({ profile, onBack, onEdit }: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  if (!profile) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
        <SettingsHeader title="Business Profile" onBack={onBack} colors={colors} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing(6) }}>
          <Feather name="briefcase" size={48} color={colors.inkMuted} />
          <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body, marginTop: spacing(3), fontSize: 15, textAlign: "center" }}>
            No business profile found. Create one to start publishing tickets.
          </Text>
          <Pressable
            onPress={onEdit}
            style={[styles.actionBtn, { backgroundColor: colors.gold, marginTop: spacing(4) }]}
          >
            <Text style={{ color: colors.black, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>
              Create Profile
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <SettingsHeader title="Business Profile" onBack={onBack} colors={colors} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(12) : spacing(24),
        }}
      >
        {/* Profile Header */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
              <Text style={[styles.avatarLetter, { color: colors.black }]}>
                {profile.businessName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.ink, fontFamily: fontFamilies.display }]}>
                {profile.businessName}
              </Text>
              {profile.tradingName && (
                <Text style={[styles.profileSub, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                  Trading as {profile.tradingName}
                </Text>
              )}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: colors.gold + "20" }]}>
                  <Text style={[styles.badgeText, { color: colors.gold, fontFamily: fontFamilies.bodySemi }]}>
                    {profile.type === "individual" ? "Individual" : "Registered Company"}
                  </Text>
                </View>
                {profile.isVerified ? (
                  <View style={[styles.badge, { backgroundColor: "#05966920" }]}>
                    <Feather name="check-circle" size={12} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: "#059669", fontFamily: fontFamilies.bodySemi }]}>
                      Verified
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: "#D9770620" }]}>
                    <Text style={[styles.badgeText, { color: "#D97706", fontFamily: fontFamilies.bodySemi }]}>
                      Pending Verification
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <InfoItem icon="mail" label="Email" value={profile.email} colors={colors} />
            <InfoItem icon="phone" label="Phone" value={profile.phone} colors={colors} />
            <InfoItem icon="map-pin" label="Address" value={`${profile.address}, ${profile.city}`} colors={colors} />
            {profile.registrationNumber && (
              <InfoItem icon="hash" label="Reg. Number" value={profile.registrationNumber} colors={colors} />
            )}
            {profile.taxId && (
              <InfoItem icon="file-text" label="Tax ID" value={profile.taxId} colors={colors} />
            )}
            {profile.website && (
              <InfoItem icon="globe" label="Website" value={profile.website} colors={colors} />
            )}
            <InfoItem icon="tag" label="Category" value={profile.category} colors={colors} />
          </View>

          {profile.description ? (
            <Text style={[styles.desc, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
              {profile.description}
            </Text>
          ) : null}
        </View>

        {/* Executive Team */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>
          {profile.type === "individual" ? "Owner Details" : "Executive Team"}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, gap: spacing(3) }]}>
          {profile.executives.map((exec) => (
            <View key={exec.id} style={[styles.execRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.execAvatar, { backgroundColor: colors.bgAlt }]}>
                <Feather name="user" size={18} color={colors.inkMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.execName, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
                  {exec.fullName}
                </Text>
                <Text style={[styles.execMeta, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                  {exec.role} · {exec.nationalIdNumber}
                </Text>
              </View>
              <View style={[styles.idBadge, { backgroundColor: "#05966920" }]}>
                <Text style={{ color: "#059669", fontSize: 11, fontFamily: fontFamilies.bodySemi }}>ID Uploaded</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Documents */}
        <Text style={[styles.sectionLabel, { color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: spacing(5) }]}>
          Documents & Registrations
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, gap: 0 }]}>
          {profile.documents.map((doc, i) => (
            <View
              key={doc.id}
              style={[
                styles.docRow,
                i < profile.documents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.docTitle, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}>
                  {doc.title}
                </Text>
                <Text style={[styles.docSub, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                  {DOC_LABELS[doc.type]} · {new Date(doc.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[doc.status] + "20" }]}>
                <Text style={{ color: STATUS_COLORS[doc.status], fontSize: 11, fontFamily: fontFamilies.bodySemi, textTransform: "capitalize" }}>
                  {doc.status}
                </Text>
              </View>
            </View>
          ))}
          {profile.documents.length === 0 && (
            <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.body, padding: spacing(4), textAlign: "center" }}>
              No documents uploaded yet.
            </Text>
          )}
        </View>

        {/* Edit Button */}
        <Pressable
          onPress={onEdit}
          style={[styles.actionBtn, { backgroundColor: colors.gold, marginTop: spacing(6) }]}
        >
          <Feather name="edit-2" size={16} color={colors.black} style={{ marginRight: spacing(2) }} />
          <Text style={{ color: colors.black, fontFamily: fontFamilies.bodySemi, fontSize: 15 }}>
            Edit Profile
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SettingsHeader({ title, onBack, colors }: { title: string; onBack: () => void; colors: any }) {
  return (
    <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={24} color={colors.ink} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: fontFamilies.display }]}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function InfoItem({ icon, label, value, colors }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoItem}>
      <Feather name={icon} size={14} color={colors.inkMuted} style={{ marginRight: spacing(2) }} />
      <View>
        <Text style={{ fontSize: 11, color: colors.inkMuted, fontFamily: fontFamilies.body }}>{label}</Text>
        <Text style={{ fontSize: 13, color: colors.ink, fontFamily: fontFamilies.bodySemi }} numberOfLines={1}>{value}</Text>
      </View>
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

  card: { borderRadius: radii.xl, padding: spacing(5), gap: spacing(3) },
  sectionLabel: { fontSize: 14, marginBottom: spacing(2) },

  profileHeader: { flexDirection: "row", alignItems: "center", gap: spacing(4) },
  avatar: { width: 64, height: 64, borderRadius: radii.full, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 24, fontWeight: "800" },
  profileName: { fontSize: 18 },
  profileSub: { fontSize: 13, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: spacing(2), marginTop: spacing(2) },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing(3), paddingVertical: spacing(1), borderRadius: radii.full },
  badgeText: { fontSize: 11 },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(3), marginTop: spacing(2) },
  infoItem: { flexDirection: "row", alignItems: "flex-start", width: "47%", gap: spacing(1) },

  desc: { fontSize: 13, lineHeight: 20, marginTop: spacing(2) },

  execRow: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingVertical: spacing(2), borderBottomWidth: 1 },
  execAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  execName: { fontSize: 14 },
  execMeta: { fontSize: 12, marginTop: 2 },
  idBadge: { paddingHorizontal: spacing(2.5), paddingVertical: spacing(1), borderRadius: radii.full },

  docRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing(3.5), paddingHorizontal: spacing(1), gap: spacing(3) },
  docTitle: { fontSize: 14 },
  docSub: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing(2.5), paddingVertical: spacing(1), borderRadius: radii.full },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(3.5),
    borderRadius: radii.full,
  },
});