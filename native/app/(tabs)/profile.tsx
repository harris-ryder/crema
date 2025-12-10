import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { loadAuthToken, useAuth } from "@/contexts/auth-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import config from "../../config";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { router } from "expo-router";

const postImage = async (imageUri: string) => {
  const token = await loadAuthToken();

  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "profile.jpg",
  } as any);

  const response = await fetch(
    `${config.urls.backend}/images/users/profile-picture`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  console.log("response", response);

  const result = await response.json();

  if (result.success) {
    return result;
  } else {
    throw new Error("Failed to update image");
  }
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const [imageVersion, setImageVersion] = useState(0);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const response = await postImage(result.assets[0].uri);
        if (response.success) {
          setImageVersion((prev) => prev + 1); // Increment to trigger cache bust
        }
      } catch (error) {
        // Handle upload error silently or show user feedback
      }
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user.id ? (
            <Image
              source={{
                uri: `${config.urls.backend}/images/users/${user.id}?v=${imageVersion}`,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#666" />
            </View>
          )}
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={pickImageAsync}
          >
            <Ionicons name="add" size={20} color="#25292e" />
          </TouchableOpacity>
        </View>

        <Text style={styles.username}>@{user.username || "username"}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#8b8e92" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email || "Not provided"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => router.push("/(profile)/update-username")}
        >
          <Ionicons name="person-outline" size={20} color="#8b8e92" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>@{user.username || "Not set"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8b8e92" />
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Ionicons name="id-card-outline" size={20} color="#8b8e92" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user.id || "Unknown"}</Text>
          </View>
        </View>

        {user.created_at && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#8b8e92" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  text: {
    color: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2f35",
  },
  avatarContainer: {
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#ffd33d",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2a2f35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffd33d",
  },
  displayName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: "#8b8e92",
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2f35",
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#8b8e92",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: "#fff",
  },
  actionSection: {
    padding: 20,
    gap: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 15,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff4444",
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffd33d",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#25292e",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
