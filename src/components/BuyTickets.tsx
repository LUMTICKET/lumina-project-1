import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

import BusTickets from "./BusTickets";
import EventsTickets from "./EventsTickets";
import FlightTickets from "./FlightTickets";
import PaymentPage from "./PaymentPage";
import TicketConfigPage, { PurchasePayload, TicketConfig } from "./TicketConfigPage";
import TourismTickets from "./TourismTickets";

const CATEGORIES = [
  "Bus Tickets",
  "Events Tickets",
  "Tourism Tickets",
  "Flight Tickets",
];

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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex !== null) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: selectedIndex * 180,
          animated: true,
        });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [selectedIndex]);

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
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContent}
        scrollEventThrottle={16}
        decelerationRate="normal"
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
                  transform: isSelected ? [{ scale: 1.05 }] : [{ scale: 1 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? colors.black : colors.ink,
                    fontFamily: fontFamilies.bodySemi,
                    fontWeight: isSelected ? "700" : "600",
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

export default function BuyTickets() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketConfig | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<PurchasePayload | null>(null);

  const pageScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    pageScrollRef.current?.scrollTo({
      x: selectedCategory * width,
      animated: true,
    });
  }, [selectedCategory, width]);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex >= 0 && newIndex < CATEGORIES.length) {
      setSelectedCategory(newIndex);
    }
  };

  if (purchasePayload) {
    return (
      <PaymentPage
        payload={purchasePayload}
        onClose={() => setPurchasePayload(null)}
        onComplete={() => {
          setPurchasePayload(null);
          setSelectedTicket(null);
        }}
      />
    );
  }

  if (selectedTicket) {
    return (
      <TicketConfigPage
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onNavigateToPayment={setPurchasePayload}
      />
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <CategoryTabs
        categories={CATEGORIES}
        selectedIndex={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ScrollView
        ref={pageScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        <View style={{ width, flex: 1 }}>
          <BusTickets onSelectTicket={setSelectedTicket} />
        </View>
        <View style={{ width, flex: 1 }}>
          <EventsTickets onSelectTicket={setSelectedTicket} />
        </View>
        <View style={{ width, flex: 1 }}>
          <TourismTickets onSelectTicket={setSelectedTicket} />
        </View>
        <View style={{ width, flex: 1 }}>
          <FlightTickets onSelectTicket={setSelectedTicket} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
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