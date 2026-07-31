import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, spacing } from "../theme/tokens";
import SearchCard from "./SearchCard";

/* ─── small helpers ─── */
const StatPill = ({
  value,
  label,
  colors,
  style,
}: {
  value: string;
  label: string;
  colors: any;
  style?: any;
}) => (
  <View
    style={[
      styles.statPill,
      { backgroundColor: colors.surface, shadowColor: colors.ink },
      style,
    ]}
  >
    <Text style={[styles.statValue, { color: colors.gold, fontFamily: fontFamilies.display }]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
      {label}
    </Text>
  </View>
);

const PartnerLogo = ({ name, colors }: { name: string; colors: any }) => (
  <View style={styles.partnerRow}>
    <View style={[styles.partnerDot, { backgroundColor: colors.gold }]} />
    <Text style={[styles.partnerName, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
      {name}
    </Text>
  </View>
);

export default function Hero() {
  const { colors, mode } = useLumTheme();
  const { width } = useWindowDimensions();
  const narrow = width < 860;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>

      {/* ── main hero row ── */}
      <View style={[styles.heroRow, narrow && styles.heroRowNarrow, { paddingHorizontal: spacing(6) }]}>
        {/* ── left: copy ── */}
        <View style={[styles.copy, narrow && styles.copyNarrow]}>
          <View style={[styles.eyebrow, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
            <View style={[styles.eyebrowDot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.eyebrowText, { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi }]}>
              GOLDEN HOUR DEPARTURES
            </Text>
          </View>

          <Text
            style={[
              styles.headline,
              { color: colors.ink, fontFamily: fontFamilies.display },
              narrow && styles.headlineNarrow,
            ]}
          >
            Turn Trips into{" "}
            <Text style={{ color: colors.gold, fontFamily: fontFamilies.displayItalic }}>
              Memories.
            </Text>
          </Text>

          <Text style={[styles.subhead, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
            Book train tickets across the network in seconds. Real seats, real fares,
            no queueing at the counter.
          </Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryBtnText, { color: mode === "dark" ? "#000" : "#fff", fontFamily: fontFamilies.bodySemi }]}>
                Book Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
              <View
                style={[
                  styles.secondaryIcon,
                  { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Ionicons name="arrow-forward" size={16} color={colors.ink} />
              </View>
              <Text style={[styles.secondaryText, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                Learn more
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.poweredBy}>
            <Text
              style={[
                styles.poweredLabel,
                { color: colors.inkMuted, fontFamily: fontFamilies.body },
              ]}
            >
              Powered by
            </Text>
            <View style={styles.partnerGrid}>
              {["EuroRail", "MountainRail", "FastFix", "LogTrans", "Excalibur", "MetroHub"].map(
                (p) => (
                  <PartnerLogo key={p} name={p} colors={colors} />
                )
              )}
            </View>
          </View>
        </View>

        {/* ── right: image collage ── */}
        {!narrow && (
          <View style={styles.collage}>
            {/* top-left card */}
            <View
              style={[
                styles.collageCard,
                styles.cardTopLeft,
                { backgroundColor: colors.gold },
              ]}
            >
              <View style={styles.avatarStack}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: `rgba(255,255,255,${0.9 - i * 0.15})`,
                        marginLeft: i > 0 ? -10 : 0,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.cardBig, { color: "#fff", fontFamily: fontFamilies.display }]}>
                124K+
              </Text>
              <Text style={[styles.cardSmall, { color: "rgba(255,255,255,0.9)", fontFamily: fontFamilies.body }]}>
                tickets sold this month
              </Text>
            </View>

            {/* top-right image */}
            <View style={[styles.imgWrap, styles.imgTopRight]}>
              <View style={[styles.imgPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="train-outline" size={48} color={colors.gold} />
              </View>
              <StatPill
                value="98%"
                label="satisfied riders"
                colors={colors}
                style={styles.pillTopRight}
              />
            </View>

            {/* play button */}
            <View style={[styles.playRing, { borderColor: colors.ink }]}>
              <View style={[styles.playBtnCircle, { backgroundColor: colors.gold }]}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
            </View>

            {/* bottom-left image */}
            <View style={[styles.imgWrap, styles.imgBottomLeft]}>
              <View style={[styles.imgPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="people-outline" size={48} color={colors.gold} />
              </View>
              <StatPill
                value="14K"
                label="daily departures"
                colors={colors}
                style={styles.pillBottomRight}
              />
            </View>

            {/* bottom-right stat card */}
            <View
              style={[
                styles.collageCard,
                styles.cardBottomRight,
                { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.cardBig, { color: colors.gold, fontFamily: fontFamilies.display }]}>
                5.8K
              </Text>
              <Text style={[styles.cardSmall, { color: colors.inkMuted, fontFamily: fontFamilies.body }]}>
                routes served
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── search card (existing) ── */}
      <View style={[styles.searchWrap, { paddingHorizontal: spacing(6) }]}>
        <SearchCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: spacing(20) },

  /* nav */
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing(4),
  },
  logo: { fontSize: 22, letterSpacing: -0.5 },
  navLinks: { flexDirection: "row", gap: 28 },
  navLink: { fontSize: 13, letterSpacing: 0.3 },
  contactBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  contactBtnText: { fontSize: 13 },

  /* hero row */
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing(10),
    paddingBottom: spacing(10),
    gap: spacing(8),
  },
  heroRowNarrow: { flexDirection: "column", paddingTop: spacing(6) },

  /* copy */
  copy: { flex: 1, maxWidth: 540, minWidth: 300 },
  copyNarrow: { maxWidth: "100%" },

  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: spacing(5),
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3 },
  eyebrowText: { fontSize: 11, letterSpacing: 1.4 },

  headline: { fontSize: 56, lineHeight: 60, letterSpacing: -1.2 },
  headlineNarrow: { fontSize: 36, lineHeight: 40 },

  subhead: { fontSize: 16, lineHeight: 25, marginTop: spacing(4), maxWidth: 420 },

  /* CTAs */
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(4),
    marginTop: spacing(6),
  },
  primaryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryBtnText: { fontSize: 14, letterSpacing: 0.2 },

  secondaryBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  secondaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14 },

  /* powered by */
  poweredBy: { marginTop: spacing(10) },
  poweredLabel: { fontSize: 11, letterSpacing: 0.5, marginBottom: spacing(2) },
  partnerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    rowGap: 8,
  },
  partnerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  partnerDot: { width: 5, height: 5, borderRadius: 2.5, opacity: 0.6 },
  partnerName: { fontSize: 12, opacity: 0.7 },

  /* collage */
  collage: {
    width: 420,
    height: 380,
    position: "relative",
  },

  collageCard: {
    borderRadius: 20,
    padding: 18,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTopLeft: {
    width: 170,
    height: 140,
    top: 0,
    left: 60,
    zIndex: 2,
  },
  cardBottomRight: {
    width: 130,
    height: 90,
    bottom: 20,
    right: 10,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBig: { fontSize: 28, letterSpacing: -0.5 },
  cardSmall: { fontSize: 11, marginTop: 4, lineHeight: 15 },

  avatarStack: { flexDirection: "row", marginBottom: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },

  imgWrap: { position: "absolute", borderRadius: 20, overflow: "hidden" },
  imgTopRight: { width: 180, height: 200, top: 20, right: 0 },
  imgBottomLeft: { width: 220, height: 140, bottom: 0, left: 0 },

  imgPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  playRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    top: 130,
    left: 30,
    zIndex: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  playBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  /* stat pills */
  statPill: {
    position: "absolute",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    alignItems: "center",
  },
  pillTopRight: { top: 12, right: -14 },
  pillBottomRight: { bottom: 12, right: -14 },
  statValue: { fontSize: 18, letterSpacing: -0.3 },
  statLabel: { fontSize: 10, marginTop: 2 },

  /* search */
  searchWrap: { marginTop: -spacing(4) },
});