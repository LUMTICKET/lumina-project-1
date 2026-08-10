import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  Image,
  Platform,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  G,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

/* ------------------------------------------------------------------ */
// Types
/* ------------------------------------------------------------------ */
export type TicketCategory = "event" | "bus" | "flight" | "tourism" | string;

export interface RouteInfo {
  from: string;
  to: string;
  fromCode?: string;
  toCode?: string;
  stops?: string[];
  duration?: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  perks: string[];
  remaining: number;
}

export interface TicketConfig {
  id: string;
  title: string;
  subtitle?: string;
  category: TicketCategory;
  image: any;
  organizer: string;
  organizerAvatar?: string;
  date: string;
  time?: string;
  location: string;
  route?: RouteInfo;
  tiers: TicketTier[];
  description: string;
  tags: string[];
  maxPerUser: number;
  slotExpiryMinutes?: number;
}

export interface PurchasePayload {
  ticketId: string;
  tierId: string;
  quantity: number;
  mode: "instant" | "slot";
  slotExpiry?: number;
  totalPrice: number;
  currency: string;
  ticketTitle: string;
  tierName: string;
}

/* ------------------------------------------------------------------ */
// Utilities
/* ------------------------------------------------------------------ */
function formatDuration(totalSeconds: number) {
  if (totalSeconds <= 0) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function useCountdown(targetDate: string | Date) {
  const [remaining, setRemaining] = useState(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return remaining;
}

function useSlotReservation(expiryMinutes: number = 120) {
  const [slot, setSlot] = useState<{
    reservedAt: number;
    expiresAt: number;
    active: boolean;
  } | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<any>(null);

  const reserve = () => {
    const now = Date.now();
    const expires = now + expiryMinutes * 60 * 1000;
    setSlot({ reservedAt: now, expiresAt: expires, active: true });
    setSecondsLeft(expiryMinutes * 60);
  };

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSlot(null);
    setSecondsLeft(0);
  };

  useEffect(() => {
    if (!slot?.active) return;
    timerRef.current = setInterval(() => {
      const left = Math.floor((slot.expiresAt - Date.now()) / 1000);
      if (left <= 0) {
        setSlot((prev) => (prev ? { ...prev, active: false } : null));
        setSecondsLeft(0);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setSecondsLeft(left);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slot?.active, slot?.expiresAt]);

  return { slot, secondsLeft, reserve, cancel, isActive: !!slot?.active };
}

/* ------------------------------------------------------------------ */
// Animated Route — bus or plane moving A→B (bus/flight only)
/* ------------------------------------------------------------------ */
const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

function RouteAnimation({
  route,
  category,
}: {
  route?: RouteInfo;
  category: TicketCategory;
}) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();

  const isBus = category === "bus";
  const isFlight = category === "flight";
  const showAnimation = isBus || isFlight;

  const busProgress = useRef(new RNAnimated.Value(0)).current;
  const pulseA = useRef(new RNAnimated.Value(1)).current;
  const pulseB = useRef(new RNAnimated.Value(1)).current;

  const radiusA = pulseA.interpolate({
    inputRange: [1, 1.6],
    outputRange: [14, 22.4],
  });
  const radiusB = pulseB.interpolate({
    inputRange: [1, 1.6],
    outputRange: [14, 22.4],
  });

  useEffect(() => {
    if (!showAnimation || !route) return;

    const anim = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(busProgress, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        RNAnimated.delay(600),
        RNAnimated.timing(busProgress, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        RNAnimated.delay(600),
      ])
    );

    const a = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseA, {
          toValue: 1.6,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        RNAnimated.timing(pulseA, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    const b = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(500),
        RNAnimated.timing(pulseB, {
          toValue: 1.6,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        RNAnimated.timing(pulseB, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    a.start();
    b.start();

    return () => {
      anim.stop();
      a.stop();
      b.stop();
    };
  }, [showAnimation, route]);

  if (!showAnimation || !route) {
    return null;
  }

  const containerW = Math.min(width - spacing(8), 480);
  const pad = 44;
  const h = 110;
  const startX = pad;
  const endX = containerW - pad;
  const midY = h / 2;

  const controlY = isFlight ? midY - 30 : midY + 18;
  const pathD = `M ${startX} ${midY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${midY}`;

  const busX = busProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });
  const busY = busProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [midY, controlY + (isFlight ? 8 : -6), midY],
  });

  const rotate = busProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [isFlight ? "-15deg" : "0deg", isFlight ? "15deg" : "0deg"],
  });

  const fromLabel = route.fromCode || route.from;
  const toLabel = route.toCode || route.to;
  const iconName = isFlight ? "navigation" : "truck";

  return (
    <View style={{ alignItems: "center", marginVertical: spacing(2) }}>
      <View
        style={{
          width: containerW,
          height: h + 44,
          backgroundColor: colors.bgAlt,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        <Svg width={containerW} height={h + 44}>
          <Path
            d={pathD}
            stroke={colors.border}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={pathD}
            stroke={colors.gold}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 5"
            opacity={0.5}
          />

          <AnimatedCircle
            cx={startX}
            cy={midY}
            r={radiusA as any}
            fill={colors.gold}
            opacity={0.12}
          />
          <Circle
            cx={startX}
            cy={midY}
            r={8}
            fill={colors.gold}
            stroke="#fff"
            strokeWidth={2.5}
          />
          <SvgText
            x={startX}
            y={midY + 24}
            textAnchor="middle"
            fill={colors.ink}
            fontSize="12"
            fontFamily={fontFamilies.bodySemi}
          >
            {fromLabel}
          </SvgText>

          <AnimatedCircle
            cx={endX}
            cy={midY}
            r={radiusB as any}
            fill={colors.gold}
            opacity={0.12}
          />
          <Circle
            cx={endX}
            cy={midY}
            r={8}
            fill={colors.gold}
            stroke="#fff"
            strokeWidth={2.5}
          />
          <SvgText
            x={endX}
            y={midY + 24}
            textAnchor="middle"
            fill={colors.ink}
            fontSize="12"
            fontFamily={fontFamilies.bodySemi}
          >
            {toLabel}
          </SvgText>

          {route.duration && (
            <G>
              <Rect
                x={(startX + endX) / 2 - 36}
                y={controlY - (isFlight ? 28 : -10)}
                width={72}
                height={22}
                rx={11}
                fill={colors.bg}
                stroke={colors.gold}
                strokeWidth={1}
                opacity={0.95}
              />
              <SvgText
                x={(startX + endX) / 2}
                y={controlY - (isFlight ? 16 : 2)}
                textAnchor="middle"
                fill={colors.ink}
                fontSize="11"
                fontFamily={fontFamilies.bodySemi}
              >
                {route.duration}
              </SvgText>
            </G>
          )}
        </Svg>

        <RNAnimated.View
          style={{
            position: "absolute",
            left: busX,
            top: busY,
            transform: [{ translateX: -14 }, { translateY: -14 }, { rotate }],
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.gold,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.gold,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Feather name={iconName as any} size={13} color={colors.black} />
          </View>
        </RNAnimated.View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Location Details — for event / tourism / other categories
/* ------------------------------------------------------------------ */
function LocationDetails({
  location,
  date,
  time,
}: {
  location: string;
  date: string;
  time?: string;
}) {
  const { colors } = useLumTheme();

  return (
    <View
      style={{
        marginVertical: spacing(2),
        padding: spacing(3.5),
        backgroundColor: colors.bgAlt,
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing(2.5),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2.5) }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.lg,
            backgroundColor: colors.gold + "18",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="map-pin" size={18} color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: colors.inkMuted,
              fontFamily: fontFamilies.body,
            }}
          >
            Location
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: colors.ink,
              fontFamily: fontFamilies.bodySemi,
              marginTop: 1,
            }}
            numberOfLines={2}
          >
            {location}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: spacing(2) }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(2),
            padding: spacing(2.5),
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
          }}
        >
          <Feather name="calendar" size={16} color={colors.inkMuted} />
          <View>
            <Text style={{ fontSize: 11, color: colors.inkMuted, fontFamily: fontFamilies.body }}>
              Date
            </Text>
            <Text style={{ fontSize: 13, color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: 1 }}>
              {date}
            </Text>
          </View>
        </View>
        {time && (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(2),
              padding: spacing(2.5),
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
            }}
          >
            <Feather name="clock" size={16} color={colors.inkMuted} />
            <View>
              <Text style={{ fontSize: 11, color: colors.inkMuted, fontFamily: fontFamilies.body }}>
                Time
              </Text>
              <Text style={{ fontSize: 13, color: colors.ink, fontFamily: fontFamilies.bodySemi, marginTop: 1 }}>
                {time}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Sub-components
/* ------------------------------------------------------------------ */
function CountdownBadge({
  targetDate,
  label,
  color,
}: {
  targetDate: string;
  label: string;
  color?: string;
}) {
  const { colors } = useLumTheme();
  const remaining = useCountdown(targetDate);
  return (
    <View style={[styles.countdownWrap, { backgroundColor: colors.bgAlt }]}>
      <Feather name="clock" size={14} color={color || colors.gold} />
      <Text style={[styles.countdownLabel, { color: colors.inkMuted }]}>{label}</Text>
      <Text
        style={[
          styles.countdownValue,
          { color: color || colors.gold, fontFamily: fontFamilies.bodySemi },
        ]}
      >
        {formatDuration(remaining)}
      </Text>
    </View>
  );
}

function RouteChip({ route }: { route: RouteInfo }) {
  const { colors } = useLumTheme();
  return (
    <View style={[styles.routeWrap, { backgroundColor: colors.bgAlt }]}>
      <View style={styles.routeRow}>
        <View style={styles.routeNode}>
          <View style={[styles.routeDot, { backgroundColor: colors.gold }]} />
          <Text
            style={[styles.routeText, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}
          >
            {route.from}
          </Text>
          {route.fromCode && (
            <Text style={[styles.routeCode, { color: colors.inkMuted }]}>{route.fromCode}</Text>
          )}
        </View>
        <View style={styles.routeLineWrap}>
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <Feather name="arrow-right" size={14} color={colors.inkMuted} />
          {route.duration && (
            <Text style={[styles.routeDuration, { color: colors.inkMuted }]}>
              {route.duration}
            </Text>
          )}
        </View>
        <View style={styles.routeNode}>
          <View style={[styles.routeDot, { backgroundColor: colors.gold }]} />
          <Text
            style={[styles.routeText, { color: colors.ink, fontFamily: fontFamilies.bodySemi }]}
          >
            {route.to}
          </Text>
          {route.toCode && (
            <Text style={[styles.routeCode, { color: colors.inkMuted }]}>{route.toCode}</Text>
          )}
        </View>
      </View>
      {route.stops && route.stops.length > 0 && (
        <View style={styles.stopsRow}>
          <Feather name="map-pin" size={12} color={colors.inkMuted} />
          <Text style={[styles.stopsText, { color: colors.inkMuted }]}>
            Stops: {route.stops.join(" • ")}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Main Component
/* ------------------------------------------------------------------ */
interface TicketConfigPageProps {
  ticket: TicketConfig;
  onClose?: () => void;
  onPurchase?: (payload: PurchasePayload) => void;
  onNavigateToPayment?: (payload: PurchasePayload) => void;
}

export default function TicketConfigPage({ ticket, onClose, onPurchase, onNavigateToPayment }: TicketConfigPageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 768 && width < 900;

  const [selectedTierId, setSelectedTierId] = useState(ticket.tiers[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState<"instant" | "slot">("instant");
  const { slot, secondsLeft, reserve, cancel, isActive } = useSlotReservation(
    ticket.slotExpiryMinutes || 120
  );

  const selectedTier = ticket.tiers.find((t) => t.id === selectedTierId);
  const totalPrice = (selectedTier?.price || 0) * quantity;
  const currency = selectedTier?.currency || "MWK";

  const countdownTarget = ticket.date;
  const countdownLabel =
    ticket.category === "bus"
      ? "Departs in"
      : ticket.category === "flight"
      ? "Boarding in"
      : ticket.category === "event"
      ? "Event starts in"
      : "Starts in";

  const isBus = ticket.category === "bus";
  const isFlight = ticket.category === "flight";
  const showRouteAnimation = isBus || isFlight;

  const handlePrimaryAction = () => {
    if (purchaseMode === "slot" && !isActive) {
      reserve();
      return;
    }

    const payload: PurchasePayload = {
      ticketId: ticket.id,
      tierId: selectedTierId || "",
      quantity,
      mode: purchaseMode,
      slotExpiry: slot?.expiresAt,
      totalPrice,
      currency,
      ticketTitle: ticket.title,
      tierName: selectedTier?.name || "",
    };

    onNavigateToPayment?.(payload);
  };

  const ContentCard = useCallback(
    () => (
      <View
        style={[
          styles.contentCard,
          { backgroundColor: colors.bg },
          isDesktop && {
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isDesktop ? spacing(6) : spacing(24) },
          ]}
        >
          {/* Hero with framed image */}
          <View style={styles.heroFrame}>
            <View
              style={[
                styles.heroWrap,
                isDesktop && { height: 240, borderRadius: radii.xl },
              ]}
            >
              <Image source={ticket.image} style={styles.heroImage} resizeMode="cover" />
              <View
                style={[
                  styles.heroOverlay,
                  { backgroundColor: colors.black + "45" },
                ]}
              />
              <View style={styles.heroContent}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: colors.gold },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.black, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    {ticket.category.toUpperCase()}
                  </Text>
                </View>
                <CountdownBadge targetDate={countdownTarget} label={countdownLabel} />
              </View>
            </View>
          </View>

          {/* Body */}
          <View style={[styles.body, { gap: spacing(4) }]}>
            <View style={styles.titleSection}>
              <Text
                style={[
                  styles.title,
                  { color: colors.ink, fontFamily: fontFamilies.display },
                ]}
              >
                {ticket.title}
              </Text>
              {ticket.subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  {ticket.subtitle}
                </Text>
              )}
              <View style={styles.organizerRow}>
                {ticket.organizerAvatar ? (
                  <Image
                    source={{ uri: ticket.organizerAvatar }}
                    style={styles.orgAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.orgAvatarFallback,
                      { backgroundColor: colors.bgAlt },
                    ]}
                  >
                    <Feather name="briefcase" size={14} color={colors.inkMuted} />
                  </View>
                )}
                <Text
                  style={[
                    styles.orgName,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  {ticket.organizer}
                </Text>
              </View>
            </View>

            {showRouteAnimation && ticket.route && (
              <RouteAnimation route={ticket.route} category={ticket.category} />
            )}
            {!showRouteAnimation && (
              <LocationDetails
                location={ticket.location}
                date={ticket.date}
                time={ticket.time}
              />
            )}

            {ticket.route && <RouteChip route={ticket.route} />}

            <View style={styles.metaRow}>
              <View style={[styles.metaChip, { backgroundColor: colors.bgAlt }]}>
                <Feather name="calendar" size={14} color={colors.inkMuted} />
                <Text style={[styles.metaText, { color: colors.inkMuted }]}>
                  {ticket.date}
                </Text>
              </View>
              {ticket.time && (
                <View style={[styles.metaChip, { backgroundColor: colors.bgAlt }]}>
                  <Feather name="clock" size={14} color={colors.inkMuted} />
                  <Text style={[styles.metaText, { color: colors.inkMuted }]}>
                    {ticket.time}
                  </Text>
                </View>
              )}
              <View style={[styles.metaChip, { backgroundColor: colors.bgAlt }]}>
                <Feather name="map-pin" size={14} color={colors.inkMuted} />
                <Text style={[styles.metaText, { color: colors.inkMuted }]}>
                  {ticket.location}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.description,
                { color: colors.ink, fontFamily: fontFamilies.body },
              ]}
            >
              {ticket.description}
            </Text>

            <View style={styles.tagRow}>
              {ticket.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: colors.gold + "18" }]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: colors.gold, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Select ticket tier
            </Text>
            <View style={styles.tierList}>
              {ticket.tiers.map((tier) => {
                const isSelected = tier.id === selectedTierId;
                const isSoldOut = tier.remaining <= 0;
                return (
                  <Pressable
                    key={tier.id}
                    onPress={() => !isSoldOut && setSelectedTierId(tier.id)}
                    style={[
                      styles.tierCard,
                      {
                        backgroundColor: isSelected
                          ? colors.gold + "14"
                          : colors.surface,
                        borderColor: isSelected ? colors.gold : colors.border,
                        opacity: isSoldOut ? 0.45 : 1,
                      },
                    ]}
                  >
                    <View style={styles.tierTop}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.tierName,
                            {
                              color: colors.ink,
                              fontFamily: fontFamilies.bodySemi,
                            },
                          ]}
                        >
                          {tier.name}
                        </Text>
                        <Text
                          style={[
                            styles.tierPerks,
                            {
                              color: colors.inkMuted,
                              fontFamily: fontFamilies.body,
                            },
                          ]}
                        >
                          {tier.perks.join(" • ")}
                        </Text>
                      </View>
                      <View style={styles.tierPriceWrap}>
                        <Text
                          style={[
                            styles.tierPrice,
                            {
                              color: isSelected ? colors.gold : colors.ink,
                              fontFamily: fontFamilies.display,
                            },
                          ]}
                        >
                          {tier.currency} {tier.price.toLocaleString()}
                        </Text>
                        <Text
                          style={[
                            styles.tierRemaining,
                            { color: colors.inkMuted },
                          ]}
                        >
                          {tier.remaining} left
                        </Text>
                      </View>
                    </View>
                    {isSoldOut && (
                      <View style={styles.soldOutBadge}>
                        <Text
                          style={[
                            styles.soldOutText,
                            {
                              color: colors.inkMuted,
                              fontFamily: fontFamilies.bodySemi,
                            },
                          ]}
                        >
                          Sold out
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Quantity
            </Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={[styles.qtyBtn, { backgroundColor: colors.bgAlt }]}
              >
                <Feather name="minus" size={18} color={colors.ink} />
              </Pressable>
              <TextInput
                value={quantity.toString()}
                editable={false}
                style={[
                  styles.qtyInput,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
              />
              <Pressable
                onPress={() =>
                  setQuantity(Math.min(ticket.maxPerUser, quantity + 1))
                }
                style={[styles.qtyBtn, { backgroundColor: colors.bgAlt }]}
              >
                <Feather name="plus" size={18} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.modeToggle}>
              <Pressable
                onPress={() => {
                  setPurchaseMode("instant");
                  cancel();
                }}
                style={[
                  styles.modeBtn,
                  {
                    backgroundColor:
                      purchaseMode === "instant" ? colors.gold : colors.bgAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    {
                      color:
                        purchaseMode === "instant" ? colors.black : colors.ink,
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  Buy now
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPurchaseMode("slot")}
                style={[
                  styles.modeBtn,
                  {
                    backgroundColor:
                      purchaseMode === "slot" ? colors.gold : colors.bgAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    {
                      color:
                        purchaseMode === "slot" ? colors.black : colors.ink,
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  Reserve 2hr slot
                </Text>
              </Pressable>
            </View>

            {purchaseMode === "slot" && isActive && (
              <View
                style={[
                  styles.slotBanner,
                  { backgroundColor: colors.gold + "14", borderColor: colors.gold },
                ]}
              >
                <Feather name="clock" size={16} color={colors.gold} />
                <Text
                  style={[
                    styles.slotText,
                    { color: colors.gold, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  Slot reserved — complete payment in{" "}
                  {formatDuration(secondsLeft)}
                </Text>
                <Pressable onPress={cancel}>
                  <Feather name="x" size={16} color={colors.gold} />
                </Pressable>
              </View>
            )}
            {purchaseMode === "slot" && !isActive && slot && (
              <View
                style={[
                  styles.slotBanner,
                  { backgroundColor: colors.bgAlt, borderColor: colors.border },
                ]}
              >
                <Feather name="alert-circle" size={16} color={colors.inkMuted} />
                <Text
                  style={[
                    styles.slotText,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Slot expired. You have been removed from the queue.
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              <View>
                <Text
                  style={[
                    styles.totalLabel,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    styles.totalValue,
                    { color: colors.ink, fontFamily: fontFamilies.display },
                  ]}
                >
                  {currency} {totalPrice.toLocaleString()}
                </Text>
              </View>
              <Pressable
                onPress={handlePrimaryAction}
                style={[styles.ctaBtn, { backgroundColor: colors.gold }]}
              >
                <Text
                  style={[
                    styles.ctaText,
                    { color: colors.black, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  {purchaseMode === "slot" && !isActive
                    ? "Reserve slot"
                    : purchaseMode === "slot" && isActive
                    ? "Complete payment"
                    : "Buy ticket"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    ),
    [
      colors,
      isDesktop,
      ticket,
      selectedTierId,
      quantity,
      purchaseMode,
      isActive,
      slot,
      secondsLeft,
      totalPrice,
      currency,
      countdownTarget,
      countdownLabel,
      showRouteAnimation,
      handlePrimaryAction,
    ]
  );

  if (isDesktop || isTablet) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
        <View
          style={[
            styles.header,
            { backgroundColor: colors.bg, borderBottomColor: colors.border },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
              : {},
          ]}
        >
          <Pressable onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.ink} />
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.ink, fontFamily: fontFamilies.display },
            ]}
            numberOfLines={1}
          >
            {ticket.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            padding: spacing(6),
          }}
        >
          <View style={{ maxWidth: 720, width: "100%" }}>
            <ContentCard />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
          Platform.OS === "web"
            ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
            : {},
        ]}
      >
        <Pressable onPress={onClose} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.ink, fontFamily: fontFamilies.display },
          ]}
          numberOfLines={1}
        >
          {ticket.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ContentCard />
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Styles
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing(2),
  },

  contentCard: { flex: 1, overflow: "hidden" },
  scrollContent: { flexGrow: 1 },

  heroFrame: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(4),
  },
  heroWrap: {
    position: "relative",
    width: "100%",
    height: 220,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: "absolute",
    bottom: spacing(4),
    left: spacing(4),
    right: spacing(4),
    gap: spacing(2),
  },

  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radii.full,
  },
  categoryText: { fontSize: 11, letterSpacing: 0.5 },

  countdownWrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing(2),
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
  },
  countdownLabel: { fontSize: 12 },
  countdownValue: { fontSize: 14 },

  body: { paddingHorizontal: spacing(4), paddingTop: spacing(4) },
  titleSection: { gap: spacing(1.5) },
  title: { fontSize: 22, lineHeight: 28 },
  subtitle: { fontSize: 14 },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    marginTop: spacing(1),
  },
  orgAvatar: { width: 32, height: 32, borderRadius: 16 },
  orgAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  orgName: { fontSize: 14 },

  routeWrap: {
    borderRadius: radii.xl,
    padding: spacing(3),
    gap: spacing(2),
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeNode: { alignItems: "center", gap: spacing(1), flex: 1 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 13 },
  routeCode: { fontSize: 11, marginTop: 2 },
  routeLineWrap: { alignItems: "center", flex: 2, gap: spacing(1) },
  routeLine: { height: 2, width: "100%", position: "absolute", top: 4 },
  routeDuration: { fontSize: 11, marginTop: spacing(1) },
  stopsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
  },
  stopsText: { fontSize: 12 },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
  },
  metaText: { fontSize: 12 },

  description: { fontSize: 14, lineHeight: 22 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  tagChip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.full,
  },
  tagText: { fontSize: 12 },

  sectionLabel: { fontSize: 16, marginTop: spacing(2) },
  tierList: { gap: spacing(2.5) },
  tierCard: {
    borderWidth: 1.5,
    borderRadius: radii.xl,
    padding: spacing(3.5),
    gap: spacing(2),
  },
  tierTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tierName: { fontSize: 15 },
  tierPerks: { fontSize: 12, marginTop: 2 },
  tierPriceWrap: { alignItems: "flex-end" },
  tierPrice: { fontSize: 16 },
  tierRemaining: { fontSize: 11, marginTop: 2 },
  soldOutBadge: { alignSelf: "flex-start", marginTop: spacing(1) },
  soldOutText: { fontSize: 12 },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyInput: { width: 60, height: 44, textAlign: "center", fontSize: 18 },

  modeToggle: {
    flexDirection: "row",
    gap: spacing(2),
    marginTop: spacing(2),
  },
  modeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(3),
    borderRadius: radii.full,
  },
  modeText: { fontSize: 14 },

  slotBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    padding: spacing(3),
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing(2),
  },
  slotText: { flex: 1, fontSize: 13 },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing(4),
    paddingBottom: spacing(4),
    marginTop: spacing(2),
  },
  totalLabel: { fontSize: 12 },
  totalValue: { fontSize: 22, marginTop: 2 },
  ctaBtn: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3.5),
    borderRadius: radii.full,
  },
  ctaText: { fontSize: 15 },
});