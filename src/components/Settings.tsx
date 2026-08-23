import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import { BusinessProfile } from "./settings/types";

// Sub-pages
import ApprovalWorkflowPage from "./settings/ApprovalWorkflowPage";
import AuditLogsPage from "./settings/AuditLogsPage";
import BusinessHoursPage from "./settings/BusinessHoursPage";
import BusinessProfileForm from "./settings/BusinessProfileForm";
import BusinessProfilePage from "./settings/BusinessProfilePage";
import PaymentMethodsPage from "./settings/PaymentMethodsPage";
import PayoutSchedulePage from "./settings/PayoutSchedulePage";
import TeamRolesPage from "./settings/TeamRolesPage";
import VenueDetailsPage from "./settings/VenueDetailsPage";
import VerifiedDevicesPage from "./settings/VerifiedDevicesPage";

/* ------------------------------------------------------------------ */
// Toggle
/* ------------------------------------------------------------------ */
function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors } = useLumTheme();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? colors.gold : colors.border },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          {
            backgroundColor: colors.white,
            transform: [{ translateX: value ? 20 : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
// Settings menu data
/* ------------------------------------------------------------------ */
type SettingRoute =
  | "list"
  | "business_profile"
  | "business_profile_form"
  | "venue_details"
  | "business_hours"
  | "verified_devices"
  | "team_roles"
  | "approval_workflow"
  | "audit_logs"
  | "payment_methods"
  | "payout_schedule";

type SettingItem = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  route: SettingRoute;
  hasToggle?: boolean;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

const SECTIONS: SettingSection[] = [
  {
    title: "Business",
    items: [
      { icon: "briefcase", label: "Business profile", route: "business_profile" },
      { icon: "map-pin", label: "location details", route: "venue_details" },
      { icon: "clock", label: "Business hours", route: "business_hours" },
    ],
  },
  {
    title: "Access",
    items: [
      { icon: "shield", label: "Operator access", route: "approval_workflow", hasToggle: true },
      { icon: "smartphone", label: "Verified devices", route: "verified_devices" },
      { icon: "users", label: "Team roles", route: "team_roles" },
      { icon: "check-circle", label: "Approval workflow", route: "approval_workflow" },
      { icon: "file-text", label: "Audit logs", route: "audit_logs" },
    ],
  },
  {
    title: "Billing & payouts",
    items: [
      { icon: "credit-card", label: "Accepted payment methods", route: "payment_methods" },
      { icon: "dollar-sign", label: "Payout schedule", route: "payout_schedule" },
    ],
  },
];

/* ------------------------------------------------------------------ */
// Main
/* ------------------------------------------------------------------ */
export default function Settings() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [route, setRoute] = useState<SettingRoute>("list");
  const [faceId, setFaceId] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  /* ---- Sub-page renders ---- */
  if (route === "business_profile") {
    return (
      <BusinessProfilePage
        profile={profile}
        onBack={() => setRoute("list")}
        onEdit={() => setRoute("business_profile_form")}
      />
    );
  }

  if (route === "business_profile_form") {
    return (
      <BusinessProfileForm
        existing={profile}
        onBack={() => setRoute(profile ? "business_profile" : "list")}
        onSave={(p) => {
          setProfile(p);
          setRoute("business_profile");
        }}
      />
    );
  }

  if (route === "venue_details") return <VenueDetailsPage onBack={() => setRoute("list")} />;
  if (route === "business_hours") return <BusinessHoursPage onBack={() => setRoute("list")} />;
  if (route === "verified_devices") return <VerifiedDevicesPage onBack={() => setRoute("list")} />;
  if (route === "team_roles") return <TeamRolesPage onBack={() => setRoute("list")} />;
  if (route === "approval_workflow") return <ApprovalWorkflowPage onBack={() => setRoute("list")} />;
  if (route === "audit_logs") return <AuditLogsPage onBack={() => setRoute("list")} />;
  if (route === "payment_methods") return <PaymentMethodsPage onBack={() => setRoute("list")} />;
  if (route === "payout_schedule") return <PayoutSchedulePage onBack={() => setRoute("list")} />;

  /* ---- List view ---- */
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
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
          Settings
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isDesktop ? spacing(6) : spacing(3),
            paddingTop: spacing(4),
            paddingBottom: isDesktop ? spacing(10) : spacing(20),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[{ maxWidth: 640, alignSelf: "center", width: "100%" }]}>
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                {section.title}
              </Text>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                {section.items.map((item, index) => {
                  const isLast = index === section.items.length - 1;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => {
                        if (!item.hasToggle) setRoute(item.route);
                      }}
                      style={[
                        styles.row,
                        !isLast && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.rowLeft}>
                        <Feather
                          name={item.icon}
                          size={20}
                          color={colors.ink}
                          style={{ marginRight: spacing(3) }}
                        />
                        <Text
                          style={[
                            styles.rowLabel,
                            { color: colors.ink, fontFamily: fontFamilies.body },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>

                      {item.hasToggle ? (
                        <Toggle value={faceId} onValueChange={setFaceId} />
                      ) : (
                        <Feather
                          name="chevron-right"
                          size={18}
                          color={colors.inkMuted}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <Pressable
            style={[
              styles.logoutCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Feather name="credit-card" size={20} color={colors.gold} />
            <Text
              style={[
                styles.logoutText,
                { color: colors.gold, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Upgrade business plan
            </Text>
          </Pressable>

          <Text
            style={[
              styles.version,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            LumTicket v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%" },
  header: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  section: { marginBottom: spacing(5) },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing(2.5),
    marginLeft: spacing(1),
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowLabel: { fontSize: 15 },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    marginBottom: spacing(5),
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoutText: { fontSize: 15 },
  version: { fontSize: 12, textAlign: "center" },
});