import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuth } from "@/contexts/auth-context";

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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Crema</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error.message}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#999",
    marginBottom: 40,
  },
  buttonContainer: {
    marginTop: 20,
  },
  googleButton: {
    width: 240,
    height: 48,
  },
  errorContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
});
