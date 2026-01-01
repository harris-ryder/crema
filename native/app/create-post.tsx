import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import config from "@/config";
import { useAuth } from "@/contexts/auth-context";
import * as Localization from "expo-localization";
import { Button } from "@/components/Button";

function getPostTz(): string {
  // Expo gives IANA tz like "Europe/London" on iOS; Android usually too.
  const tz = Localization.getCalendars()?.[0]?.timeZone;

  // Fallback to Intl (sometimes better depending on platform/runtime)
  if (typeof tz === "string" && tz.length) return tz;

  try {
    const intlTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof intlTz === "string" && intlTz.length) return intlTz;
  } catch {}

  return "UTC";
}

export default function CreatePost() {
  const { header } = useAuth();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreatePost = async () => {
    if (!imageUri) {
      setError("No image selected");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const postTz = getPostTz();

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "post.jpg",
      } as any);
      formData.append("description", description.trim());
      formData.append("postTz", postTz);

      const response = await fetch(`${config.urls.backend}/posts`, {
        method: "POST",
        headers: header,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      router.back();
    } catch (error) {
      console.error("Post creation error:", error);
      setError("Failed to create post");
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
        <View style={styles.imageContainer}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setError("");
            }}
            placeholder="What's happening?"
            placeholderTextColor="#666"
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus={false}
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {description.length}/500 characters
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            label={isLoading ? "Posting..." : "Share Post"}
            onPress={handleCreatePost}
          />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffd33d" />
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ffd33d",
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
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
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
