import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAuth } from "@/contexts/auth-context";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  const { user, isLoading } = useAuth();
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
      screenOptions={{
        tabBarActiveTintColor: "#25292e",
        tabBarInactiveTintColor: "#8b8e92",
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 30,
          right: 30,
          marginHorizontal: 90,
          backgroundColor: "#ffffff",
          borderRadius: 25,
          height: 70,
          paddingBottom: Platform.OS === "ios" ? 0 : 10,
          paddingTop: 10,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
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
