import { View, StyleSheet, ScrollView, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import { router } from "expo-router";

import PlaceholderImage from "@/assets/images/icon.png";

export default function Index() {

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/create-post",
        params: { imageUri: result.assets[0].uri }
      });
    } else {
      alert("You did not select any image.");
    }
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.footerContainer}>
        <Button
          theme="primary"
          label="Create Post"
          onPress={pickImageAsync}
        />
      </View>
      <View style={styles.imageContainer}>
        <ImageViewer
          imgSource={PlaceholderImage}
        />
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Test Content Area</Text>
        <Text style={styles.contentText}>
          This is scrollable content to test if it appears behind the floating
          tab bar.
        </Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.featureCard}>
            <Text style={styles.featureTitle}>Feature {item}</Text>
            <Text style={styles.featureText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>More Content</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.featureCard}>
            <Text style={styles.featureTitle}>Section {item}</Text>
            <Text style={styles.featureText}>
              Keep scrolling to see if content goes behind the tab bar. This
              should be hidden when it scrolls under the floating white tab bar.
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomTestSection}>
        <Text style={styles.testText}>
          🔍 Bottom content - should scroll behind tab bar
        </Text>
        <Text style={styles.testText}>📱 Test line 1</Text>
        <Text style={styles.testText}>📱 Test line 2</Text>
        <Text style={styles.testText}>📱 Test line 3</Text>
        <Text style={styles.testText}>📱 Last visible line?</Text>
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
    alignItems: "center",
    paddingBottom: 120,
  },
  imageContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  contentSection: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
  },
  featureCard: {
    backgroundColor: "#2a2f35",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffd33d",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#aaa",
    lineHeight: 20,
  },
  bottomTestSection: {
    padding: 20,
    backgroundColor: "#1a1d21",
    marginTop: 20,
  },
  testText: {
    fontSize: 16,
    color: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
});
