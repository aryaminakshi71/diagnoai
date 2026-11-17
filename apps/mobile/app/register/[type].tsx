import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function RegisterDetailScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type}</Text>
      <Text style={styles.subtitle}>
        Register entries will appear here. Connect this screen to the API to
        list, create, and edit records.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textTransform: "capitalize" },
  subtitle: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
});
