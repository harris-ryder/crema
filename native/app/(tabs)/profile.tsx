import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import config from "../../config";
import { Theme, useTheme, type } from "@/src/design";
import { CoffeeCupIcon, LatteArtIcon } from "@/src/ui/icons";
import HeartIcon from "@/src/ui/icons/heart-icon";
import WeekCarousel from "@/components/profile/week-carousel";
import { client } from "@/api/client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { InferResponseType } from "hono/client";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

export type GetPostsByWeeksResponse = InferResponseType<
  typeof client.posts.weeks.$get
>;
export type UserWeeksData = Pick<GetPostsByWeeksResponse, "weeks">["weeks"];

export default function Profile() {
  const { user, signOut, header } = useAuth();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams();

  const [weeks, setWeeks] = useState<UserWeeksData>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<{
    year: number;
    week: number;
  } | null>(null);

  const createPostCallback = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      // Get today's date as fallback
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayFormatted = `${year}-${month}-${day}`;

      // Prepare images with dates extracted from EXIF or fallback to today
      const imagesWithDates = result.assets.map((asset) => {
        let imageDate = todayFormatted; // Default to today's date

        // Try to extract date from EXIF data
        if (asset.exif) {
          const exifDate =
            asset.exif.DateTimeOriginal ||
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
  }, []);

  const fetchUserWeeks = async (
    cursor?: { year: number; week: number },
    append = false
  ) => {
    if (!user?.id || !header) return;
    if (loading) return;

    setLoading(true);

    try {
      const query: { count: string; year?: string; week?: string } = {
        count: "7",
      };
      if (cursor) {
        query.year = cursor.year.toString();
        query.week = cursor.week.toString();
      }

      const res = await client.posts[":userId"].weeks.$get(
        { param: { userId: user.id }, query },
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
        if (append) {
          setWeeks((prev) => [...prev, ...data.weeks]);
        } else {
          setWeeks(data.weeks);
        }

        // Set next cursor for pagination
        if (data.next) {
          setNextCursor(data.next);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching user weeks:", error);
      // Keep showing fallback data on error
    } finally {
      setLoading(false);
    }
  };

  const loadMoreWeeks = () => {
    if (hasMore && !loading && nextCursor) {
      fetchUserWeeks(nextCursor, true);
    }
  };

  useEffect(() => {
    // Initial load when user changes
    setWeeks([]);
    setHasMore(true);
    setNextCursor(null);
    fetchUserWeeks();
  }, [user?.id, header]);

  // Refetch when navigating back with refetch param
  useEffect(() => {
    if (params.refetch === "true") {
      setWeeks([]);
      setHasMore(true);
      setNextCursor(null);
      fetchUserWeeks();
      // Clear the param to prevent repeated refetches
      router.setParams({ refetch: undefined });
    }
  }, [params.refetch]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={type.body}>No user data available</Text>
      </View>
    );
  }

  const renderWeek = useCallback(
    ({ item: week, index }: { item: (typeof weeks)[0]; index: number }) => (
      <View style={{ flexDirection: "column", gap: 12 }}>
        <Text style={styles.weekText}>Week {week.weekNumber}</Text>
        <WeekCarousel createPostCallback={createPostCallback} week={week} />
      </View>
    ),
    [createPostCallback, styles.weekText]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.profileNames}>
            <Text
              style={[
                type.heading1,
                { color: theme.colors.content.primary, fontSize: 22 },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.username}
            </Text>
            <Text
              style={[type.body, { color: theme.colors.content.tertiary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.display_name}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", alignContent: "center", gap: 4 }}
          >
            <HeartIcon fill={theme.colors.content.primary} />
            <Text style={[type.body, { color: theme.colors.content.primary }]}>
              7 coffees made
            </Text>
          </View>
          <View></View>
        </View>
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.settingsIcon} onPress={signOut}>
            <MaterialIcons
              name="settings"
              size={24}
              color={theme.colors.content.primary}
            />
          </TouchableOpacity>
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
      </View>
    ),
    [user, signOut, styles, theme.colors]
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={theme.colors.content.primary} />
      </View>
    );
  }, [loading, styles.footerLoader, theme.colors.content.primary]);

  // Show heart icon when there's no data and not loading
  if (weeks.length === 0 && !loading) {
    return (
      <View style={styles.scrollContainer}>
        {renderHeader()}
        <View style={styles.emptyStateContainer}>
          <HeartIcon width={120} height={120} fill={theme.colors.brand.red} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      data={weeks}
      renderItem={renderWeek}
      keyExtractor={(item, index) =>
        `${item.weekYear}-${item.weekNumber}-${index}`
      }
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreWeeks}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={3}
      updateCellsBatchingPeriod={100}
    />
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
      marginBottom: 32,
    },
    profileInfo: {
      flexDirection: "column",
      gap: 12,
      justifyContent: "flex-start",
      flex: 1,
    },
    avatarContainer: {
      width: 96,
      height: 96,
      borderRadius: 99,
      justifyContent: "center",
      alignItems: "center",
    },
    profileNames: {
      flexDirection: "column",
      gap: 0,
      justifyContent: "flex-start",
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 99,
    },
    settingsIcon: {
      position: "absolute",
      bottom: -4,
      right: -4,
      padding: 8,
      zIndex: 2,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: 99,
    },
    avatarPlaceholder: {
      width: 96,
      height: 96,
      borderRadius: 99,
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
    footerLoader: {
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });
