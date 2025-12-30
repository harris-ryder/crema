import { type, useTheme } from "@/src/design";
import { Theme } from "@/src/design/theme";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type InputSize = "sm" | "md" | "lg";

type Props = Omit<TextInputProps, "style"> & {
  size?: InputSize;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;

  left?: React.ReactNode;
  right?: React.ReactNode;

  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
};

type InputStyles = {
  container: ViewStyle;
  input: TextStyle;
  helper: TextStyle;
  errorText: TextStyle;
  focusedRing: ViewStyle;
  errorRing: ViewStyle;
  disabled: ViewStyle;
};

const INPUT_SIZES: Record<
  InputSize,
  { minHeight: number; px: number; py: number }
> = {
  sm: { minHeight: 36, px: 12, py: 8 },
  md: { minHeight: 44, px: 12, py: 10 },
  lg: { minHeight: 60, px: 24, py: 0 },
};

function withAlpha(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function getInputStyles(theme: Theme): InputStyles {
  const focusRing = withAlpha(theme.colors.content.primary, 0.18);

  return {
    container: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: theme.spacing[6],
      backgroundColor: theme.colors.surface.onPrimary,
    },
    input: {
      ...type.body,
      flex: 1,
      minWidth: 0,
      color: theme.colors.content.primary,
      includeFontPadding: false,
      ...(Platform.OS === "android"
        ? { textAlignVertical: "center" as const }
        : null),
    },
    helper: {
      ...type.weak,
      color: theme.colors.content.tertiary,
      marginTop: theme.spacing[1.5],
    },
    errorText: {
      ...type.weak,
      color: theme.colors.brand.red,
      marginTop: theme.spacing[1.5],
    },
    focusedRing: {
      borderColor: theme.colors.content.primary,
      // “ring” effect:
      shadowColor: focusRing,
      shadowOpacity: 1,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    errorRing: {
      borderColor: theme.colors.brand.red,
      shadowColor: withAlpha(theme.colors.brand.red, 0.25),
      shadowOpacity: 1,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    disabled: {
      opacity: 0.55,
    },
  };
}

export function Input({
  size = "md",
  disabled = false,
  error = false,
  helperText,
  left,
  right,
  containerStyle,
  inputStyle,
  editable,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...props
}: Props) {
  const theme = useTheme();
  const stylesForTheme = getInputStyles(theme);

  const [focused, setFocused] = React.useState(false);
  const isDisabled = disabled || editable === false;

  const sizeTokens = INPUT_SIZES[size];

  return (
    <View style={{ width: "100%" }}>
      <View
        style={[
          stylesForTheme.container,
          {
            minHeight: sizeTokens.minHeight,
            paddingHorizontal: sizeTokens.px,
            paddingVertical: sizeTokens.py,
            gap: theme.spacing[2], // 8
          },
          focused && !isDisabled && !error ? stylesForTheme.focusedRing : null,
          error ? stylesForTheme.errorRing : null,
          isDisabled ? stylesForTheme.disabled : null,
          containerStyle,
        ]}
      >
        {left ? <View style={base.slot}>{left}</View> : null}

        <TextInput
          {...props}
          editable={!isDisabled}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={
            placeholderTextColor ?? theme.colors.content.tertiary
          }
          style={[stylesForTheme.input, inputStyle]}
          accessibilityState={{ disabled: isDisabled }}
          // for "invalid" semantics
          accessibilityHint={error ? "Invalid input" : undefined}
        />

        {right ? <View style={base.slot}>{right}</View> : null}
      </View>

      {helperText ? (
        <Text style={error ? stylesForTheme.errorText : stylesForTheme.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const base = StyleSheet.create({
  slot: {
    alignItems: "center",
    justifyContent: "center",
  },
});
