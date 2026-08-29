import {
  decodeJwtPayload,
  googleAuth,
  login,
  signup,
  User,
} from "@/services/auth";
import { Feather } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

WebBrowser.maybeCompleteAuthSession();

type AuthMode = "login" | "signup";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onAuthSuccess?: (user: User, token: string) => void;
}

export default function AuthModal({
  visible,
  onClose,
  initialMode = "signup",
  onAuthSuccess,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const redirectUri = Platform.OS === "web"
  ? (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "")
  : makeRedirectUri({ useProxy: false });

console.log("🔴 EXACT Google Redirect URI:", redirectUri);

  /* ── Google OAuth (direct, no proxy) ── */
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      redirectUri: makeRedirectUri({ useProxy: false }),
      responseType: "id_token",
      scopes: ["openid", "profile", "email"],
    },
    { useProxy: false }
  );

  useEffect(() => {
    if (visible) {
      setError(null);
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [visible]);

  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      handleGoogleIdToken(response.params.id_token);
    } else if (response?.type === "error") {
      const msg =
        typeof response.error === "string"
          ? response.error
          : (response.error as any)?.description || "Google sign-in failed.";
      setError(msg);
    }
  }, [response]);

  const toggleMode = () => {
    setMode(isSignup ? "login" : "signup");
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
  };

  const validate = useCallback(() => {
    if (!email.trim() || !password.trim())
      return "Email and password are required.";
    if (isSignup && !name.trim()) return "Please enter your full name.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";
    return null;
  }, [email, password, name, isSignup]);

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = isSignup
        ? await signup(email, password, name)
        : await login(email, password);

      onAuthSuccess?.(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleIdToken = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = decodeJwtPayload(idToken);
      if (!payload.email) throw new Error("No email found in Google account.");

      const data = await googleAuth(
        idToken,
        payload.email,
        payload.name || payload.given_name || "",
        payload.picture || ""
      );
      onAuthSuccess?.(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    if (!request) {
      setError(
        Platform.OS === "web" && !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
          ? "Google Web Client ID is missing. Check your .env file."
          : "Google sign-in is not ready yet. Please wait."
      );
      return;
    }
    setError(null);
    try {
      await promptAsync();
    } catch {
      setError("Could not open Google sign-in.");
    }
  };

  const cardPadding = isDesktop
    ? spacing(6)
    : isSmallPhone
    ? spacing(4)
    : spacing(5);
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
                  <View
                    style={[styles.logoMark, { backgroundColor: colors.gold }]}
                  >
                    <Text style={[styles.logoLetter, { color: colors.black }]}>
                      L
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.logoText,
                      {
                        color: colors.ink,
                        fontFamily: fontFamilies.display,
                      },
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
                    {
                      color: colors.inkMuted,
                      fontFamily: fontFamilies.body,
                    },
                  ]}
                >
                  {isSignup
                    ? "Find events, book buses, and track deliveries"
                    : "Log in to continue your journey"}
                </Text>

                {/* Error banner */}
                {error && (
                  <View
                    style={[
                      styles.errorBox,
                      {
                        backgroundColor: colors.bgAlt,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name="alert-circle"
                      size={16}
                      color="#ef4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color: "#ef4444",
                          fontFamily: fontFamilies.body,
                        },
                      ]}
                    >
                      {error}
                    </Text>
                  </View>
                )}

                {/* Google */}
                <Pressable
                  style={[
                    styles.socialBtn,
                    {
                      backgroundColor: colors.bgAlt,
                      borderColor: colors.border,
                      opacity: !request || loading ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleGooglePress}
                  disabled={!request || loading}
                >
                  <Image
                    source={require("../../assets/images/icons8-google-50.png")}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.socialText,
                      {
                        color: colors.ink,
                        fontFamily: fontFamilies.bodySemi,
                      },
                    ]}
                  >
                    Continue with Google
                  </Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: colors.border },
                    ]}
                  />
                  <Text
                    style={[
                      styles.dividerText,
                      {
                        color: colors.inkMuted,
                        fontFamily: fontFamilies.body,
                      },
                    ]}
                  >
                    or
                  </Text>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: colors.border },
                    ]}
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
                      editable={!loading}
                      autoComplete="name"
                      textContentType="name"
                      style={[
                        styles.input,
                        {
                          color: colors.ink,
                          fontFamily: fontFamilies.body,
                        },
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
                    editable={!loading}
                    autoComplete="email"
                    textContentType="emailAddress"
                    style={[
                      styles.input,
                      {
                        color: colors.ink,
                        fontFamily: fontFamilies.body,
                      },
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
                    editable={!loading}
                    autoComplete={isSignup ? "new-password" : "password"}
                    textContentType={isSignup ? "newPassword" : "password"}
                    style={[
                      styles.input,
                      {
                        color: colors.ink,
                        fontFamily: fontFamilies.body,
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
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
                    {
                      backgroundColor: colors.gold,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.submitText,
                        {
                          color: colors.white,
                          fontFamily: fontFamilies.bodySemi,
                        },
                      ]}
                    >
                      {isSignup ? "Create account" : "Log in"}
                    </Text>
                  )}
                </Pressable>

                {/* Toggle */}
                <View style={styles.toggleRow}>
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color: colors.inkMuted,
                        fontFamily: fontFamilies.body,
                      },
                    ]}
                  >
                    {isSignup
                      ? "Already have an account?"
                      : "No account yet?"}
                  </Text>
                  <Pressable onPress={toggleMode} disabled={loading}>
                    <Text
                      style={[
                        styles.toggleLink,
                        {
                          color: colors.gold,
                          fontFamily: fontFamilies.bodySemi,
                        },
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
                    {
                      color: colors.inkMuted,
                      fontFamily: fontFamilies.body,
                    },
                  ]}
                >
                  By continuing, you agree to LumTicket's Terms of Service and
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
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing(3),
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing(4),
  },
  errorText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
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