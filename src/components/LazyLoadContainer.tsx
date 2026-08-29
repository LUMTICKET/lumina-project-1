import { ReactNode, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLumTheme } from "../theme/ThemeContext";

export default function LazyLoadContainer({
  children,
  delay = 120,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const { colors } = useLumTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsReady(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  if (!isReady) {
    return (
      <View
        style={[
          styles.loadingWrap,
          {
            backgroundColor: colors.bg,
          },
        ]}
      >
        <View style={styles.skeletonCard}>
          <View
            style={[
              styles.skeletonImage,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          />
          <View style={styles.skeletonBody}>
            <View
              style={[
                styles.skeletonLine,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />
            <View
              style={[
                styles.skeletonLineShort,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />
            <View
              style={[
                styles.skeletonRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    minHeight: 220,
    paddingVertical: 24,
  },
  skeletonCard: {
    gap: 12,
    width: "100%",
  },
  skeletonImage: {
    height: 260,
    borderRadius: 18,
    borderWidth: 1,
    opacity: 0.75,
  },
  skeletonBody: {
    gap: 10,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.75,
  },
  skeletonLineShort: {
    width: "68%",
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.75,
  },
  skeletonRow: {
    width: "42%",
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.75,
  },
});
