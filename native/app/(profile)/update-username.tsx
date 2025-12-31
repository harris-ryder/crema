import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing } from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Theme, type, useTheme } from "@/src/design";
import { Input } from "@/components/Input";
import { MaterialIcons } from "@expo/vector-icons";
import useDebounceNameChecker from "./hooks/use-debounce-name-checker";

export default function UsernameSetup() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { header, getMe } = useAuth();
  const { validationStatus, validateName } = useDebounceNameChecker();
  const [username, setUsername] = useState("");
  const [usernameUpdateStatus, setUsernameUpdateStatus] = useState<
    "loading" | "error" | "idle"
  >("idle");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lastValidationStatus = useRef(validationStatus);

  useEffect(() => {
    // Only animate if the status actually changed
    if (lastValidationStatus.current === validationStatus) {
      return;
    }
    
    lastValidationStatus.current = validationStatus;
    
    if (validationStatus === "idle") {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else if (validationStatus === "valid" || validationStatus === "invalid" || validationStatus === "error") {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, [validationStatus, fadeAnim]);

  const handleUpdateUsername = async () => {
    try {
      const res = await client.users.username.$put(
        {
          json: { username: username.trim() },
        },
        { headers: header }
      );

      const response = await res.json();

      if (response.success) {
        router.back();
      }
    } catch (error) {
      console.error("Username update error:", error);
      setUsernameUpdateStatus("error");
    } finally {
      setUsernameUpdateStatus("idle");
      await getMe();
    }
  };

  // Always render a View for the icon slot, but change its contents
  const ValidationIconSlot = () => {
    return (
      <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
        {validationStatus === "valid" && (
          <MaterialIcons
            name="check"
            size={24}
            color={theme.colors.brand.green}
          />
        )}
        {(validationStatus === "invalid" || validationStatus === "error") && (
          <MaterialIcons
            name="close"
            size={24}
            color={theme.colors.brand.red}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Choose{"\n"}your{"\n"}username
        </Text>

        <View style={styles.inputContainer}>
          <Input
            size="lg"
            onChangeText={async (text) => {
              await validateName(text);
              setUsername(text);
            }}
            placeholder="Enter your username"
            placeholderTextColor={theme.colors.content.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={false}
            maxLength={30}
            right={<ValidationIconSlot />}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={{ alignSelf: "flex-end" }}>
            <Button
              variant="primary"
              size="lg"
              label={
                usernameUpdateStatus === "loading" ? "Updating" : "Continue"
              }
              onPress={handleUpdateUsername}
              disabled={
                usernameUpdateStatus === "loading" ||
                validationStatus === "invalid" ||
                validationStatus === "idle" ||
                validationStatus === "error"
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: "auto",
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 36,
      paddingVertical: 64,
      justifyContent: "space-between",
    },
    title: {
      ...type.heading1,
      color: theme.colors.content.primary,
    },
    inputContainer: {
      marginBottom: 30,
    },
    iconContainer: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    helperText: {
      fontSize: 14,
      marginTop: 8,
    },
    buttonContainer: {
      gap: 15,
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
  });
