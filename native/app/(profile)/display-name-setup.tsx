import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Button } from "@/components/Button";
import { Theme, type, useTheme } from "@/src/design";
import { Input } from "@/components/Input";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";

export default function DisplayNameSetup() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, header } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name || "");

  const onContinuePress = async () => {
    // Fire-and-forget API call to update display name
    if (displayName.trim() && user?.id) {
      client.users["display-name"]
        .$put(
          {
            json: { display_name: displayName.trim() },
          },
          { headers: header }
        )
        .catch((error) => {
          console.error("Failed to update display name:", error);
        });
    }

    // Navigate immediately without waiting for response
    router.push("/(profile)/username-and-photo-setup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>WHAT'S YOUR</Text>
          <Text style={styles.title}>NAME?</Text>
        </View>

        <View style={styles.inputContainer}>
          <Input
            size="lg"
            onChangeText={setDisplayName}
            value={displayName}
            placeholder="Enter your name"
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={true}
            maxLength={50}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={{ alignSelf: "flex-end" }}>
            <Button
              variant="primary"
              size="lg"
              label="Continue"
              onPress={onContinuePress}
              disabled={!displayName.trim()}
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
    titleContainer: {
      position: "relative",
    },
    title: {
      ...type.heading1,
      color: theme.colors.content.primary,
    },
    inputContainer: {
      alignSelf: "center",
      width: "100%",
      marginBottom: 30,
    },
    buttonContainer: {
      gap: 15,
    },
  });
