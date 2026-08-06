import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

import BusTickets from "./BusTickets";
import EventsTickets from "./EventsTickets";
import FlightTickets from "./FlightTickets";
import PopularTickets from "./PopularTickets";
import TourismTickets from "./TourismTickets";

const CATEGORIES = [
  "Popular Tickets",
  "Bus Tickets",
  "Events Tickets",
  "Tourism Tickets",
  "Flight Tickets",
];

/* ------------------------------------------------------------------ */
// Category tabs component
/* ------------------------------------------------------------------ */
function CategoryTabs({
  categories,
  selectedIndex,
  onSelect,
}: {
  categories: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const { colors } = useLumTheme();

  return (
    <View
      style={[
        styles.pillsWrapper,
        {
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContent}
      >
        {categories.map((cat, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(index)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.gold : colors.bgAlt,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? colors.black : colors.ink,
                    fontFamily: fontFamilies.bodySemi,
                  },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
// Home page
/* ------------------------------------------------------------------ */
interface HomePageProps {
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

export default function HomePage({ onOpenAuth, onOpenSettings }: HomePageProps) {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const iconOffset = Platform.OS !== "web" ? { marginTop: 20 } : {};

  const renderCategoryPage = () => {
    switch (selectedCategory) {
      case 0:
        return <PopularTickets />;
      case 1:
        return <BusTickets />;
      case 2:
        return <EventsTickets />;
      case 3:
        return <TourismTickets />;
      case 4:
        return <FlightTickets />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Desktop top bar */}
      {isDesktop && (
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: colors.bg,
              borderBottomColor: colors.border,
            },
            Platform.OS === "web"
              ? ({ position: "sticky", top: 0, zIndex: 50 } as any)
              : {},
          ]}
        >
          <View style={styles.topBarInner}>
            <View
              style={[
                styles.desktopSearchBar,
                {
                  backgroundColor: colors.bgAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="search" size={20} color={colors.inkMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor={colors.inkMuted}
                selectionColor={colors.gold}
                style={[
                  styles.desktopSearchInput,
                  { color: colors.ink, fontFamily: fontFamilies.body },
                ]}
              />
            </View>

            <Pressable
              style={[styles.profilePoint, { backgroundColor: colors.bgAlt }]}
              onPress={() => onOpenAuth?.()}
            >
              <Feather name="user" size={20} color={colors.ink} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Mobile search */}
      {!isDesktop && (
        <View
          style={[
            styles.mobileSearchWrap,
            { paddingHorizontal: spacing(3), paddingTop: spacing(3) },
          ]}
        >
          <View style={styles.mobileActionRow}>
            <Pressable
              style={[
                styles.profilePoint,
                { backgroundColor: colors.bgAlt },
                iconOffset,
              ]}
              onPress={() => onOpenAuth?.()}
            >
              <Feather name="user" size={18} color={colors.ink} />
            </Pressable>

            <Pressable
              style={[
                styles.profilePoint,
                { backgroundColor: colors.bgAlt },
                iconOffset,
              ]}
              onPress={() => onOpenSettings?.()}
            >
              <Feather name="settings" size={18} color={colors.ink} />
            </Pressable>
          </View>
          <View
            style={[
              styles.mobileSearchBar,
              {
                backgroundColor: colors.bgAlt,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={20} color={colors.inkMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor={colors.inkMuted}
              selectionColor={colors.gold}
              style={[
                styles.mobileSearchInput,
                { color: colors.ink, fontFamily: fontFamilies.body },
              ]}
            />
          </View>
        </View>
      )}

      {/* Category tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        selectedIndex={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Active category page */}
      <View style={{ flex: 1 }}>{renderCategoryPage()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
  },
  topBar: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6),
  },
  topBarInner: {
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
  },
  desktopSearchBar: {
    flex: 1,
    height: 56,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  mobileSearchBar: {
    width: "100%",
    height: 50,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: 10,
  },
  desktopSearchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  mobileSearchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  profilePoint: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileSearchWrap: {
    paddingBottom: spacing(2),
    gap: spacing(2),
  },
  mobileActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing(2),
    
  },
  pillsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: spacing(3),
  },
  pillsContent: {
    paddingHorizontal: spacing(3),
    gap: spacing(2),
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    borderRadius: radii.full,
  },
  pillText: {
    fontSize: 14,
  },
});