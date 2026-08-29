import { Feather } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLumTheme } from '../../theme/ThemeContext';
import { fontFamilies, radii, spacing } from '../../theme/tokens';
import { BusinessProfile } from './types';

interface Props {
  profile: BusinessProfile | null;
  onBack: () => void;
  onEdit: () => void;
}

const DOC_LABELS: Record<string, string> = {
  registration_certificate: 'Registration Certificate',
  tax_clearance: 'Tax Clearance',
  business_license: 'Business License',
  national_id: 'National ID',
  other: 'Other Document',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706',
  verified: '#059669',
  rejected: '#DC2626',
};

const STATUS_BG: Record<string, string> = {
  pending: 'rgba(217, 119, 6, 0.12)',
  verified: 'rgba(5, 150, 105, 0.12)',
  rejected: 'rgba(220, 38, 38, 0.12)',
};

export default function BusinessProfilePage({
  profile,
  onBack,
  onEdit,
}: Props) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const isTablet = width >= 768;

  if (!profile) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
        <SettingsHeader
          title="Business Profile"
          onBack={onBack}
          colors={colors}
        />
        <View style={styles.emptyWrap}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Feather name="briefcase" size={32} color={colors.inkMuted} />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.ink, fontFamily: fontFamilies.display },
            ]}
          >
            No Business Profile
          </Text>
          <Text
            style={[
              styles.emptyDesc,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            Create a profile to start publishing tickets and receiving payouts.
          </Text>
          <Pressable
            onPress={onEdit}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.gold, marginTop: spacing(5) },
            ]}
          >
            <Feather
              name="plus"
              size={18}
              color={colors.black}
              style={{ marginRight: spacing(2) }}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: colors.black, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Create Profile
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <SettingsHeader
        title="Business Profile"
        onBack={onBack}
        colors={colors}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isDesktop ? spacing(8) : spacing(4),
            paddingTop: spacing(4),
            paddingBottom: isDesktop ? spacing(12) : spacing(24),
          },
        ]}
      >
        <View style={[{ maxWidth: 720, alignSelf: 'center', width: '100%' }]}>
          {/* Profile Header Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.profileHeader,
                isTablet && styles.profileHeaderRow,
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
                <Text
                  style={[
                    styles.avatarLetter,
                    { color: colors.black, fontFamily: fontFamilies.display },
                  ]}
                >
                  {profile.businessName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>

              <View style={[styles.profileMeta, isTablet && { flex: 1 }]}>
                <Text
                  style={[
                    styles.profileName,
                    { color: colors.ink, fontFamily: fontFamilies.display },
                  ]}
                  numberOfLines={2}
                >
                  {profile.businessName}
                </Text>

                {profile.tradingName ? (
                  <Text
                    style={[
                      styles.profileSub,
                      { color: colors.inkMuted, fontFamily: fontFamilies.body },
                    ]}
                  >
                    Trading as {profile.tradingName}
                  </Text>
                ) : null}

                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.gold + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: colors.gold,
                          fontFamily: fontFamilies.bodySemi,
                        },
                      ]}
                    >
                      {profile.type === 'individual' ? 'Individual' : 'Company'}
                    </Text>
                  </View>

                  {profile.isVerified ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: STATUS_BG.verified },
                      ]}
                    >
                      <Feather
                        name="check-circle"
                        size={12}
                        color={STATUS_COLORS.verified}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: STATUS_COLORS.verified,
                            fontFamily: fontFamilies.bodySemi,
                          },
                        ]}
                      >
                        Verified
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: STATUS_BG.pending },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: STATUS_COLORS.pending,
                            fontFamily: fontFamilies.bodySemi,
                          },
                        ]}
                      >
                        Pending
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Info Grid */}
            <View style={[styles.infoGrid, isTablet && styles.infoGridDesktop]}>
              <InfoItem
                icon="mail"
                label="Email"
                value={profile.email}
                colors={colors}
              />
              <InfoItem
                icon="phone"
                label="Phone"
                value={profile.phone}
                colors={colors}
              />
              <InfoItem
                icon="map-pin"
                label="Address"
                value={`${profile.address}, ${profile.city}`}
                colors={colors}
              />
              {profile.registrationNumber ? (
                <InfoItem
                  icon="hash"
                  label="Reg. Number"
                  value={profile.registrationNumber}
                  colors={colors}
                />
              ) : null}
              {profile.taxId ? (
                <InfoItem
                  icon="file-text"
                  label="Tax ID"
                  value={profile.taxId}
                  colors={colors}
                />
              ) : null}
              {profile.website ? (
                <InfoItem
                  icon="globe"
                  label="Website"
                  value={profile.website}
                  colors={colors}
                />
              ) : null}
              <InfoItem
                icon="tag"
                label="Category"
                value={profile.category}
                colors={colors}
              />
              <InfoItem
                icon="flag"
                label="Country"
                value={profile.country}
                colors={colors}
              />
            </View>

            {profile.description ? (
              <View style={[styles.descBox, { backgroundColor: colors.bgAlt }]}>
                <Text
                  style={[
                    styles.descLabel,
                    {
                      color: colors.inkMuted,
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  About
                </Text>
                <Text
                  style={[
                    styles.desc,
                    { color: colors.ink, fontFamily: fontFamilies.body },
                  ]}
                >
                  {profile.description}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Executive Team */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.ink,
                fontFamily: fontFamilies.bodySemi,
                marginTop: spacing(6),
              },
            ]}
          >
            {profile.type === 'individual' ? 'Owner Details' : 'Executive Team'}
          </Text>
          <View
            style={[styles.card, { backgroundColor: colors.surface, gap: 0 }]}
          >
            {(profile.executives || []).map((exec, i) => (
              <View
                key={exec.id}
                style={[
                  styles.execRow,
                  i < (profile.executives || []).length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[styles.execAvatar, { backgroundColor: colors.bgAlt }]}
                >
                  <Text
                    style={[
                      styles.execInitial,
                      { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    {exec.fullName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.execName,
                      { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    {exec.fullName}
                  </Text>
                  <Text
                    style={[
                      styles.execMeta,
                      { color: colors.inkMuted, fontFamily: fontFamilies.body },
                    ]}
                  >
                    {exec.role}
                    {exec.nationalIdNumber ? ` · ${exec.nationalIdNumber}` : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.idBadge,
                    { backgroundColor: STATUS_BG.verified },
                  ]}
                >
                  <Text
                    style={[
                      styles.idBadgeText,
                      {
                        color: STATUS_COLORS.verified,
                        fontFamily: fontFamilies.bodySemi,
                      },
                    ]}
                  >
                    ID
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Documents */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.ink,
                fontFamily: fontFamilies.bodySemi,
                marginTop: spacing(6),
              },
            ]}
          >
            Documents & Registrations
          </Text>
          <View
            style={[styles.card, { backgroundColor: colors.surface, gap: 0 }]}
          >
            {(profile.documents || []).length > 0 ? (
              (profile.documents || []).map((doc, i) => (
                <View
                  key={doc.id}
                  style={[
                    styles.docRow,
                    i < (profile.documents || []).length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.docIconWrap}>
                    <Feather
                      name="file-text"
                      size={20}
                      color={colors.inkMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.docTitle,
                        {
                          color: colors.ink,
                          fontFamily: fontFamilies.bodySemi,
                        },
                      ]}
                    >
                      {doc.title}
                    </Text>
                    <Text
                      style={[
                        styles.docSub,
                        {
                          color: colors.inkMuted,
                          fontFamily: fontFamilies.body,
                        },
                      ]}
                    >
                      {DOC_LABELS[doc.type]} ·{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          STATUS_BG[doc.status] || STATUS_BG.pending,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            STATUS_COLORS[doc.status] || STATUS_COLORS.pending,
                          fontFamily: fontFamilies.bodySemi,
                        },
                      ]}
                    >
                      {doc.status}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.docEmpty}>
                <Feather name="folder" size={24} color={colors.inkMuted} />
                <Text
                  style={[
                    styles.docEmptyText,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  No documents uploaded yet
                </Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <Pressable
            onPress={onEdit}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.gold, marginTop: spacing(6) },
            ]}
          >
            <Feather
              name="edit-2"
              size={18}
              color={colors.black}
              style={{ marginRight: spacing(2) }}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: colors.black, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Edit Profile
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

function SettingsHeader({
  title,
  onBack,
  colors,
}: {
  title: string;
  onBack: () => void;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.bg, borderBottomColor: colors.border },
      ]}
    >
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={24} color={colors.ink} />
      </Pressable>
      <Text
        style={[
          styles.headerTitle,
          { color: colors.ink, fontFamily: fontFamilies.display },
        ]}
      >
        {title}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={[styles.infoIconWrap, { backgroundColor: colors.bgAlt }]}>
        <Feather name={icon} size={16} color={colors.inkMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.infoLabel,
            { color: colors.inkMuted, fontFamily: fontFamilies.body },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.infoValue,
            { color: colors.ink, fontFamily: fontFamilies.bodySemi },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Styles
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  wrap: { width: '100%', flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'web' ? 0 : 30,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: { flexGrow: 1 },

  /* ---- Empty State ---- */
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6),
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(4),
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyDesc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing(2),
    maxWidth: 280,
  },

  /* ---- Cards ---- */
  card: {
    borderRadius: radii.xl,
    padding: spacing(5),
    gap: spacing(4),
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
      },
      default: {
        shadowOpacity: 0.04,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      },
    }),
  },

  /* ---- Profile Header ---- */
  profileHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing(4),
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(5),
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 28, fontWeight: '800' },
  profileMeta: { alignItems: 'center' },
  profileName: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  profileSub: { fontSize: 16, marginTop: 4, textAlign: 'center' },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing(2),
    marginTop: spacing(3),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  badgeText: { fontSize: 13 },

  /* ---- Info Grid ---- */
  infoGrid: {
    flexDirection: 'column',
    gap: spacing(3),
    marginTop: spacing(2),
  },
  infoGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    minWidth: '45%',
    flex: 1,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 16, marginTop: 1 },

  /* ---- Description ---- */
  descBox: {
    borderRadius: radii.lg,
    padding: spacing(4),
    marginTop: spacing(2),
  },
  descLabel: {
    fontSize: 14,
    marginBottom: spacing(1.5),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  desc: { fontSize: 15, lineHeight: 22 },

  /* ---- Section Labels ---- */
  sectionLabel: { fontSize: 16, marginBottom: spacing(2) },

  /* ---- Executives ---- */
  execRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(2),
  },
  execAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  execInitial: { fontSize: 16 },
  execName: { fontSize: 16 },
  execMeta: { fontSize: 14, marginTop: 2 },
  idBadge: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  idBadgeText: { fontSize: 12 },

  /* ---- Documents ---- */
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(2),
  },
  docIconWrap: { width: 40, alignItems: 'center' },
  docTitle: { fontSize: 16 },
  docSub: { fontSize: 14, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  statusBadgeText: { fontSize: 12, textTransform: 'capitalize' },
  docEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(8),
    gap: spacing(2),
  },
  docEmptyText: { fontSize: 15 },

  /* ---- Action Button ---- */
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(4),
    borderRadius: radii.full,
  },
  actionBtnText: { fontSize: 16 },
});
