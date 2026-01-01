import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { Button } from "@/components/Button";
import { Theme, type, useTheme } from "@/src/design";
import { Input } from "@/components/Input";
import { MaterialIcons } from "@expo/vector-icons";
import useNameValidatorAndUpdater from "./hooks/use-name-validator-and-updater";
import PhotoSelector from "./components/photo-selector";
import { router } from "expo-router";

export default function ProfileSetup() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const usernameFadeAnim = useRef(new Animated.Value(1)).current;
  const photoFadeAnim = useRef(new Animated.Value(0)).current;
  const inputWidthAnim = useRef(new Animated.Value(1)).current;
  const inputTranslateYAnim = useRef(new Animated.Value(0)).current;

  const [profileStep, setProfileStep] = useState<"name" | "photo">("name");

  // hooks
  const {
    validationStatus,
    validateName,
    updateName,
    usernameUpdateStatus,
    username,
  } = useNameValidatorAndUpdater();

  const onContinuePress = async () => {
    if (profileStep === "photo") {
      router.push("/(tabs)/profile");
      return;
    }
    // Update username on the backend, but don't block process in meantime
    // Calculate target width based on username length
    // Min width of 0.3 (30%) + dynamic width based on character count
    const targetWidth = Math.min(0.17 + username.length * 0.024, 0.9);

    // Animate transition from username to photo
    // Native animations (opacity and translate)
    Animated.parallel([
      Animated.timing(usernameFadeAnim, {
        toValue: 0,
        duration: 400,
        delay: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(photoFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(inputTranslateYAnim, {
        toValue: 160,
        duration: 400,
        delay: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    // Width animation (non-native) - start separately
    Animated.timing(inputWidthAnim, {
      toValue: targetWidth,
      duration: 400,
      useNativeDriver: false, // Required for width animation
      easing: Easing.out(Easing.ease),
    }).start();

    await updateName();
    setProfileStep("photo");
    return;
  };

  useEffect(() => {
    if (validationStatus === "idle") {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else if (
      validationStatus === "valid" ||
      validationStatus === "invalid" ||
      validationStatus === "error"
    ) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, [validationStatus, fadeAnim]);

  // Always render a View for the icon slot, but change its contents
  const ValidationIconSlot = () => {
    return (
      <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
        {validationStatus === "valid" && (
          <MaterialIcons
            name="check"
            size={24}
            color={theme.colors.brand.green}
          />
        )}
        {(validationStatus === "invalid" || validationStatus === "error") && (
          <MaterialIcons
            name="close"
            size={24}
            color={theme.colors.brand.red}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PhotoSelector isActive={profileStep === "photo"} />
      <View style={styles.content}>
        <View style={{ position: "relative" }}>
          <Text style={styles.title}>CHOOSE</Text>
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}
          >
            <Text style={styles.title}>YOUR </Text>
            <Animated.Text style={[styles.title, { opacity: photoFadeAnim }]}>
              PHOTO
            </Animated.Text>
          </View>
          <Animated.Text style={[styles.title, { opacity: usernameFadeAnim }]}>
            USERNAME
          </Animated.Text>
        </View>

        <Animated.View
          style={[
            {
              width: inputWidthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              alignSelf: "center",
            },
          ]}
        >
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [{ translateY: inputTranslateYAnim }],
              },
            ]}
          >
            <Input
              size="lg"
              onChangeText={async (text) => {
                await validateName(text);
              }}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={false}
              maxLength={30}
              right={profileStep === "name" ? <ValidationIconSlot /> : null}
            />
          </Animated.View>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <View style={{ alignSelf: "flex-end" }}>
            <Button
              variant="primary"
              size="lg"
              label={
                usernameUpdateStatus === "loading" ? "Updating" : "Continue"
              }
              onPress={onContinuePress}
              disabled={
                usernameUpdateStatus === "loading" ||
                validationStatus === "invalid" ||
                validationStatus === "idle" ||
                validationStatus === "error"
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: "auto",
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 36,
      paddingVertical: 64,
      justifyContent: "space-between",
    },
    title: {
      ...type.heading1,
      color: theme.colors.content.primary,
    },
    inputContainer: {
      marginBottom: 30,
    },
    iconContainer: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonContainer: {
      gap: 15,
    },
  });
