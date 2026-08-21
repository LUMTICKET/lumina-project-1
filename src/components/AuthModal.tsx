import { Feather } from "@expo/vector-icons";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useState } from "react";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

type AuthMode = "login" | "signup";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({
  visible,
  onClose,
  initialMode = "signup",
}: AuthModalProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const isSmallPhone = width < 380;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";

  const toggleMode = () => {
    setMode(isSignup ? "login" : "signup");
    setEmail("");
    setPassword("");
    setName("");
  };

  const cardPadding = isDesktop ? spacing(6) : isSmallPhone ? spacing(4) : spacing(5);
  const wrapperPadding = isDesktop ? spacing(6) : spacing(3);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            bounces={false}
          >
            <View style={[styles.cardWrapper, { padding: wrapperPadding }]}>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                    padding: cardPadding,
                    paddingTop: cardPadding + spacing(2),
                  },
                ]}
              >
                {/* Close */}
                <Pressable style={styles.closeBtn} onPress={onClose}>
                  <Feather name="x" size={22} color={colors.inkMuted} />
                </Pressable>

                {/* Logo */}
                <View style={styles.logoArea}>
                  <View style={[styles.logoMark, { backgroundColor: colors.gold }]}>
                    <Text style={[styles.logoLetter, { color: colors.black }]}>
                      L
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.logoText,
                      { color: colors.ink, fontFamily: fontFamilies.display },
                    ]}
                  >
                    lumticket
                  </Text>
                </View>

                {/* Heading */}
                <Text
                  style={[
                    styles.heading,
                    {
                      color: colors.ink,
                      fontFamily: fontFamilies.display,
                      fontSize: isSmallPhone ? 20 : 24,
                    },
                  ]}
                >
                  {isSignup ? "Welcome to LumTicket" : "Welcome back"}
                </Text>
                <Text
                  style={[
                    styles.subheading,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  {isSignup
                    ? "Find events, book buses, and track deliveries"
                    : "Log in to continue your journey"}
                </Text>

                {/* Google */}
                <Pressable
                  style={[
                    styles.socialBtn,
                    {
                      backgroundColor: colors.bgAlt,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Image
                    source={require("../../assets/images/icons8-google-50.png")}
                    style={styles.googleIcon}
                  />
                  <Text
                    style={[
                      styles.socialText,
                      { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    Continue with Google
                  </Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View
                    style={[styles.dividerLine, { backgroundColor: colors.border }]}
                  />
                  <Text
                    style={[
                      styles.dividerText,
                      { color: colors.inkMuted, fontFamily: fontFamilies.body },
                    ]}
                  >
                    or
                  </Text>
                  <View
                    style={[styles.dividerLine, { backgroundColor: colors.border }]}
                  />
                </View>

                {/* Form */}
                {isSignup && (
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.bgAlt,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Feather name="user" size={18} color={colors.inkMuted} />
                    <TextInput
                      placeholder="Full name"
                      placeholderTextColor={colors.inkMuted}
                      value={name}
                      onChangeText={setName}
                      style={[
                        styles.input,
                        { color: colors.ink, fontFamily: fontFamilies.body },
                      ]}
                    />
                  </View>
                )}

                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.bgAlt,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Feather name="mail" size={18} color={colors.inkMuted} />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor={colors.inkMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[
                      styles.input,
                      { color: colors.ink, fontFamily: fontFamilies.body },
                    ]}
                  />
                </View>

                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.bgAlt,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Feather name="lock" size={18} color={colors.inkMuted} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor={colors.inkMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[
                      styles.input,
                      { color: colors.ink, fontFamily: fontFamilies.body },
                    ]}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                </View>

                {/* Submit */}
                <Pressable
                  style={[
                    styles.submitBtn,
                    { backgroundColor: colors.gold },
                  ]}
                >
                  <Text
                    style={[
                      styles.submitText,
                      { color: colors.white, fontFamily: fontFamilies.bodySemi },
                    ]}
                  >
                    {isSignup ? "Create account" : "Log in"}
                  </Text>
                </Pressable>

                {/* Toggle */}
                <View style={styles.toggleRow}>
                  <Text
                    style={[
                      styles.toggleText,
                      { color: colors.inkMuted, fontFamily: fontFamilies.body },
                    ]}
                  >
                    {isSignup ? "Already have an account?" : "No account yet?"}
                  </Text>
                  <Pressable onPress={toggleMode}>
                    <Text
                      style={[
                        styles.toggleLink,
                        { color: colors.gold, fontFamily: fontFamilies.bodySemi },
                      ]}
                    >
                      {isSignup ? "Log in" : "Sign up"}
                    </Text>
                  </Pressable>
                </View>

                {/* Terms */}
                <Text
                  style={[
                    styles.terms,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                >
                  By continuing, you agree to LumTicket’s Terms of Service and
                  Privacy Policy.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: radii.xl,
    borderWidth: 1,
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: spacing(2),
    right: spacing(2),
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: spacing(4),
    gap: spacing(2),
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: "800",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  heading: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing(1),
  },
  subheading: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing(5),
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2.5),
    height: 48,
    borderRadius: radii.full,
    borderWidth: 1,
    marginBottom: spacing(4),
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  socialText: {
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    marginBottom: spacing(4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    minWidth: 0,
  },
  dividerText: {
    fontSize: 13,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2.5),
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(3.5),
    marginBottom: spacing(2.5),
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
    minWidth: 0,
  },
  submitBtn: {
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing(1),
    marginBottom: spacing(4),
  },
  submitText: {
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1.5),
    marginBottom: spacing(3),
    flexWrap: "wrap",
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
  },
  terms: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
