import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import Button from "@/components/Button";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UsernameSetup() {
  const { user, header } = useAuth();
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Update Username</Text>
        <Text style={styles.subtitle}>
          Choose a unique username for your Crema account
        </Text>
        <Text style={styles.subtitle}>Current username: {user?.username}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError("");
            }}
            placeholder="Enter your username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            maxLength={30}
          />
          <Text style={styles.hint}>
            3-30 characters, letters, numbers, and underscores only
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            theme="primary"
            label={isLoading ? "Updating..." : "Save Username"}
            onPress={handleUpdateUsername}
          />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  error: {
    fontSize: 14,
    color: "#ff4444",
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
