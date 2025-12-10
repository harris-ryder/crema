import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import config from "@/config";
import { InferResponseType } from "hono/client";

export default function Index() {
  const { header } = useAuth();
  const [posts, setPosts] = useState<
    InferResponseType<typeof client.posts.$get>["posts"]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/create-post",
        params: { imageUri: result.assets[0].uri },
      });
    } else {
      alert("You did not select any image.");
    }
  };

  const fetchPosts = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
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
      } else {
        setIsLoading(false);
      }
    }
  };

  const onRefresh = () => {
    console.log("Pull to refresh triggered");
    fetchPosts(true);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#ffd33d"]}
          tintColor="#ffd33d"
          progressBackgroundColor="#25292e"
        />
      }
      bounces={true}
      alwaysBounceVertical={true}
    >
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Create Post" onPress={pickImageAsync} />
      </View>

      <View style={styles.postsContainer}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              {/* <Text style={styles.username}>
                @{post.user?.username || "user"}
              </Text> */}
              <Text style={styles.timestamp}>
                {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </View>

            {post.image_uri && (
              <Image
                source={{
                  uri: `${config.urls.backend}/images/posts/${post.id}`,
                }}
                style={styles.postImage}
              />
            )}

            {post.description && (
              <Text style={styles.postDescription}>{post.description}</Text>
            )}
          </View>
        ))}

        {posts.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No posts yet. Create the first one!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 120,
    minHeight: "100%",
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  postsContainer: {
    paddingHorizontal: 15,
  },
  postCard: {
    backgroundColor: "#2a2f35",
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffd33d",
  },
  timestamp: {
    fontSize: 12,
    color: "#8b8e92",
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 12,
  },
  postDescription: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#8b8e92",
    textAlign: "center",
  },
});
