import { StyleSheet, View, Text } from "react-native";

import { Theme, type, useTheme } from "@/src/design";

export default function Index() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          style={[
            type.heading1,
            {
              color: theme.colors.content.primary,
              includeFontPadding: false,
            },
          ]}
        >
          WEEK
        </Text>
        <Text
          style={[
            type.display1,
            {
              color: theme.colors.content.primary,
              includeFontPadding: false,
              marginVertical: -22,
            },
          ]}
        >
          52
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
      paddingHorizontal: 36,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    textContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: "red",
      gap: 8,
      marginTop: 50,
    },
    contentContainer: {
      paddingVertical: 16,
      flexGrow: 1,
    },
  });
