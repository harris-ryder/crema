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
import { Theme, useTheme, type } from "@/src/design";
import { CoffeeCupIcon, LatteArtIcon } from "@/src/ui/icons";
import WeekCarousel from "@/components/profile/week-carousel";

export default function Profile() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);

  // Create 7 empty weeks for demo
  const emptyWeeks = Array.from({ length: 7 }, (_, index) => ({
    weekYear: 2024,
    weekNumber: 52 - index,
    weekStartLocalDate: `2024-12-${30 - index * 7}`,
    days: Array.from({ length: 7 }, (_, dayIndex) => ({
      localDate: `2024-12-${30 - index * 7 + dayIndex}`,
      posts: [],
    })),
  }));

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={type.body}>No user data available</Text>
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

      <View style={styles.weeksContainer}>
        {emptyWeeks.map((week, index) => (
          <WeekCarousel key={index} week={week} />
        ))}
      </View>

      <View>
        <TouchableOpacity onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text>Sign Out</Text>
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
    weeksContainer: {
      flexDirection: "column",
      gap: 16,
      paddingVertical: 20,
    },
    infoSection: {
      padding: 20,
    },
  });
