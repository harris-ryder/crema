import { StyleSheet, FlatList } from "react-native";
import { useEffect, useState, useMemo } from "react";

import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import { InferResponseType } from "hono/client";
import { Theme, useTheme } from "@/src/design";
import PostCard from "@/components/post-card";

export default function Index() {
  const { header } = useAuth();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [posts, setPosts] = useState<
    InferResponseType<typeof client.posts.$get>["posts"]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }

    try {
      const res = await client.posts.$get({}, { headers: header });
      const response = await res.json();

      if (response.success) {
        setPosts(response.posts || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const onRefresh = () => {
    fetchPosts(true);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item: post }: { item: (typeof posts)[0] }) => (
    <PostCard post={post} />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={posts}
      renderItem={renderPost}
      keyExtractor={(post) => post.id}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={5}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
      paddingHorizontal: 36,
    },
    contentContainer: {
      paddingVertical: 16,
      flexGrow: 1,
    },
  });
