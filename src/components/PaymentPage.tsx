import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import { simulatePayment } from "../services/payments";

/* ------------------------------------------------------------------ */
// Assets
/* ------------------------------------------------------------------ */
const MPAMBA_LOGO = require("@/assets/images/tnm_mpamba.jpg");
const AIRTEL_LOGO = require("@/assets/images/airtel-money.png");

/* ------------------------------------------------------------------ */
// Types
/* ------------------------------------------------------------------ */
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

export type PaymentMethod = "mpamba" | "airtel" | "card";
type PaymentStatus = "idle" | "processing" | "success" | "failed";

/* ------------------------------------------------------------------ */
// Utilities
/* ------------------------------------------------------------------ */
function formatCardNumber(value: string) {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.join(" ").substring(0, 19);
}

function formatExpiry(value: string) {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return v;
}

/* ------------------------------------------------------------------ */
// Components
/* ------------------------------------------------------------------ */
function MethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useLumTheme();

  const config = {
    mpamba: {
      label: "TNM Mpamba",
      sub: "Pay with mobile money",
      image: MPAMBA_LOGO,
    },
    airtel: {
      label: "Airtel Money",
      sub: "Pay with mobile money",
      image: AIRTEL_LOGO,
    },
    card: {
      label: "Credit / Debit Card",
      sub: "Visa, Mastercard",
      image: null,
    },
  };

  const c = config[method];

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.methodCard,
        {
          backgroundColor: selected ? colors.gold + "14" : colors.surface,
          borderColor: selected ? colors.gold : colors.border,
        },
      ]}
    >
      <View style={styles.methodRow}>
        {c.image ? (
          <Image source={c.image} style={styles.methodImage} resizeMode="contain" />
        ) : (
          <View
            style={[
              styles.methodIconWrap,
              { backgroundColor: colors.gold + "18" },
            ]}
          >
            <Feather name="credit-card" size={20} color={colors.gold} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.methodLabel,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            {c.label}
          </Text>
          <Text
            style={[
              styles.methodSub,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            {c.sub}
          </Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            {
              borderColor: selected ? colors.gold : colors.border,
              backgroundColor: selected ? colors.gold : "transparent",
            },
          ]}
        >
          {selected && <Feather name="check" size={12} color={colors.black} />}
        </View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
// Main Component
/* ------------------------------------------------------------------ */
interface PaymentPageProps {
  payload: PurchasePayload;
  onClose?: () => void;
  onComplete?: (result: { success: boolean; method: PaymentMethod; reference?: string }) => void;
  creationFee?: { businessProfileId: number };
}

export default function PaymentPage({ payload, onClose, onComplete, creationFee }: PaymentPageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [method, setMethod] = useState<PaymentMethod>("mpamba");
  const [status, setStatus] = useState<PaymentStatus>("idle");

  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const isProcessing = status === "processing";

  const handlePay = async () => {
    if (isProcessing) return;
    setStatus("processing");
    try {
      const payment = creationFee
        ? await simulatePayment(creationFee.businessProfileId, payload.totalPrice, payload.currency, method === "mpamba" ? "tnm" : method)
        : null;
      setStatus("success");
      onComplete?.({
        success: true,
        method,
        reference: payment ? String(payment.id) : `LUM-${Date.now()}`,
      });
    } catch (error) {
      setStatus("failed");
    }
  };

  const isValid = () => {
    if (method === "mpamba" || method === "airtel") {
      return phone.length >= 9;
    }
    return (
      cardNumber.replace(/\s/g, "").length >= 16 &&
      cardExpiry.length === 5 &&
      cardCvv.length >= 3 &&
      cardName.trim().length > 0
    );
  };

  const Content = useCallback(
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
          {/* Order Summary */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.bgAlt, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Order Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                Ticket
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
                numberOfLines={1}
              >
                {payload.ticketTitle}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                Tier
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                {payload.tierName}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                Quantity
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                {payload.quantity}
              </Text>
            </View>
            <View
              style={[
                styles.divider,
                { backgroundColor: colors.border },
              ]}
            />
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.totalLabel,
                  { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                Total
              </Text>
              <Text
                style={[
                  styles.totalValue,
                  { color: colors.gold, fontFamily: fontFamilies.display },
                ]}
              >
                {payload.currency} {payload.totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.ink, fontFamily: fontFamilies.bodySemi },
            ]}
          >
            Payment Method
          </Text>
          <View style={styles.methodList}>
            <MethodCard
              method="mpamba"
              selected={method === "mpamba"}
              onSelect={() => setMethod("mpamba")}
            />
            <MethodCard
              method="airtel"
              selected={method === "airtel"}
              onSelect={() => setMethod("airtel")}
            />
            <MethodCard
              method="card"
              selected={method === "card"}
              onSelect={() => setMethod("card")}
            />
          </View>

          {/* Mobile Money Form */}
          {(method === "mpamba" || method === "airtel") && (
            <View style={styles.formSection}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                Phone Number
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.prefix,
                    { color: colors.inkMuted, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  +265
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={(value) => setPhone(value.replace(/\D/g, "").slice(0, 9))}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="88XXXXXXX"
                  placeholderTextColor={colors.inkMuted}
                  autoComplete="tel"
                  style={[
                    styles.input,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.hint,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                You will receive a prompt on your phone to confirm payment.
              </Text>
            </View>
          )}

          {/* Card Form */}
          {method === "card" && (
            <View style={styles.formSection}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                Card Number
              </Text>
              <TextInput
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={colors.inkMuted}
                autoComplete="cc-number"
                style={[
                  styles.cardInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.ink,
                    fontFamily: fontFamilies.bodySemi,
                  },
                ]}
              />

              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.inkMuted, fontFamily: fontFamilies.body },
                    ]}
                  >
                    Expiry
                  </Text>
                  <TextInput
                    value={cardExpiry}
                    onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.inkMuted}
                    autoComplete="cc-exp"
                    style={[
                      styles.cardInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.ink,
                        fontFamily: fontFamilies.bodySemi,
                      },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.inkMuted, fontFamily: fontFamilies.body },
                    ]}
                  >
                    CVV
                  </Text>
                  <TextInput
                    value={cardCvv}
                    onChangeText={(value) => setCardCvv(value.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="123"
                    placeholderTextColor={colors.inkMuted}
                    secureTextEntry
                    autoComplete="cc-csc"
                    style={[
                      styles.cardInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.ink,
                        fontFamily: fontFamilies.bodySemi,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.inkMuted, fontFamily: fontFamilies.body },
                ]}
              >
                Cardholder Name
              </Text>
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Name on card"
                placeholderTextColor={colors.inkMuted}
                autoCapitalize="words"
                autoComplete="cc-name"
                style={[
                  styles.cardInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.ink,
                    fontFamily: fontFamilies.bodySemi,
                  },
                ]}
              />
            </View>
          )}

          {/* Status Banners */}
          {status === "success" && (
            <View
              style={[
                styles.statusBanner,
                { backgroundColor: colors.gold + "14", borderColor: colors.gold },
              ]}
            >
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: colors.gold },
                ]}
              >
                <Feather name="check" size={20} color={colors.black} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.statusTitle,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  Payment Successful
                </Text>
                <Text
                  style={[
                    styles.statusSub,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Your ticket has been confirmed.
                </Text>
              </View>
            </View>
          )}

          {status === "failed" && (
            <View
              style={[
                styles.statusBanner,
                { backgroundColor: colors.bgAlt, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: colors.inkMuted },
                ]}
              >
                <Feather name="x" size={20} color={colors.bg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.statusTitle,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  Payment Failed
                </Text>
                <Text
                  style={[
                    styles.statusSub,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  Something went wrong. Please try again.
                </Text>
              </View>
            </View>
          )}

          {/* CTA */}
          {status !== "success" && (
            <Pressable
              onPress={handlePay}
              disabled={!isValid() || isProcessing}
              style={[
                styles.payBtn,
                {
                  backgroundColor: isValid() && !isProcessing ? colors.gold : colors.border,
                  opacity: isValid() && !isProcessing ? 1 : 0.6,
                },
              ]}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text
                  style={[
                    styles.payBtnText,
                    { color: colors.black, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  Pay {payload.currency} {payload.totalPrice.toLocaleString()}
                </Text>
              )}
            </Pressable>
          )}

          {status === "success" && (
            <Pressable
              onPress={onClose}
              style={[
                styles.payBtn,
                { backgroundColor: colors.gold, marginTop: spacing(2) },
              ]}
            >
              <Text
                style={[
                  styles.payBtnText,
                  { color: colors.black, fontFamily: fontFamilies.bodySemi },
                ]}
              >
                Done
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    ),
    [
      colors,
      isDesktop,
      payload,
      method,
      phone,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardName,
      status,
      isProcessing,
      handlePay,
    ]
  );

  const Wrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === "ios" ? { behavior: "padding" as const, style: { flex: 1 } } : { style: { flex: 1 } };

  return (
    <Wrapper {...wrapperProps}>
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
            Payment
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {isDesktop || width >= 768 ? (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              padding: spacing(6),
            }}
          >
            <View style={{ maxWidth: 640, width: "100%" }}>
              {Content()}
            </View>
          </View>
        ) : (
          {Content()}
        )}
      </View>
    </Wrapper>
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
    marginTop: Platform.OS === "web" ? 0 : 40,
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
  scrollContent: { flexGrow: 1, padding: spacing(4) },

  summaryCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing(4),
    gap: spacing(2.5),
    marginBottom: spacing(4),
  },
  summaryTitle: { fontSize: 16 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, flex: 1, textAlign: "right", marginLeft: spacing(4) },
  divider: { height: 1, marginVertical: spacing(1) },
  totalLabel: { fontSize: 15 },
  totalValue: { fontSize: 20 },

  sectionLabel: { fontSize: 16, marginBottom: spacing(2) },

  methodList: { gap: spacing(2.5), marginBottom: spacing(4) },
  methodCard: {
    borderWidth: 1.5,
    borderRadius: radii.xl,
    padding: spacing(3),
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
  },
  methodImage: { width: 44, height: 44, borderRadius: radii.lg },
  methodIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLabel: { fontSize: 15 },
  methodSub: { fontSize: 12, marginTop: 2 },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  formSection: { gap: spacing(2), marginBottom: spacing(4) },
  inputLabel: { fontSize: 13, marginBottom: spacing(1) },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    height: 52,
  },
  prefix: { fontSize: 15, marginRight: spacing(2) },
  input: { flex: 1, fontSize: 16, height: "100%" },
  hint: { fontSize: 12, marginTop: spacing(1) },

  cardInput: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    height: 52,
    fontSize: 16,
  },
  cardRow: {
    flexDirection: "row",
    gap: spacing(2),
  },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    padding: spacing(4),
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing(4),
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: { fontSize: 15 },
  statusSub: { fontSize: 12, marginTop: 2 },

  payBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(4),
    borderRadius: radii.full,
  },
  payBtnText: { fontSize: 16 },
});