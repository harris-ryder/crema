import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import DatePicker from "react-native-date-picker";
import config from "@/config";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/Button";
import { Theme, useTheme, type } from "@/src/design";

export default function CreatePost() {
  const { header } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { imageUri, date } = useLocalSearchParams<{
    imageUri: string;
    date: string;
  }>();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const focusAnimation = useSharedValue(0);

  // Animated styles for opacity
  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(focusAnimation.value, [0, 1], [1, 0]),
    };
  });

  // Animated styles for input position
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            focusAnimation.value,
            [0, 1],
            [0, -200] // Adjust this value based on your layout
          ),
        },
      ],
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 300 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 300 });
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCreatePost = async () => {
    if (!imageUri) {
      setError("No image selected");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "post.jpg",
      } as any);
      formData.append("description", description.trim());
      formData.append("postDate", formatDateForAPI(selectedDate));

      const response = await fetch(`${config.urls.backend}/posts`, {
        method: "POST",
        headers: header,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      router.back();
    } catch (error) {
      console.error("Post creation error:", error);
      setError("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="close"
            size={30}
            color={theme.colors.content.primary}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Animated.View style={animatedOpacityStyle}>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons
                name="calendar-month"
                size={20}
                color={theme.colors.content.primary}
              />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
          </Animated.View>

          {imageUri && (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <Animated.Image
                source={{ uri: imageUri }}
                style={[styles.selectedImage, animatedOpacityStyle]}
              />
            </TouchableWithoutFeedback>
          )}

          <DatePicker
            modal
            open={showDatePicker}
            date={selectedDate}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setSelectedDate(date);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
            maximumDate={new Date()}
            minimumDate={new Date(2020, 0, 1)}
          />

          <Animated.View style={[styles.inputWrapper, animatedInputStyle]}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setError("");
              }}
              placeholder="What's happening?"
              placeholderTextColor={theme.colors.content.tertiary}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus={false}
              maxLength={500}
              onFocus={handleFocus}
              onBlur={handleBlur}
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </Animated.View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.brand.red} />
            </View>
          )}
        </View>
        <Button
          variant="primary"
          size="lg"
          label={isLoading ? "Posting" : "Share"}
          onPress={handleCreatePost}
          style={{ position: "absolute", right: 32, bottom: 60 }}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
    },
    closeButton: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 1,
      padding: 10,
    },
    content: {
      flex: 1,
      paddingHorizontal: 36,
      justifyContent: "center",
      gap: 18,
      alignItems: "center",
      position: "relative",
    },
    imageContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    selectedImage: {
      width: 256,
      height: 256,
      borderRadius: 32,
    },
    inputContainer: {
      marginBottom: 30,
    },
    inputWrapper: {
      position: "relative",
      width: 256,
    },
    input: {
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: 24,
      width: "100%",
      borderRadius: 32,
      ...type.body,
      color: theme.colors.content.primary,
      paddingVertical: 18,
      minHeight: 60,
    },
    error: {
      ...type.body,
      color: theme.colors.brand.red,
      marginTop: 5,
    },
    buttonContainer: {
      alignItems: "flex-end",
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    dateSelector: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderRadius: 32,
      minHeight: 60,
      width: 256,
      gap: 12,
    },
    dateText: {
      ...type.body,
      color: theme.colors.content.primary,
    },
  });
