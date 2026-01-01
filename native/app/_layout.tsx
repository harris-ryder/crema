// app/_layout.tsx
import { Stack } from "expo-router";
import { useAuth, AuthProvider } from "@/contexts/auth-context";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useTheme } from "@/src/design";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    ClimateCrisis: require("../assets/fonts/ClimateCrisis.ttf"),
  });

  if (isLoading || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.surface.primary,
        }}
      >
        <ActivityIndicator color={theme.colors.brand.red} />
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
