import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "DiagnoLIS" }} />
        <Stack.Screen name="registers" options={{ title: "Registers" }} />
        <Stack.Screen name="register/[type]" options={{ title: "Register" }} />
      </Stack>
    </QueryClientProvider>
  );
}
