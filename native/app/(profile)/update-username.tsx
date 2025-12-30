import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Theme, type, useTheme } from "@/src/design";
import { Input } from "@/components/Input";

export default function UsernameSetup() {
  const { user, header, getMe } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [username, setUsername] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");

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
      setError("Failed to update username");
    } finally {
      setIsLoading(false);
      await getMe();
    }
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
            value={username}
            onChangeText={(text: string) => {
              setUsername(text);
              setError("");
            }}
            placeholder="Enter your username"
            placeholderTextColor={theme.colors.content.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            maxLength={30}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.buttonContainer}>
          <View style={{ alignSelf: "flex-end" }}>
            <Button
              variant="primary"
              size="lg"
              label={isLoading ? "Updating..." : "Continue"}
              onPress={handleUpdateUsername}
            />
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.brand.red} />
          </View>
        )}
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
    input: {
      backgroundColor: theme.colors.surface.inverse,
      padding: 15,
      borderRadius: 8,
      fontSize: 16,
      color: theme.colors.content.inverse,
      marginBottom: 8,
    },
    hint: {
      fontSize: 12,
      color: theme.colors.content.tertiary,
      marginBottom: 5,
    },
    error: {
      fontSize: 14,
      color: theme.colors.brand.red,
      marginTop: 5,
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
