import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { lightColors, darkColors } from "@/src/design/colors";
import { useColorScheme } from "react-native";

type Post = {
  id: string;
  imageUri: string;
  description: string | null;
  localDate: string;
  createdAt: string;
  postTz: string;
};

type Day = {
  localDate: string;
  posts: Post[];
};

type Week = {
  weekYear: number;
  weekNumber: number;
  weekStartLocalDate: string;
  days: Day[];
};

type WeekCarouselProps = {
  week: Week;
};

const DAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeekCarousel({ week }: WeekCarouselProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? darkColors : lightColors;

  const getAdjacentDayHasPosts = (dayIndex: number, direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? dayIndex - 1 : dayIndex + 1;
    if (targetIndex < 0 || targetIndex >= week.days.length) return false;
    return week.days[targetIndex].posts.length > 0;
  };

  const getEmptyDayBorderRadius = (dayIndex: number) => {
    const hasPrevPosts = getAdjacentDayHasPosts(dayIndex, "prev");
    const hasNextPosts = getAdjacentDayHasPosts(dayIndex, "next");

    if (hasPrevPosts && hasNextPosts) {
      return { borderRadius: 4 };
    } else if (hasPrevPosts) {
      return {
        borderTopLeftRadius: 32,
        borderBottomLeftRadius: 32,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
      };
    } else if (hasNextPosts) {
      return {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
      };
    } else {
      return { borderRadius: 4 };
    }
  };

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
                source={{ uri: firstPost.imageUri }}
                style={styles.postImage}
              />
            </View>
          );
        } else {
          return (
            <View
              key={day.localDate}
              style={[
                styles.emptyDay,
                { backgroundColor: colors.surface.onPrimary },
                getEmptyDayBorderRadius(index),
              ]}
            >
              <Text style={[styles.dayText, { color: colors.content.primary }]}>
                {dayName}
              </Text>
            </View>
          );
        }
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 0,
  },
  emptyDay: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
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