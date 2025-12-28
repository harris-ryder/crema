// app/_layout.tsx
import { Stack } from "expo-router";
import { useAuth, AuthProvider } from "@/contexts/auth-context";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter.ttf"),
    ClimateCrisis: require("../assets/fonts/ClimateCrisis.ttf"),
  });

  if (isLoading || !fontsLoaded) {
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
      <Stack.Screen
        name="(profile)"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
