// app/_layout.tsx
import { Stack } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { user, isLoading } = useAuth();

  if (!isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
