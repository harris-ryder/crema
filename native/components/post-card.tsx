import { View, StyleSheet, Text, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";

import config from "@/config";
import { Theme, useTheme, type } from "@/src/design";

interface PostCardProps {
  post: {
    id: string;
    image_uri?: string;
    user?: {
      id?: string;
      username?: string;
      display_name?: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.postCard}>
      <View style={styles.userInfo}>
        {post.user?.id ? (
          <Image
            source={{
              uri: `${config.urls.backend}/images/users/${post.user.id}`,
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons
              name="person"
              size={20}
              color={theme.colors.content.tertiary}
            />
          </View>
        )}
        <Text style={[type.title, { color: theme.colors.content.primary }]}>
          {post.user?.display_name || post.user?.username || "user"}
        </Text>
      </View>

      {post.image_uri && (
        <Image
          source={{
            uri: `${config.urls.backend}/images/posts/${post.id}`,
          }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    postCard: {
      marginBottom: 24,
      width: "100%",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface.tertiary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    postImage: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 32,
    },
  });
