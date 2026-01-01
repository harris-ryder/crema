import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { CustomTabBar } from "@/components/custom-tab-bar";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/src/design";

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const theme = useTheme();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cafe" : "cafe-outline"}
              color={color}
              size={28}
              style={{ marginBottom: focused ? -3 : 0 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={28}
              style={{ marginBottom: focused ? -3 : 0 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              size={28}
              style={{ marginBottom: focused ? -3 : 0 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
