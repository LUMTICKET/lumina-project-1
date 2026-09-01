import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
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

const CONVERSATIONS = [
  {
    id: "c1",
    name: "LumTicket Support",
    message: "Your refund has been processed",
    time: "2m ago",
    unread: 1,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop",
  },
  {
    id: "c2",
    name: "Night Garden Fest",
    message: "Tickets are selling fast! Grab yours",
    time: "1h ago",
    unread: 2,
    avatar: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=100&auto=format&fit=crop",
  },
  {
    id: "c3",
    name: "ABC Transport",
    message: "Your bus departs at 6:00 AM from Jibowu",
    time: "3h ago",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop",
  },
  {
    id: "c4",
    name: "Swift Courier",
    message: "Package delivered to recipient",
    time: "5h ago",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop",
  },
  {
    id: "c5",
    name: "Burna Boy Live",
    message: "VIP tickets restocked — limited!",
    time: "1d ago",
    unread: 1,
    avatar: "https://images.unsplash.com/photo-1459749411177-047381bb3ece?w=100&auto=format&fit=crop",
  },
  {
    id: "c6",
    name: "Lagos Shuttle Co.",
    message: "Monthly pass renewal due tomorrow",
    time: "1d ago",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&auto=format&fit=crop",
  },
  {
    id: "c7",
    name: "Food & Wine Expo",
    message: "Early bird pricing ends tonight",
    time: "2d ago",
    unread: 3,
    avatar: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&auto=format&fit=crop",
  },
];

export default function Messaging() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [search, setSearch] = useState("");

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.bg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: colors.ink, fontFamily: fontFamilies.display },
          ]}
        >
          Messages
        </Text>
        <Pressable style={[styles.newBtn, { backgroundColor: colors.gold }]}>
          <Feather name="edit-2" size={20} color={colors.white} />
        </Pressable>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: colors.bg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.bgAlt, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={20} color={colors.inkMuted} />
          <TextInput
            placeholder="Search messages"
            placeholderTextColor={colors.inkMuted}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.searchInput,
              { color: colors.ink, fontFamily: fontFamilies.body },
            ]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={20} color={colors.inkMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Conversations */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(6) : spacing(4),
          paddingTop: spacing(3),
          paddingBottom: isDesktop ? spacing(10) : spacing(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {CONVERSATIONS.map((conv) => (
          <Pressable
            key={conv.id}
            style={[
              styles.convCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Image source={{ uri: conv.avatar }} style={styles.avatar} />
            <View style={styles.convBody}>
              <View style={styles.convTop}>
                <Text
                  style={[
                    styles.convName,
                    { color: colors.ink, fontFamily: fontFamilies.bodySemi },
                  ]}
                >
                  {conv.name}
                </Text>
                <Text style={[styles.convTime, { color: colors.inkMuted }]}>
                  {conv.time}
                </Text>
              </View>
              <View style={styles.convBottom}>
                <Text
                  style={[
                    styles.convMessage,
                    { color: colors.inkMuted, fontFamily: fontFamilies.body },
                  ]}
                  numberOfLines={1}
                >
                  {conv.message}
                </Text>
                {conv.unread > 0 && (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: colors.gold },
                    ]}
                  >
                    <Text style={[styles.unreadText, { color: colors.white }]}>
                      {conv.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  newBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
  },
  searchBar: {
    width: "100%",
    height: 50,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  convCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(3),
    marginBottom: spacing(2.5),
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
  },
  convBody: {
    flex: 1,
    gap: 4,
  },
  convTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  convName: {
    fontSize: 15,
  },
  convTime: {
    fontSize: 12,
  },
  convBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing(2),
  },
  convMessage: {
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
  },
});