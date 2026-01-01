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
import config from "../../config";
import { router } from "expo-router";
import { Theme, useTheme, type } from "@/src/design";
import { CoffeeCupIcon, LatteArtIcon } from "@/src/ui/icons";
import { createTokenSchema } from "@server/helpers/token";

export default function Profile() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);

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
        <View style={styles.profileInfo}>
          <View style={styles.profileNames}>
            <Text style={type.heading1}>Harris</Text>
            <Text style={[type.body, { color: theme.colors.content.tertiary }]}>
              {user.username}
            </Text>
          </View>
          <Text style={[type.body, { color: theme.colors.content.primary }]}>
            {user.bio || "bio empty"}
          </Text>
          <View
            style={{ flexDirection: "row", alignContent: "center", gap: 4 }}
          >
            <CoffeeCupIcon fill={theme.colors.content.primary} />
            <Text style={[type.body, { color: theme.colors.content.primary }]}>
              7 coffees made
            </Text>
          </View>
        </View>
        {user.id ? (
          <Image
            source={{
              uri: `${config.urls.backend}/images/users/${user.id}`,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <LatteArtIcon
              width={32}
              height={32}
              fill={theme.colors.surface.tertiary}
            />
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#8b8e92" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            {/* <Text style={styles.infoValue}>{user.email || "Not provided"}</Text> */}
          </View>
        </View>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => router.push("/(profile)/profile-setup")}
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

        {/* {user.created_at && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#8b8e92" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )} */}
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
    },
    container: {
      flex: 1,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: 36,
      paddingVertical: 64,
    },
    profileInfo: {
      flexDirection: "column",
      gap: 12,
      justifyContent: "flex-start",
    },
    profileNames: {
      flexDirection: "column",
      gap: 0,
      justifyContent: "flex-start",
    },
    avatar: {
      width: 96,
      height: 112,
      borderRadius: 48,
    },
    avatarPlaceholder: {
      width: 96,
      height: 112,
      borderRadius: 48,
      backgroundColor: theme.colors.surface.tertiary,
      justifyContent: "center",
      alignItems: "center",
    },
    displayName: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 5,
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
