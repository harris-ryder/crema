import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme, Theme } from "@/src/design";
import { useAuth, loadAuthToken } from "@/contexts/auth-context";
import config from "../../config";
import { PenIcon } from "@/src/ui/icons";
import LatteArtIcon from "@/src/ui/icons/latte-art-icon";

interface PhotoSelectorProps {
  isVisible?: boolean;
  onPhotoSelected?: (uri: string) => void;
}

const postImage = async (imageUri: string) => {
  const token = await loadAuthToken();

  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "profile.jpg",
  } as any);

  const response = await fetch(
    `${config.urls.backend}/images/users/profile-picture`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const result = await response.json();

  if (result.success) {
    return result;
  } else {
    throw new Error("Failed to update image");
  }
};

export default function PhotoSelector({
  isVisible = true,
  onPhotoSelected,
}: PhotoSelectorProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const [imageVersion, setImageVersion] = useState(0);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (isVisible) {
      // Fade in and translate down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          delay: 700,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          delay: 700,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    } else {
      // Fade out and translate up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(translateYAnim, {
          toValue: -50,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, translateYAnim]);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const response = await postImage(result.assets[0].uri);
        if (response.success) {
          setLocalImageUri(result.assets[0].uri);
          setImageVersion((prev) => prev + 1);
          onPhotoSelected?.(result.assets[0].uri);
        }
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }
  };

  let imageUri =
    localImageUri ||
    (user?.id
      ? `${config.urls.backend}/images/users/${user.id}?v=${imageVersion}`
      : null);

  imageUri = null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <View style={styles.photoContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <LatteArtIcon
              width={180}
              height={180}
              fill={theme.colors.surface.tertiary}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={pickImageAsync}
          activeOpacity={0.7}
        >
          <PenIcon width={24} height={24} fill={theme.colors.surface.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginLeft: -128,
      marginTop: -128,
      zIndex: 1,
    },
    photoContainer: {
      width: 256,
      height: 256,
      position: "relative",
    },
    photo: {
      width: 256,
      height: 256,
      borderRadius: 128,
    },
    photoPlaceholder: {
      width: 256,
      height: 256,
      borderRadius: 128,
      backgroundColor: theme.colors.surface.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    addPhotoButton: {
      position: "absolute",
      bottom: 10,
      right: 10,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surface.onPrimary,
      justifyContent: "center",
      alignItems: "center",
    },
  });
