import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
    Platform,
} from "react-native";
import { useLumTheme } from "../theme/ThemeContext";
import { fontFamilies, radii, spacing } from "../theme/tokens";

const TYPES = [
  { label: "Event", icon: "calendar" as const, desc: "Concerts, festivals, shows" },
  { label: "Bus Route", icon: "truck" as const, desc: "Intercity & shuttle services" },
  { label: "Courier", icon: "package" as const, desc: "Delivery & logistics" },
  { label: "Ticket", icon: "bookmark" as const, desc: "General admission passes" },
];

export default function Create() {
  const { colors } = useLumTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [selectedType, setSelectedType] = useState(0);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [price, setPrice] = useState("");

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
          Create
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? spacing(6) : spacing(3),
          paddingTop: spacing(4),
          paddingBottom: isDesktop ? spacing(10) : spacing(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Type selector cards */}
        <View style={styles.typeGrid}>
          {TYPES.map((type, index) => {
            const isSelected = index === selectedType;
            return (
              <Pressable
                key={type.label}
                onPress={() => setSelectedType(index)}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: isSelected ? colors.gold : colors.surface,
                    borderColor: isSelected ? colors.gold : colors.border,
                  },
                ]}
              >
                <Feather
                  name={type.icon}
                  size={24}
                  color={isSelected ? colors.black : colors.ink}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: isSelected ? colors.black : colors.ink,
                      fontFamily: fontFamilies.bodySemi,
                    },
                  ]}
                >
                  {type.label}
                </Text>
                <Text
                  style={[
                    styles.typeDesc,
                    {
                      color: isSelected ? colors.black + "CC" : colors.inkMuted,
                      fontFamily: fontFamilies.body,
                    },
                  ]}
                >
                  {type.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Upload area */}
        <View
          style={[
            styles.uploadBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.uploadCircle,
              { backgroundColor: colors.bgAlt },
            ]}
          >
            <Feather name="image" size={32} color={colors.inkMuted} />
          </View>
          <Text
            style={[
              styles.uploadText,
              { color: colors.inkMuted, fontFamily: fontFamilies.body },
            ]}
          >
            Drag and drop or click to upload
          </Text>
          <Text
            style={[
              styles.uploadHint,
              { color: colors.inkMuted + "99", fontFamily: fontFamilies.body },
            ]}
          >
            Recommendation: Use high-quality .jpg files less than 20MB
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Title
            </Text>
            <TextInput
              placeholder="Add a title"
              placeholderTextColor={colors.inkMuted}
              value={title}
              onChangeText={setTitle}
              style={[
                styles.input,
                {
                  color: colors.ink,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  fontFamily: fontFamilies.body,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Description
            </Text>
            <TextInput
              placeholder="Tell people more about this"
              placeholderTextColor={colors.inkMuted}
              value={detail}
              onChangeText={setDetail}
              multiline
              numberOfLines={4}
              style={[
                styles.textarea,
                {
                  color: colors.ink,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  fontFamily: fontFamilies.body,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                { color: colors.ink, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Price (MWK)
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={colors.inkMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  color: colors.ink,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  fontFamily: fontFamilies.body,
                },
              ]}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[
              styles.publishBtn,
              { backgroundColor: colors.gold },
            ]}
          >
            <Text
              style={[
                styles.publishText,
                { color: colors.white, fontFamily: fontFamilies.bodySemi },
              ]}
            >
              Publish
            </Text>
          </Pressable>
        </View>
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
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(3),
    marginBottom: spacing(5),
  },
  typeCard: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(4),
    gap: spacing(2),
    alignItems: "flex-start",
  },
  typeLabel: {
    fontSize: 15,
  },
  typeDesc: {
    fontSize: 12,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radii.xl,
    paddingVertical: spacing(10),
    paddingHorizontal: spacing(6),
    alignItems: "center",
    gap: spacing(3),
    marginBottom: spacing(5),
  },
  uploadCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 16,
  },
  uploadHint: {
    fontSize: 12,
  },
  form: {
    gap: spacing(4),
    marginBottom: spacing(5),
  },
  field: {
    gap: spacing(1.5),
  },
  label: {
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  publishBtn: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: radii.full,
  },
  publishText: {
    fontSize: 15,
  },
});