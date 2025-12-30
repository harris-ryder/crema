import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuth } from "@/contexts/auth-context";
import HeartIcon from "@/src/ui/icons/HeartIcon";
import { type, useTheme } from "@/src/design";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "157821791942-m36u8iqssodtm9440adgr8noq3vmut9m.apps.googleusercontent.com",
  scopes: ["profile", "email"],
  offlineAccess: false,
  forceCodeForRefreshToken: true,
});

export default function SignInScreen() {
  const { googleSignIn, isLoading, errors } = useAuth();
  const theme = useTheme();

  const handleGoogleSignIn = async () => {
    try {
      // Check if device has Google Play services
      await GoogleSignin.hasPlayServices();

      // Sign out any existing session to force account selection
      await GoogleSignin.signOut();

      // Initiate sign-in process
      const userInfo = await GoogleSignin.signIn();

      // Process the sign-in with your backend
      if (userInfo.data?.idToken) {
        await googleSignIn(userInfo.data.idToken);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("User cancelled the login flow");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("Sign in is in progress already");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play services not available or outdated");
            break;
          default:
            console.error("Google Sign-In error:", error);
        }
      } else {
        console.error("An error occurred during sign in:", error);
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface.primary },
      ]}
    >
      <View style={styles.content}>
        <HeartIcon width={96} height={96} fill={theme.colors.brand.red} />
        <Text
          style={[
            type.display1,
            {
              color: theme.colors.content.primary,
              fontSize: 36,
            },
          ]}
        >
          CREMA
        </Text>

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.brand.red} />
          ) : (
            <GoogleSigninButton
              style={styles.googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            />
          )}
        </View>

        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error.message}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  buttonContainer: {
    marginTop: 24,
  },
  googleButton: {
    width: 240,
    height: 48,
  },
  errorContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    color: #FF1616,
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
});
