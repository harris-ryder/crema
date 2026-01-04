import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { Theme, type, useTheme } from "@/src/design";
import { client } from "@/api/client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { InferResponseType } from "hono/client";
import WeekCarousel from "@/components/profile/week-carousel";
import OthersCarousel from "@/components/home/others-carousel";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

type PostsWeeksResponse = InferResponseType<typeof client.posts.weeks.$get>;
export type GetPostsByWeeksResponse = Extract<
  PostsWeeksResponse,
  { count: number }
>;
export type MyPostsWeekData = GetPostsByWeeksResponse["myPostsByWeekDay"][0];
export type OthersWeekData =
  GetPostsByWeeksResponse["otherPostsByWeekAndUser"][0];

export default function Index() {
  const { user, header } = useAuth();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const flatListRef = useRef<FlatList>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const [myWeeks, setMyWeeks] = useState<MyPostsWeekData[]>([]);
  const [othersWeeks, setOthersWeeks] = useState<OthersWeekData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayFormatted = `${year}-${month}-${day}`;

      const imagesWithDates = result.assets.map((asset) => {
        let imageDate = todayFormatted;

        if (asset.exif) {
          const exifDate =
            asset.exif.DateTimeOriginal ||
            asset.exif.DateTimeDigitized ||
            asset.exif.DateTime;

          if (exifDate) {
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

      router.push({
        pathname: "/create-post",
        params: {
          images: JSON.stringify(imagesWithDates),
          multipleMode: "true",
        },
      });
    }
  }, []);

  const fetchWeeks = async (
    cursor?: { year: number; week: number },
    append = false,
    isRefresh = false
  ) => {
    if (!user?.id || !header) return;
    if (loading && !isRefresh) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const query: { count: string; year?: string; week?: string } = {
        count: "5",
      };
      if (cursor) {
        query.year = cursor.year.toString();
        query.week = cursor.week.toString();
      }

      const res = await client.posts.weeks.$get({ query }, { headers: header });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        return;
      }

      const data = await res.json();

      if (data.myPostsByWeekDay && data.myPostsByWeekDay.length > 0) {
        if (append) {
          setMyWeeks((prev) => [...prev, ...data.myPostsByWeekDay]);
          setOthersWeeks((prev) => [...prev, ...data.otherPostsByWeekAndUser]);
        } else {
          setMyWeeks(data.myPostsByWeekDay);
          setOthersWeeks(data.otherPostsByWeekAndUser);
        }

        if (data.next) {
          setNextCursor(data.next);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching weeks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreWeeks = () => {
    if (hasMore && !loading && nextCursor) {
      fetchWeeks(nextCursor, true);
    }
  };

  const onRefresh = useCallback(() => {
    setMyWeeks([]);
    setOthersWeeks([]);
    setHasMore(true);
    setNextCursor(null);
    fetchWeeks(undefined, false, true);
  }, []);

  useEffect(() => {
    setMyWeeks([]);
    setOthersWeeks([]);
    setHasMore(true);
    setNextCursor(null);
    fetchWeeks();
  }, [user?.id, header]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentWeekIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderWeek = useCallback(
    ({ item, index }: { item: MyPostsWeekData; index: number }) => {
      const othersWeek = othersWeeks[index];
      return (
        <View style={styles.weekContainer}>
          <View style={styles.weekSection}>
            <Text style={styles.sectionTitle}>My Week</Text>
            <WeekCarousel createPostCallback={createPostCallback} week={item} />
          </View>
          {othersWeek && Object.keys(othersWeek.userPosts).length > 0 && (
            <View style={styles.weekSection}>
              <Text style={styles.sectionTitle}>Others</Text>
              <OthersCarousel week={othersWeek} />
            </View>
          )}
        </View>
      );
    },
    [createPostCallback, othersWeeks, styles]
  );

  const renderFooter = useCallback(() => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={theme.colors.content.primary} />
      </View>
    );
  }, [loading, refreshing, styles.footerLoader, theme.colors.content.primary]);

  const currentWeek = myWeeks[currentWeekIndex];
  
  // Show loading state
  if (myWeeks.length === 0 && (loading || refreshing)) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.textContainer}>
            <Text
              style={[
                type.heading1,
                {
                  color: theme.colors.content.primary,
                  includeFontPadding: false,
                },
              ]}
            >
              WEEK
            </Text>
            <Text
              style={[
                type.display1,
                {
                  color: theme.colors.content.primary,
                  includeFontPadding: false,
                  marginVertical: -28,
                },
              ]}
            >
              --
            </Text>
          </View>
        </View>
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.content.primary}
          />
        </View>
      </View>
    );
  }

  // Show empty state
  if (myWeeks.length === 0 && !loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.textContainer}>
            <Text
              style={[
                type.heading1,
                {
                  color: theme.colors.content.primary,
                  includeFontPadding: false,
                },
              ]}
            >
              WEEK
            </Text>
            <Text
              style={[
                type.display1,
                {
                  color: theme.colors.content.primary,
                  includeFontPadding: false,
                  marginVertical: -28,
                },
              ]}
            >
              --
            </Text>
          </View>
        </View>
        <View style={styles.emptyStateContainer}>
          <Text style={[type.body, { color: theme.colors.content.tertiary }]}>
            No weeks found. Pull to refresh.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text
            style={[
              type.heading1,
              {
                color: theme.colors.content.primary,
                includeFontPadding: false,
              },
            ]}
          >
            WEEK
          </Text>
          <Text
            style={[
              type.display1,
              {
                color: theme.colors.content.primary,
                includeFontPadding: false,
                marginVertical: -28,
              },
            ]}
          >
            {currentWeek?.weekNumber || "--"}
          </Text>
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={myWeeks}
        renderItem={renderWeek}
        keyExtractor={(item, index) =>
          `${item.weekYear}-${item.weekNumber}-${index}`
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreWeeks}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.content.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        windowSize={2}
        initialNumToRender={1}
        updateCellsBatchingPeriod={500}
        getItemLayout={(data, index) => ({
          length: 520,
          offset: 520 * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
    },
    headerContainer: {
      paddingHorizontal: 36,
      paddingTop: 50,
      paddingBottom: 20,
    },
    textContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    weekContainer: {
      height: 520,
      paddingVertical: 20,
    },
    weekSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      ...type.title,
      color: theme.colors.content.primary,
      paddingLeft: 36,
      marginBottom: 12,
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
