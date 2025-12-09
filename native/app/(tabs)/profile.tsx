import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

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
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#666" />
            </View>
          )}
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

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#8b8e92" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>@{user.username || "Not set"}</Text>
          </View>
        </View>

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
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffd33d",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#25292e",
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
});
