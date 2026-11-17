import { FlatList, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const REGISTERS = [
  { type: "opd", label: "OPD" },
  { type: "biochemistry", label: "Biochemistry" },
  { type: "entry", label: "Entry" },
  { type: "stock", label: "Stock" },
  { type: "fmd", label: "FMD" },
  { type: "bird-flu", label: "Bird Flu" },
  { type: "brucella-rbpt", label: "Brucella RBPT" },
  { type: "brucella-sero", label: "Brucella Sero" },
  { type: "abst", label: "AbSt" },
  { type: "dispatch", label: "Dispatch" },
  { type: "ledger", label: "Ledger" },
  { type: "daily-expenditure", label: "Daily Expenditure" },
];

export default function RegistersScreen() {
  const router = useRouter();

  return (
    <FlatList
      data={REGISTERS}
      keyExtractor={(item) => item.type}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => router.push(`/register/${item.type}`)}
        >
          <Text style={styles.rowText}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rowText: { fontSize: 16 },
  chevron: { fontSize: 20, color: "#9ca3af" },
});
