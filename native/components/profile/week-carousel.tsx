import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Theme, type, useTheme } from "@/src/design";
import { MaterialIcons } from "@expo/vector-icons";
import { UserWeeksData } from "@/app/(tabs)/profile";
import config from "@/config";

type Week = UserWeeksData[0];

type WeekCarouselProps = {
  createPostCallback: (date: string) => void;
  week: Week;
};

const DAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeekCarousel({
  createPostCallback,
  week,
}: WeekCarouselProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const todaysDate = new Date().toLocaleDateString("en-CA");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {week.days.map((day, index) => {
        const dayName = DAY_NAMES[index];
        const hasPosts = day.posts.length > 0;

        if (hasPosts) {
          const firstPost = day.posts[0];
          return (
            <View key={day.localDate} style={styles.dayWithPosts}>
              <Image
                source={{
                  uri: `${config.urls.backend}/images/posts/${firstPost.id}`,
                }}
                style={styles.postImage}
              />
            </View>
          );
        } else {
          return (
            <TouchableOpacity
              key={day.localDate}
              style={[
                styles.emptyDay,
                getEmptyDayBorderRadius(index, week),
                isFutureDay(todaysDate, day.localDate) ? { opacity: 0.5 } : {},
              ]}
              onPress={() => {
                if (isFutureDay(todaysDate, day.localDate)) {
                  return;
                }
                createPostCallback(day.localDate);
              }}
            >
              <Text
                style={[type.title, { color: theme.colors.content.primary }]}
              >
                {dayName}
              </Text>
            </TouchableOpacity>
          );
        }
      })}
      <TouchableOpacity
        style={styles.addPost}
        onPress={() => {
          createPostCallback(todaysDate);
        }}
      >
        <MaterialIcons
          name="add"
          size={24}
          color={theme.colors.content.primary}
        />
      </TouchableOpacity>
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
      gap: 3,
      paddingHorizontal: 32,
    },
    emptyDay: {
      width: 64,
      height: 96,
      backgroundColor: theme.colors.surface.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    addPost: {
      width: 64,
      height: 96,
      borderRadius: 32,
      backgroundColor: theme.colors.surface.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    dayWithPosts: {
      width: 92,
      height: 92,
      borderRadius: 46,
      overflow: "hidden",
    },
    postImage: {
      width: "100%",
      height: "100%",
    },
  });

const getAdjacentDayHasPosts = (
  dayIndex: number,
  direction: "prev" | "next",
  week: Week
) => {
  const targetIndex = direction === "prev" ? dayIndex - 1 : dayIndex + 1;
  if (targetIndex < 0 || targetIndex >= week.days.length) return false;
  return week.days[targetIndex].posts.length > 0;
};

const isFutureDay = (todaysDate: string, dayDate: string) => {
  return dayDate > todaysDate;
};

const getEmptyDayBorderRadius = (dayIndex: number, week: Week) => {
  const hasPrevPosts = getAdjacentDayHasPosts(dayIndex, "prev", week);
  const isFirstDayOfWeek = dayIndex === 0;
  const hasNextPosts = getAdjacentDayHasPosts(dayIndex, "next", week);
  const isLastDayOfWeek = dayIndex === 6;

  const borderRadii = {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  };

  // Do we need to increase left borders radius?
  if (hasPrevPosts || isFirstDayOfWeek) {
    borderRadii.borderTopLeftRadius = 32;
    borderRadii.borderBottomLeftRadius = 32;
  }

  // Do we need to increase right borders radius?
  if (hasNextPosts || isLastDayOfWeek) {
    borderRadii.borderTopRightRadius = 32;
    borderRadii.borderBottomRightRadius = 32;
  }

  return borderRadii;
};
