import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import config from "../../config";
import { Theme, useTheme, type } from "@/src/design";
import { CoffeeCupIcon, LatteArtIcon } from "@/src/ui/icons";
import WeekCarousel from "@/components/profile/week-carousel";
import { client } from "@/api/client";
import { useEffect, useState, useCallback } from "react";
import { InferResponseType } from "hono/client";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

export type GetPostsByWeeksResponse = InferResponseType<
  typeof client.posts.weeks.$get
>;
export type UserWeeksData = Pick<GetPostsByWeeksResponse, "weeks">["weeks"];

// Create 7 empty weeks for demo/fallback
const EMPTY_WEEKS: UserWeeksData = Array.from({ length: 7 }, (_, index) => ({
  weekYear: 2024,
  weekNumber: 52 - index,
  weekStartLocalDate: `2024-12-${30 - index * 7}`,
  days: Array.from({ length: 7 }, (_, dayIndex) => ({
    localDate: `2024-12-${30 - index * 7 + dayIndex}`,
    posts: [],
  })),
}));

export default function Profile() {
  const { user, signOut, header } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [weeks, setWeeks] = useState<UserWeeksData>(EMPTY_WEEKS);

  const createPostCallback = async (date: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      // Prepare images with dates extracted from EXIF or fallback
      const imagesWithDates = result.assets.map((asset) => {
        let imageDate = date; // Default to the selected carousel date
        
        // Try to extract date from EXIF data
        if (asset.exif) {
          const exifDate = asset.exif.DateTimeOriginal || 
                          asset.exif.DateTimeDigitized || 
                          asset.exif.DateTime;
          
          if (exifDate) {
            // Convert EXIF date format "YYYY:MM:DD HH:MM:SS" to "YYYY-MM-DD"
            const dateMatch = exifDate.match(/^(\d{4}):(\d{2}):(\d{2})/);
            if (dateMatch) {
              imageDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
            }
          }
        }
        
        return {
          uri: asset.uri,
          date: imageDate,
        };
      });

      // Pass all images with their dates to create-post
      router.push({
        pathname: "/create-post",
        params: { 
          images: JSON.stringify(imagesWithDates),
          multipleMode: "true",
        },
      });
    }
  };

  const fetchUserWeeks = async () => {
    if (!user?.id || !header) return;

    try {
      const res = await client.posts[":userId"].weeks.$get(
        { param: { userId: user.id }, query: { count: "7" } },
        { headers: header }
      );

      // Check if response is ok before parsing
      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        return;
      }

      const data = await res.json();

      if (data.weeks && data.weeks.length > 0) {
        setWeeks(data.weeks);
      }
    } catch (error) {
      console.error("Error fetching user weeks:", error);
      // Keep showing fallback data on error
    }
  };

  useEffect(() => {
    fetchUserWeeks();
  }, [user?.id, header]);

  // Refetch when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    useCallback(() => {
      fetchUserWeeks();
    }, [user?.id, header])
  );

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
            <Text
              style={[type.heading1, { color: theme.colors.content.primary }]}
            >
              Harris
            </Text>
            <Text style={[type.body, { color: theme.colors.content.tertiary }]}>
              {user.username}
            </Text>
          </View>
          {/* <Text style={[type.body, { color: theme.colors.content.primary }]}>
            {user.bio || "bio empty"}
          </Text> */}
          <View
            style={{ flexDirection: "row", alignContent: "center", gap: 4 }}
          >
            <CoffeeCupIcon fill={theme.colors.content.primary} />
            <Text style={[type.body, { color: theme.colors.content.primary }]}>
              7 coffees made
            </Text>
          </View>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.surface.secondary,
                padding: 4,
                borderRadius: 99,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={signOut}
            >
              <Text
                style={[type.body, { color: theme.colors.content.primary }]}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {user.id ? (
          <Image
            source={{
              uri: `${config.urls.backend}/images/users/${user.id}?v=${user.updated_at}`,
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
        {weeks.map((week, index) => (
          <View style={{ flexDirection: "column", gap: 12 }} key={index}>
            <Text style={styles.weekText}>Week {week.weekNumber}</Text>
            <WeekCarousel createPostCallback={createPostCallback} week={week} />
          </View>
        ))}
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
      paddingTop: 64,
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
      marginTop: 32,
      flexDirection: "column",
      gap: 16,
    },
    weekText: {
      paddingLeft: 36,
      color: theme.colors.content.primary,
      ...type.title,
    },
  });
