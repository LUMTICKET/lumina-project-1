import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type ViewStyle,
  useWindowDimensions,
  View,
} from "react-native";
import { toEventTicketConfig } from "../api/event-ticket";
import { fetchEvents } from "../api/events";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";
import { TicketConfig } from "./TicketConfigPage";

interface EventsTicketsProps {
  onSelectTicket?: (ticket: TicketConfig) => void;
  onBack?: () => void;
}

export default function EventsTickets({ onSelectTicket, onBack }: EventsTicketsProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [items, setItems] = useState<TicketConfig[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetchEvents({ signal: controller.signal })
      .then((events) => {
        setItems(events.map(toEventTicketConfig));
        setErrorMessage("");
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Events could not be loaded.",
        );
        setLoadState("error");
      });

    return () => controller.abort();
  }, [retryKey]);

  let columnCount = 2;
  if (width >= 1400) columnCount = 6;
  else if (width >= 1100) columnCount = 5;
  else if (width >= 768) columnCount = 3;

  const columns: TicketConfig[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => columns[index % columnCount].push(item));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {!!onBack && (
        <View
          style={[
            styles.header,
            { backgroundColor: colors.bg, borderBottomColor: colors.border },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as unknown as ViewStyle)
              : {},
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
            numberOfLines={1}
          >
            Events Tickets
          </Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(6) : spacing(2),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(10) : spacing(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {loadState === "loading" && (
          <View style={styles.statePanel}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={[styles.stateText, { color: colors.inkMuted }]}>Loading events…</Text>
          </View>
        )}
        {loadState === "error" && (
          <View style={styles.statePanel}>
            <Feather name="alert-circle" size={28} color={colors.inkMuted} />
            <Text style={[styles.stateText, { color: colors.inkMuted }]}>{errorMessage}</Text>
            <Pressable
              style={[styles.retryBtn, { backgroundColor: colors.gold }]}
              onPress={() => {
                setLoadState("loading");
                setRetryKey((value) => value + 1);
              }}
            >
              <Text style={[styles.retryText, { color: colors.black }]}>Try again</Text>
            </Pressable>
          </View>
        )}
        {loadState === "ready" && items.length === 0 && (
          <View style={styles.statePanel}>
            <Feather name="calendar" size={28} color={colors.inkMuted} />
            <Text style={[styles.stateText, { color: colors.inkMuted }]}>No events are available yet.</Text>
          </View>
        )}
        {loadState === "ready" && items.length > 0 && (
          <View style={styles.board}>
            {columns.map((column, columnIndex) => (
              <View key={columnIndex} style={styles.column}>
                {column.map((event) => (
                  <Pressable
                    key={event.id}
                    style={styles.pinWrap}
                    onPress={() => onSelectTicket?.(event)}
                  >
                    <View
                      style={[
                        styles.pinCard,
                        { backgroundColor: colors.surface, shadowColor: colors.shadow },
                      ]}
                    >
                      <View style={styles.imageWrap}>
                        <Image
                          source={event.image}
                          style={styles.pinImage}
                          resizeMode="cover"
                        />
                        <View style={styles.saveOverlay}>
                          <Pressable
                            style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                            onPress={() => onSelectTicket?.(event)}
                          >
                            <Text
                              style={[
                                styles.saveText,
                                { color: colors.white, fontFamily: fontFamilies.bodySemi },
                              ]}
                            >
                              Get Ticket
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.pinBody}>
                        <Text
                          style={[
                            styles.pinTitle,
                            { color: colors.ink, fontFamily: fontFamilies.display },
                          ]}
                          numberOfLines={2}
                        >
                          {event.title}
                        </Text>
                        <Text
                          style={[
                            styles.pinSubtitle,
                            { color: colors.inkMuted, fontFamily: fontFamilies.body },
                          ]}
                          numberOfLines={1}
                        >
                          {event.subtitle}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
    fontFamily: fontFamilies.display,
  },
  board: {
    flexDirection: "row",
    gap: spacing(3),
    alignItems: "flex-start",
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
  },
  column: { flex: 1, gap: spacing(3) },
  pinWrap: { width: "100%", marginBottom: spacing(3) },
  pinCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: { position: "relative", width: "100%" },
  pinImage: { width: "100%", height: 300 },
  saveOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: spacing(3),
  },
  saveBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.full,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  saveText: { fontSize: 13 },
  pinBody: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(3),
    paddingBottom: spacing(3.5),
    gap: 4,
  },
  pinTitle: { fontSize: 14, lineHeight: 18 },
  pinSubtitle: { fontSize: 12 },
  statePanel: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(3),
    minHeight: 280,
    padding: spacing(6),
  },
  stateText: { fontSize: 14, textAlign: "center" },
  retryBtn: {
    borderRadius: radii.full,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2.5),
  },
  retryText: { fontSize: 13, fontFamily: fontFamilies.bodySemi },
});
