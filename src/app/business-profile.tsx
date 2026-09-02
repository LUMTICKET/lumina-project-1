import BusinessProfileContainer from "@/components/settings/BusinessProfileContainer";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function BusinessProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BusinessProfileContainer onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});