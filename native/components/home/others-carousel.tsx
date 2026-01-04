import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Theme, type, useTheme } from "@/src/design";
import { OthersWeekData } from "@/app/(tabs)/index";
import config from "@/config";

type OthersCarouselProps = {
  week: OthersWeekData;
};

function OthersCarousel({ week }: OthersCarouselProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const userEntries = Object.entries(week.userPosts);

  if (userEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[type.body, { color: theme.colors.content.tertiary }]}>
          No posts from others this week
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {userEntries.map(([userId, posts]) => {
        // Get the most recent post for this user
        const mostRecentPost = posts[0]; // Posts are already sorted by createdAt
        
        return (
          <TouchableOpacity
            key={userId}
            style={styles.userPostContainer}
            onPress={() => {
              // TODO: Navigate to user profile or post detail
            }}
          >
            <View style={styles.postImageContainer}>
              <Image
                source={`${config.urls.backend}/images/posts/${mostRecentPost.id}`}
                style={styles.postImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                priority="low"
                recyclingKey={`post-${mostRecentPost.id}`}
                placeholder="#E0E0E0"
              />
              {mostRecentPost.avatarUri && (
                <View style={styles.avatarContainer}>
                  <Image
                    source={`${config.urls.backend}/images/users/${userId}`}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="low"
                    recyclingKey={`avatar-${userId}`}
                    placeholder="#F0F0F0"
                  />
                </View>
              )}
            </View>
            <Text
              style={[type.caption, styles.username]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {mostRecentPost.username}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      width: "100%",
    },
    container: {
      flexDirection: "row",
      gap: 16,
      paddingHorizontal: 36,
    },
    emptyContainer: {
      paddingHorizontal: 36,
      paddingVertical: 32,
      alignItems: "center",
    },
    userPostContainer: {
      alignItems: "center",
      gap: 8,
    },
    postImageContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: "hidden",
      position: "relative",
    },
    postImage: {
      width: "100%",
      height: "100%",
    },
    avatarContainer: {
      position: "absolute",
      bottom: -4,
      right: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.surface.primary,
      padding: 2,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    username: {
      color: theme.colors.content.secondary,
      maxWidth: 80,
    },
  });

export default React.memo(OthersCarousel);