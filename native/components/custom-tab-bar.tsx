import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Theme, useTheme } from "@/src/design";
import CoffeeCupIcon from "@/src/ui/icons/coffee-cup-icon";
import HeartIcon from "@/src/ui/icons/heart-icon";
import ProfileIcon from "@/src/ui/icons/profile-icon";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const styles = createStyles(theme);

  useEffect(() => {
    // Calculate position based on active tab
    const tabWidth = 218 / 3; // Total width divided by number of tabs
    const offset = tabWidth;
    translateX.value = withTiming(state.index * tabWidth - offset, {
      duration: 200,
    });
  }, [state.index]);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const renderIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused
      ? theme.colors.content.primary
      : theme.colors.content.inverse;

    switch (routeName) {
      case "index":
        return <CoffeeCupIcon width={24} height={24} fill={iconColor} />;
      case "activity":
        return <HeartIcon width={24} height={24} fill={iconColor} />;
      case "profile":
        return <ProfileIcon width={24} height={24} fill={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar]}>
        <View style={styles.activeBackgroundContainer}>
          <Animated.View
            style={[styles.activeBackground, animatedBackgroundStyle]}
          />
        </View>

        {/* Tab buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.iconContainer}>
                {renderIcon(route.name, isFocused)}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 48,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    tabBar: {
      flexDirection: "row",
      position: "relative",
      height: 60,
      borderRadius: 999,
      paddingHorizontal: 4,
      alignItems: "center",
      shadowOpacity: 0,
      overflow: "hidden",
      backgroundColor: theme.colors.surface.onPrimary,
    },
    activeBackgroundContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      inset: 0,
    },
    activeBackground: {
      width: 72,
      height: 52,
      borderRadius: 99,
      backgroundColor: theme.colors.surface.primary,
    },
    tab: {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      zIndex: 1,
    },
    iconContainer: {
      width: 72,
      height: 52,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
  });
